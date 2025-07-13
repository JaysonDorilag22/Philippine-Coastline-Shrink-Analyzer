const express = require('express');
const router = express.Router();
const turf = require('@turf/turf');
const Coastline = require('../models/Coastline');
const Analysis = require('../models/Analysis');

// POST /api/analysis/compare - Compare two coastlines and analyze changes
router.post('/compare', async (req, res) => {
  try {
    const { baselineCoastlineId, comparisonCoastlineId, analysisName } = req.body;

    // Fetch both coastlines
    const [baselineCoastline, comparisonCoastline] = await Promise.all([
      Coastline.findById(baselineCoastlineId),
      Coastline.findById(comparisonCoastlineId)
    ]);

    if (!baselineCoastline || !comparisonCoastline) {
      return res.status(404).json({
        success: false,
        error: 'One or both coastlines not found'
      });
    }

    // Perform geospatial analysis
    const analysisResult = await performCoastlineAnalysis(
      baselineCoastline,
      comparisonCoastline
    );

    // Create analysis record
    const analysis = new Analysis({
      name: analysisName || `${baselineCoastline.name} Analysis`,
      location: {
        region: baselineCoastline.region,
        province: baselineCoastline.province,
        municipality: baselineCoastline.municipality,
        barangay: baselineCoastline.barangay
      },
      comparison: {
        baselineYear: baselineCoastline.year,
        comparisonYear: comparisonCoastline.year,
        baselineCoastlineId,
        comparisonCoastlineId
      },
      results: analysisResult.results,
      geospatialData: analysisResult.geospatialData,
      riskAssessment: assessRisk(analysisResult.results)
    });

    await analysis.save();

    res.json({
      success: true,
      data: analysis,
      message: 'Coastline analysis completed successfully'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform coastline analysis',
      message: error.message
    });
  }
});

// GET /api/analysis - Get all analyses with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      region,
      province,
      municipality,
      riskLevel,
      minYear,
      maxYear,
      limit = 20,
      page = 1
    } = req.query;

    const query = {};
    
    if (region) query['location.region'] = new RegExp(region, 'i');
    if (province) query['location.province'] = new RegExp(province, 'i');
    if (municipality) query['location.municipality'] = new RegExp(municipality, 'i');
    if (riskLevel) query['riskAssessment.level'] = riskLevel;
    
    if (minYear || maxYear) {
      query['comparison.comparisonYear'] = {};
      if (minYear) query['comparison.comparisonYear'].$gte = parseInt(minYear);
      if (maxYear) query['comparison.comparisonYear'].$lte = parseInt(maxYear);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const analyses = await Analysis.find(query)
      .populate('comparison.baselineCoastlineId', 'name year metadata.source')
      .populate('comparison.comparisonCoastlineId', 'name year metadata.source')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-geospatialData'); // Exclude heavy geospatial data in list view

    const total = await Analysis.countDocuments(query);

    res.json({
      success: true,
      data: analyses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses',
      message: error.message
    });
  }
});

// GET /api/analysis/:id - Get specific analysis with full data
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('comparison.baselineCoastlineId')
      .populate('comparison.comparisonCoastlineId');
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis',
      message: error.message
    });
  }
});

// GET /api/analysis/statistics/overview - Get overall statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const stats = await Analysis.aggregate([
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          totalLandLoss: { $sum: '$results.landLossArea' },
          totalLandGain: { $sum: '$results.landGainArea' },
          averageAnnualLoss: { $avg: '$results.averageAnnualChange' },
          criticalAreas: {
            $sum: { $cond: [{ $eq: ['$riskAssessment.level', 'Critical'] }, 1, 0] }
          },
          highRiskAreas: {
            $sum: { $cond: [{ $eq: ['$riskAssessment.level', 'High'] }, 1, 0] }
          }
        }
      }
    ]);

    const regionStats = await Analysis.aggregate([
      {
        $group: {
          _id: '$location.region',
          analysisCount: { $sum: 1 },
          totalLoss: { $sum: '$results.landLossArea' },
          averageLoss: { $avg: '$results.percentageChange' }
        }
      },
      { $sort: { totalLoss: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byRegion: regionStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

// Helper function to perform coastline analysis using Turf.js
async function performCoastlineAnalysis(baseline, comparison) {
  try {
    // Ensure we have valid GeoJSON
    const baselineGeo = baseline.geojson;
    const comparisonGeo = comparison.geojson;

    // Convert to unified polygon format
    const baselinePolygon = unifyGeometry(baselineGeo);
    const comparisonPolygon = unifyGeometry(comparisonGeo);

    // Calculate differences
    const landLoss = turf.difference(baselinePolygon, comparisonPolygon);
    const landGain = turf.difference(comparisonPolygon, baselinePolygon);

    // Calculate areas (convert from square meters to square kilometers)
    const baselineArea = turf.area(baselinePolygon) / 1000000;
    const comparisonArea = turf.area(comparisonPolygon) / 1000000;
    const landLossArea = landLoss ? turf.area(landLoss) / 1000000 : 0;
    const landGainArea = landGain ? turf.area(landGain) / 1000000 : 0;

    const netChange = landGainArea - landLossArea;
    const percentageChange = ((comparisonArea - baselineArea) / baselineArea) * 100;
    const yearDiff = comparison.year - baseline.year;
    const averageAnnualChange = yearDiff > 0 ? netChange / yearDiff : 0;

    // Calculate affected coastline length
    const baselineLength = turf.length(turf.polygonToLine(baselinePolygon));
    
    return {
      results: {
        landLossArea: parseFloat(landLossArea.toFixed(4)),
        landGainArea: parseFloat(landGainArea.toFixed(4)),
        netChange: parseFloat(netChange.toFixed(4)),
        percentageChange: parseFloat(percentageChange.toFixed(2)),
        averageAnnualChange: parseFloat(averageAnnualChange.toFixed(4)),
        affectedLength: parseFloat(baselineLength.toFixed(2))
      },
      geospatialData: {
        lossPolygon: landLoss,
        gainPolygon: landGain,
        changePoints: [] // TODO: Implement change point detection
      }
    };
  } catch (error) {
    console.error('Analysis calculation error:', error);
    throw new Error('Failed to calculate coastline changes: ' + error.message);
  }
}

// Helper function to unify geometry to polygon
function unifyGeometry(geojson) {
  if (geojson.type === 'FeatureCollection') {
    // If it's a collection, merge all polygons
    const polygons = geojson.features
      .filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
      .map(f => f.geometry);
    
    if (polygons.length === 0) {
      throw new Error('No polygons found in FeatureCollection');
    }
    
    return polygons.length === 1 ? 
      turf.polygon(polygons[0].coordinates) : 
      turf.union(...polygons.map(p => turf.polygon(p.coordinates)));
  } else if (geojson.type === 'Feature') {
    return turf.polygon(geojson.geometry.coordinates);
  } else if (geojson.type === 'Polygon') {
    return turf.polygon(geojson.coordinates);
  } else {
    throw new Error('Unsupported geometry type: ' + geojson.type);
  }
}

// Helper function to assess risk level
function assessRisk(results) {
  const { percentageChange, averageAnnualChange } = results;
  
  let level = 'Low';
  const factors = [];
  const recommendations = [];

  // Determine risk level based on percentage change and annual rate
  if (Math.abs(percentageChange) > 10 || Math.abs(averageAnnualChange) > 0.5) {
    level = 'Critical';
    factors.push('Severe coastline erosion', 'High annual loss rate');
    recommendations.push(
      'Immediate coastal protection measures required',
      'Emergency assessment and monitoring',
      'Community relocation planning may be necessary'
    );
  } else if (Math.abs(percentageChange) > 5 || Math.abs(averageAnnualChange) > 0.2) {
    level = 'High';
    factors.push('Significant coastline changes', 'Accelerating erosion');
    recommendations.push(
      'Implement coastal protection strategies',
      'Regular monitoring and assessment',
      'Community awareness and preparedness'
    );
  } else if (Math.abs(percentageChange) > 2 || Math.abs(averageAnnualChange) > 0.1) {
    level = 'Medium';
    factors.push('Moderate coastline erosion');
    recommendations.push(
      'Monitor coastline changes regularly',
      'Consider preventive measures',
      'Engage local communities in monitoring'
    );
  } else {
    factors.push('Stable coastline conditions');
    recommendations.push(
      'Continue regular monitoring',
      'Maintain existing coastal management practices'
    );
  }

  return { level, factors, recommendations };
}

module.exports = router;

const express = require('express');
const router = express.Router();
const Coastline = require('../models/Coastline'); 

// GET /api/coastlines - Get all coastlines with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      region,
      province,
      municipality,
      year,
      minYear,
      maxYear,
      source,
      includeGeoJSON = false, // New parameter to optionally include GeoJSON
      limit = 50,
      page = 1
    } = req.query;

    // Build query object
    const query = {};
    
    if (region) query.region = new RegExp(region, 'i');
    if (province) query.province = new RegExp(province, 'i');
    if (municipality) query.municipality = new RegExp(municipality, 'i');
    if (year) query.year = parseInt(year);
    if (minYear || maxYear) {
      query.year = {};
      if (minYear) query.year.$gte = parseInt(minYear);
      if (maxYear) query.year.$lte = parseInt(maxYear);
    }
    if (source) query['metadata.source'] = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Conditionally include or exclude GeoJSON based on query parameter
    const selectFields = includeGeoJSON === 'true' ? {} : { geojson: 0 };
    
    const coastlines = await Coastline.find(query, selectFields)
      .sort({ year: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Coastline.countDocuments(query);

    res.json({
      success: true,
      data: coastlines,
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
      error: 'Failed to fetch coastlines',
      message: error.message
    });
  }
});

// GET /api/coastlines/:id - Get specific coastline with full GeoJSON
router.get('/:id', async (req, res) => {
  try {
    const coastline = await Coastline.findById(req.params.id);
    
    if (!coastline) {
      return res.status(404).json({
        success: false,
        error: 'Coastline not found'
      });
    }

    res.json({
      success: true,
      data: coastline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coastline',
      message: error.message
    });
  }
});

// GET /api/coastlines/map/data - Get coastlines with GeoJSON for map display
router.get('/map/data', async (req, res) => {
  try {
    const {
      region,
      province,
      municipality,
      year,
      minYear,
      maxYear,
      source,
      limit = 100
    } = req.query;

    // Build query object
    const query = {};
    
    if (region) query.region = new RegExp(region, 'i');
    if (province) query.province = new RegExp(province, 'i');
    if (municipality) query.municipality = new RegExp(municipality, 'i');
    if (year) query.year = parseInt(year);
    if (minYear || maxYear) {
      query.year = {};
      if (minYear) query.year.$gte = parseInt(minYear);
      if (maxYear) query.year.$lte = parseInt(maxYear);
    }
    if (source) query['metadata.source'] = source;
    
    const coastlines = await Coastline.find(query)
      .sort({ year: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: coastlines,
      count: coastlines.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch map data',
      message: error.message
    });
  }
});
// POST /api/coastlines - Create new coastline
router.post('/', async (req, res) => {
  try {
    const coastline = new Coastline(req.body);
    await coastline.save();

    res.status(201).json({
      success: true,
      data: coastline,
      message: 'Coastline created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create coastline',
      message: error.message
    });
  }
});

// PUT /api/coastlines/:id - Update coastline
router.put('/:id', async (req, res) => {
  try {
    const coastline = await Coastline.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!coastline) {
      return res.status(404).json({
        success: false,
        error: 'Coastline not found'
      });
    }

    res.json({
      success: true,
      data: coastline,
      message: 'Coastline updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update coastline',
      message: error.message
    });
  }
});

// DELETE /api/coastlines/:id - Delete coastline
router.delete('/:id', async (req, res) => {
  try {
    const coastline = await Coastline.findByIdAndDelete(req.params.id);

    if (!coastline) {
      return res.status(404).json({
        success: false,
        error: 'Coastline not found'
      });
    }

    res.json({
      success: true,
      message: 'Coastline deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete coastline',
      message: error.message
    });
  }
});

// GET /api/coastlines/locations/summary - Get location summary
router.get('/locations/summary', async (req, res) => {
  try {
    const summary = await Coastline.aggregate([
      {
        $group: {
          _id: {
            region: '$region',
            province: '$province',
            municipality: '$municipality'
          },
          count: { $sum: 1 },
          years: { $addToSet: '$year' },
          minYear: { $min: '$year' },
          maxYear: { $max: '$year' }
        }
      },
      {
        $sort: { '_id.region': 1, '_id.province': 1, '_id.municipality': 1 }
      }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get location summary',
      message: error.message
    });
  }
});

module.exports = router;

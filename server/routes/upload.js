const express = require('express');
const multer = require('multer');
const router = express.Router();
const Coastline = require('../models/Coastline');
const geojsonValidation = require('geojson-validation');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || 
        file.originalname.endsWith('.geojson') ||
        file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only GeoJSON files are allowed'), false);
    }
  }
});

// POST /api/upload/geojson - Upload GeoJSON coastline data
router.post('/geojson', upload.single('geojson'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Parse the uploaded file
    let geojsonData;
    try {
      geojsonData = JSON.parse(req.file.buffer.toString());
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON format'
      });
    }

    // Validate GeoJSON
    if (!geojsonValidation.valid(geojsonData)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GeoJSON format',
        details: geojsonValidation.isFeatureCollection(geojsonData) ? 
          'Expected FeatureCollection' : 'Invalid GeoJSON structure'
      });
    }

    // Extract metadata from request body
    const {
      name,
      region,
      province,
      municipality,
      barangay,
      year,
      source = 'Manual Upload',
      accuracy = 'Medium',
      resolution,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !region || !province || !municipality || !year) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, region, province, municipality, year'
      });
    }

    // Create new coastline record
    const coastline = new Coastline({
      name,
      region,
      province,
      municipality,
      barangay,
      year: parseInt(year),
      geojson: geojsonData,
      metadata: {
        source,
        accuracy,
        resolution,
        uploadedBy: req.body.uploadedBy || 'Anonymous',
        notes
      }
    });

    await coastline.save();

    // Return success response (without heavy GeoJSON data)
    const response = { ...coastline.toObject() };
    delete response.geojson;

    res.status(201).json({
      success: true,
      data: response,
      message: 'GeoJSON uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload GeoJSON',
      message: error.message
    });
  }
});

// POST /api/upload/batch - Upload multiple GeoJSON files
router.post('/batch', upload.array('geojson', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        // Parse file
        const geojsonData = JSON.parse(file.buffer.toString());
        
        // Validate GeoJSON
        if (!geojsonValidation.valid(geojsonData)) {
          errors.push({
            file: file.originalname,
            error: 'Invalid GeoJSON format'
          });
          continue;
        }

        // Try to extract metadata from filename or use defaults
        const metadata = extractMetadataFromFilename(file.originalname);
        const coastlineData = {
          ...metadata,
          ...req.body, // Override with explicit form data
          geojson: geojsonData,
          metadata: {
            source: req.body.source || 'Manual Upload',
            accuracy: req.body.accuracy || 'Medium',
            uploadedBy: req.body.uploadedBy || 'Anonymous'
          }
        };

        const coastline = new Coastline(coastlineData);
        await coastline.save();

        results.push({
          file: file.originalname,
          id: coastline._id,
          name: coastline.name
        });

      } catch (error) {
        errors.push({
          file: file.originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        uploaded: results,
        errors: errors,
        summary: {
          total: req.files.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Batch upload completed: ${results.length}/${req.files.length} files processed successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process batch upload',
      message: error.message
    });
  }
});

// Helper function to extract metadata from filename
function extractMetadataFromFilename(filename) {
  // Example: "Manila_Bay_2010.geojson" or "Tacloban_Coastline_2023.geojson"
  const nameWithoutExt = filename.replace(/\.(geojson|json)$/i, '');
  const parts = nameWithoutExt.split('_');
  
  // Try to extract year from filename
  const yearMatch = nameWithoutExt.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  // Create a readable name
  const name = parts.join(' ').replace(/\d{4}/, '').trim();
  
  return {
    name: name || nameWithoutExt,
    year: year,
    region: 'Unknown', // Will need to be provided in form data
    province: 'Unknown',
    municipality: 'Unknown'
  };
}

// GET /api/upload/validation/geojson - Validate GeoJSON without saving
router.post('/validate/geojson', upload.single('geojson'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided for validation'
      });
    }

    let geojsonData;
    try {
      geojsonData = JSON.parse(req.file.buffer.toString());
    } catch (error) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Invalid JSON format'
      });
    }

    const isValid = geojsonValidation.valid(geojsonData);
    const isFeatureCollection = geojsonValidation.isFeatureCollection(geojsonData);
    
    // Count features if it's a FeatureCollection
    let featureCount = 0;
    let geometryTypes = [];
    
    if (isFeatureCollection) {
      featureCount = geojsonData.features.length;
      geometryTypes = [...new Set(geojsonData.features.map(f => f.geometry.type))];
    } else if (geojsonData.type === 'Feature') {
      featureCount = 1;
      geometryTypes = [geojsonData.geometry.type];
    }

    res.json({
      success: true,
      valid: isValid,
      details: {
        type: geojsonData.type,
        isFeatureCollection,
        featureCount,
        geometryTypes,
        fileSize: req.file.size,
        filename: req.file.originalname
      },
      message: isValid ? 'Valid GeoJSON' : 'Invalid GeoJSON format'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Validation failed',
      message: error.message
    });
  }
});

module.exports = router;

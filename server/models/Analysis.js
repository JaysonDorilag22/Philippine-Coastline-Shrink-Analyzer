const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    region: { type: String, required: true },
    province: { type: String, required: true },
    municipality: { type: String, required: true },
    barangay: String
  },
  comparison: {
    baselineYear: { type: Number, required: true },
    comparisonYear: { type: Number, required: true },
    baselineCoastlineId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Coastline',
      required: true 
    },
    comparisonCoastlineId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Coastline',
      required: true 
    }
  },
  results: {
    landLossArea: {
      type: Number, // in square kilometers
      required: true
    },
    landGainArea: {
      type: Number, // in square kilometers
      default: 0
    },
    netChange: {
      type: Number, // negative = loss, positive = gain
      required: true
    },
    percentageChange: {
      type: Number, // percentage change from baseline
      required: true
    },
    averageAnnualChange: {
      type: Number, // km² per year
      required: true
    },
    affectedLength: {
      type: Number // length of affected coastline in km
    }
  },
  geospatialData: {
    lossPolygon: Object, // GeoJSON of lost areas
    gainPolygon: Object, // GeoJSON of gained areas
    changePoints: [{ // Notable change points
      coordinates: [Number],
      severity: String,
      description: String
    }]
  },
  riskAssessment: {
    level: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low'
    },
    factors: [String], // e.g., ["Storm surge", "Sea level rise", "Human activity"]
    recommendations: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
analysisSchema.index({ 'location.region': 1, 'location.province': 1 });
analysisSchema.index({ 'comparison.baselineYear': 1, 'comparison.comparisonYear': 1 });
analysisSchema.index({ 'results.percentageChange': 1 });
analysisSchema.index({ 'riskAssessment.level': 1 });

module.exports = mongoose.model('Analysis', analysisSchema);

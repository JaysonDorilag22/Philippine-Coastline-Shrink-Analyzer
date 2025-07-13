const mongoose = require('mongoose');

const coastlineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  municipality: {
    type: String,
    required: true,
    trim: true
  },
  barangay: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 10
  },
  geojson: {
    type: Object,
    required: true,
    validate: {
      validator: function(v) {
        return v.type === 'FeatureCollection' || v.type === 'Feature';
      },
      message: 'GeoJSON must be a Feature or FeatureCollection'
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['NAMRIA', 'NOAH', 'OpenStreetMap', 'Manual Upload', 'Other'],
      default: 'Manual Upload'
    },
    accuracy: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    resolution: String,
    uploadedBy: String,
    notes: String
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

// Indexes for better query performance
coastlineSchema.index({ region: 1, province: 1, municipality: 1 });
coastlineSchema.index({ year: 1 });
coastlineSchema.index({ 'metadata.source': 1 });

module.exports = mongoose.model('Coastline', coastlineSchema);

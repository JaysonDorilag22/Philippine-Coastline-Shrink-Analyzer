const mongoose = require('mongoose');
const Coastline = require('../models/Coastline'); 
const fs = require('fs');
const path = require('path');

// Sample data seeding script
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coastline_analyzer');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Coastline.deleteMany({});
    console.log('🗑️ Cleared existing coastline data');

    // Load sample GeoJSON files - Updated paths
    const sampleData = [
      {
        filePath: '../../data/geo/sample_manila_bay_2010.geojson',
        metadata: {
          name: 'Manila Bay North Coastline',
          region: 'National Capital Region',
          province: 'Metro Manila',
          municipality: 'Manila',
          barangay: 'Port Area',
          year: 2010,
          metadata: {
            source: 'NAMRIA',
            accuracy: 'High',
            resolution: '1:10,000',
            uploadedBy: 'System Seeder',
            notes: 'Sample data for demonstration purposes'
          }
        }
      },
      {
        filePath: '../../data/geo/sample_manila_bay_2023.geojson',
        metadata: {
          name: 'Manila Bay North Coastline',
          region: 'National Capital Region',
          province: 'Metro Manila',
          municipality: 'Manila',
          barangay: 'Port Area',
          year: 2023,
          metadata: {
            source: 'Project NOAH',
            accuracy: 'High',
            resolution: '1:10,000',
            uploadedBy: 'System Seeder',
            notes: 'Sample data showing coastal erosion over 13 years'
          }
        }
      }
    ];

    // Insert sample data
    for (const item of sampleData) {
      try {
        const geoJsonPath = path.join(__dirname, item.filePath);
        const geoJsonData = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));
        
        const coastline = new Coastline({
          ...item.metadata,
          geojson: geoJsonData
        });
        
        await coastline.save();
        console.log(`✅ Inserted coastline: ${item.metadata.name} (${item.metadata.year})`);
      } catch (error) {
        console.error(`❌ Failed to insert ${item.metadata.name}:`, error.message);
      }
    }

    // Add more sample locations
    const additionalSamples = [
      {
        name: 'Tacloban Coastline',
        region: 'Eastern Visayas',
        province: 'Leyte',
        municipality: 'Tacloban',
        year: 2015,
        geojson: generateSamplePolygon([125.0014, 11.2421], 0.02),
        metadata: {
          source: 'OpenStreetMap',
          accuracy: 'Medium',
          uploadedBy: 'System Seeder',
          notes: 'Post-Haiyan coastline reference'
        }
      },
      {
        name: 'Tacloban Coastline',
        region: 'Eastern Visayas',
        province: 'Leyte',
        municipality: 'Tacloban',
        year: 2024,
        geojson: generateSamplePolygon([125.0014, 11.2421], 0.018),
        metadata: {
          source: 'Manual Upload',
          accuracy: 'Medium',
          uploadedBy: 'System Seeder',
          notes: 'Recent coastline showing recovery and changes'
        }
      },
      {
        name: 'Iloilo Coastline',
        region: 'Western Visayas',
        province: 'Iloilo',
        municipality: 'Iloilo City',
        year: 2020,
        geojson: generateSamplePolygon([122.5654, 10.7202], 0.015),
        metadata: {
          source: 'NAMRIA',
          accuracy: 'High',
          uploadedBy: 'System Seeder',
          notes: 'Iloilo River delta coastline'
        }
      }
    ];

    for (const sample of additionalSamples) {
      const coastline = new Coastline(sample);
      await coastline.save();
      console.log(`✅ Inserted coastline: ${sample.name} (${sample.year})`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Total coastlines inserted: ${await Coastline.countDocuments()}`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Helper function to generate sample polygon data
function generateSamplePolygon(center, radius) {
  const [centerLon, centerLat] = center;
  const points = [];
  const numPoints = 20;
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = centerLat + radius * Math.cos(angle);
    const lon = centerLon + radius * Math.sin(angle);
    points.push([lon, lat]);
  }
  
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [points]
        }
      }
    ]
  };
}

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = seedDatabase;

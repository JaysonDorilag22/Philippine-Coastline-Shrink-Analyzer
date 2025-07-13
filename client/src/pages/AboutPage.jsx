import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Waves, 
  Target, 
  Users, 
  Database, 
  Map, 
  BarChart3, 
  Shield, 
  Clock,
  Github,
  ExternalLink,
  Mail,
  Globe
} from 'lucide-react'

const AboutPage = () => {
  const features = [
    {
      icon: Map,
      title: 'Interactive Coastline Mapping',
      description: 'Visualize past vs present coastlines using overlay comparisons with satellite imagery and shapefiles from NAMRIA, NOAH, and OpenStreetMap.'
    },
    {
      icon: Shield,
      title: 'Shrink Risk Detection',
      description: 'Automatically identify areas with visible loss of landmass and assess erosion risk levels using advanced geospatial analysis.'
    },
    {
      icon: BarChart3,
      title: 'Trend Analysis & Visualization',
      description: 'Track how much shoreline has moved inland with detailed metrics showing km² lost per year and percentage changes.'
    },
    {
      icon: Clock,
      title: 'Future Projections',
      description: 'Predict erosion rates for the next few years based on historical trends using statistical modeling and machine learning.'
    }
  ]

  const techStack = [
    {
      category: 'Frontend',
      technologies: ['React 18', 'Leaflet.js', 'Chart.js', 'Tailwind CSS', 'Vite']
    },
    {
      category: 'Backend',
      technologies: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Turf.js']
    },
    {
      category: 'GeoTools',
      technologies: ['GeoJSON', '@turf/turf', 'Shapefile parser', 'react-leaflet']
    },
    {
      category: 'Deployment',
      technologies: ['Vercel (Frontend)', 'Render (Backend)', 'MongoDB Atlas']
    }
  ]

  const dataSources = [
    {
      name: 'NAMRIA',
      description: 'National Mapping and Resource Information Authority',
      format: 'Shapefiles, GeoJSON',
      notes: 'Historical coastline data and topographic maps'
    },
    {
      name: 'Project NOAH',
      description: 'Nationwide Operational Assessment of Hazards',
      format: 'Satellite imagery, Raster data',
      notes: 'Flood maps and environmental monitoring data'
    },
    {
      name: 'OpenStreetMap',
      description: 'Collaborative mapping project',
      format: 'GeoJSON, Vector tiles',
      notes: 'Current coastline references and basemap data'
    },
    {
      name: 'PhilGEOS',
      description: 'Philippine Geoportal',
      format: 'DEM, GeoTIFF',
      notes: 'Elevation and topography data (optional)'
    }
  ]

  const roadmapItems = [
    {
      phase: 'Phase 1 (Current)',
      status: 'completed',
      items: [
        'Upload and display multiple coastline layers',
        'Overlay layers with opacity controls',
        'Basic geospatial analysis with Turf.js',
        'MongoDB storage for coastline data',
        'Interactive map with Leaflet.js'
      ]
    },
    {
      phase: 'Phase 2 (Next)',
      status: 'in-progress',
      items: [
        'Automated data sync from public repositories',
        'Advanced risk assessment algorithms',
        'Detailed analysis reports with PDF export',
        'User authentication and data management',
        'Enhanced mobile responsiveness'
      ]
    },
    {
      phase: 'Phase 3 (Future)',
      status: 'planned',
      items: [
        'Machine learning-based erosion prediction',
        'Real-time alerts and notifications',
        'Community-driven data contributions',
        'API for third-party integrations',
        'Advanced 3D visualization'
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Waves className="h-16 w-16 mx-auto mb-6 text-ocean-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Philippine Coastline Shrink Analyzer
            </h1>
            <p className="text-xl text-ocean-100 max-w-4xl mx-auto leading-relaxed">
              A comprehensive web application designed to track, analyze, and predict shoreline 
              changes in coastal communities across the Philippines, helping researchers, 
              policymakers, and communities understand coastal erosion patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Target className="h-12 w-12 text-ocean-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To provide accessible, data-driven insights into coastal erosion patterns 
                that help protect Filipino communities from the impacts of climate change.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-ocean-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Who We Serve</h3>
              <p className="text-gray-600">
                Researchers, environmental agencies, local government units, and coastal 
                communities who need reliable data for decision-making and planning.
              </p>
            </div>
            <div className="text-center">
              <Database className="h-12 w-12 text-ocean-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Our Approach</h3>
              <p className="text-gray-600">
                Using open data sources and modern web technologies to create an 
                accessible platform for coastal analysis and monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for monitoring and analyzing coastline changes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-ocean-100 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-ocean-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <p className="text-xl text-gray-600">
              Built with modern, reliable technologies for performance and scalability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {stack.category}
                </h3>
                <ul className="space-y-2">
                  {stack.technologies.map((tech, techIndex) => (
                    <li key={techIndex} className="text-gray-600 text-sm">
                      • {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Sources</h2>
            <p className="text-xl text-gray-600">
              Utilizing trusted, authoritative data from government and open sources
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {dataSources.map((source, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {source.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {source.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {source.format.split(', ').map((format, formatIndex) => (
                    <span
                      key={formatIndex}
                      className="px-2 py-1 bg-ocean-100 text-ocean-700 text-xs rounded"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {source.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Roadmap */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Development Roadmap</h2>
            <p className="text-xl text-gray-600">
              Our progress and future plans for the platform
            </p>
          </div>
          
          <div className="space-y-8">
            {roadmapItems.map((item, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.phase}
                  </h3>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'completed' ? 'Completed' :
                     item.status === 'in-progress' ? 'In Progress' : 'Planned'}
                  </span>
                </div>
                <ul className="grid md:grid-cols-2 gap-2">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex} className="text-gray-600 text-sm">
                      • {subItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="py-16 bg-ocean-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Explore our interactive map, analyze coastline data, or contribute 
            your own datasets to help build a comprehensive picture of coastal 
            changes in the Philippines.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="btn-primary bg-white text-ocean-600 hover:bg-ocean-50 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Map className="h-5 w-5" />
              <span>Explore Map</span>
            </Link>
            
            <Link
              to="/upload"
              className="btn-secondary bg-ocean-700 text-white hover:bg-ocean-500 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Database className="h-5 w-5" />
              <span>Upload Data</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact & Links */}
      <div className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Github className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Open Source</h3>
              <p className="text-gray-300 text-sm mb-3">
                This project is open source and available on GitHub
              </p>
              <a
                href="https://github.com/yourusername/philippine-coastline-analyzer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean-400 hover:text-ocean-300 flex items-center justify-center space-x-1"
              >
                <span>View on GitHub</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <div>
              <Mail className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-gray-300 text-sm mb-3">
                Questions, suggestions, or collaboration inquiries?
              </p>
              <a
                href="mailto:contact@coastline-analyzer.ph"
                className="text-ocean-400 hover:text-ocean-300"
              >
                contact@coastline-analyzer.ph
              </a>
            </div>
            
            <div>
              <Globe className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Data Partners</h3>
              <p className="text-gray-300 text-sm mb-3">
                Collaborating with government agencies and research institutions
              </p>
              <div className="text-ocean-400 text-sm">
                NAMRIA • Project NOAH • Academia
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Philippine Coastline Shrink Analyzer. Built for the Filipino community.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage

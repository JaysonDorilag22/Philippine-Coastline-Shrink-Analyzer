import React from 'react'
import { Link } from 'react-router-dom'
import { Waves, Map, BarChart3, Upload, ArrowRight, Shield, TrendingDown, Clock } from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: Map,
      title: 'Interactive Coastline Map',
      description: 'Visualize past vs present coastlines with overlay comparisons using satellite imagery and shapefiles.',
      link: '/map',
      color: 'bg-blue-500'
    },
    {
      icon: Shield,
      title: 'Shrink Risk Detection',
      description: 'Identify areas with visible loss of landmass and assess erosion risk levels.',
      link: '/analysis',
      color: 'bg-red-500'
    },
    {
      icon: TrendingDown,
      title: 'Trend Analysis',
      description: 'Track how much shoreline has moved inland with detailed loss metrics per year.',
      link: '/analysis',
      color: 'bg-orange-500'
    },
    {
      icon: Clock,
      title: 'Future Projections',
      description: 'Predict erosion rates for the next few years based on historical trends.',
      link: '/analysis',
      color: 'bg-purple-500'
    }
  ]

  const stats = [
    { label: 'Coastal Provinces', value: '81', description: 'Covered in the Philippines' },
    { label: 'Data Sources', value: '3+', description: 'NAMRIA, NOAH, OpenStreetMap' },
    { label: 'Years Range', value: '2010-2024', description: 'Historical data coverage' },
    { label: 'Analysis Types', value: '4', description: 'Different assessment methods' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Waves className="h-16 w-16 text-ocean-200" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Philippine Coastline
              <span className="block text-ocean-200">Shrink Analyzer</span>
            </h1>
            <p className="text-xl md:text-2xl text-ocean-100 mb-8 max-w-3xl mx-auto">
              A visual and analytical web app that tracks and predicts shoreline changes 
              in coastal communities across the Philippines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/map"
                className="btn-primary bg-white text-ocean-600 hover:bg-ocean-50 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Map className="h-5 w-5" />
                <span>Explore Map</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/analysis"
                className="btn-secondary bg-ocean-700 text-white hover:bg-ocean-600 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-5 w-5" />
                <span>View Analysis</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-ocean-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for monitoring and analyzing coastline changes 
              across the Philippine archipelago.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card p-8 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    <div className={`${feature.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {feature.description}
                      </p>
                      <Link
                        to={feature.link}
                        className="text-ocean-600 hover:text-ocean-700 font-medium flex items-center space-x-1"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Analyzing?
          </h2>
          <p className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Upload your coastline data or explore existing datasets to begin 
            tracking coastal changes in your area of interest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="btn-primary bg-white text-ocean-600 hover:bg-ocean-50 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Data</span>
            </Link>
            <Link
              to="/about"
              className="btn-secondary bg-ocean-700 text-white hover:bg-ocean-500 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

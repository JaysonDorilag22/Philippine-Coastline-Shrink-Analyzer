import React, { useState, useEffect } from 'react'
import { analysisApi, coastlineApi, formatError } from '../utils/api'
import { BarChart3, TrendingDown, AlertTriangle, Calendar, MapPin, Download, Plus, X, FileText, ArrowLeft } from 'lucide-react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const AnalysisPage = () => {
  const [analyses, setAnalyses] = useState([])
  const [coastlines, setCoastlines] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewAnalysis, setShowNewAnalysis] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [newAnalysis, setNewAnalysis] = useState({
    name: '',
    baselineCoastlineId: '',
    comparisonCoastlineId: ''
  })
  const [creatingAnalysis, setCreatingAnalysis] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [analysesRes, coastlinesRes, statsRes] = await Promise.all([
        analysisApi.getAnalyses({ limit: 50 }),
        coastlineApi.getCoastlines({ limit: 100 }),
        analysisApi.getStatistics()
      ])
      
      setAnalyses(analysesRes.data.data)
      setCoastlines(coastlinesRes.data.data)
      setStatistics(statsRes.data.data)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysisDetails = async (analysisId) => {
    try {
      setLoadingAnalysis(true)
      const response = await analysisApi.getAnalysis(analysisId)
      setSelectedAnalysis(response.data.data)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleViewDetails = (analysis) => {
    fetchAnalysisDetails(analysis._id)
  }

  const handleCreateAnalysis = async (e) => {
    e.preventDefault()
    try {
      setCreatingAnalysis(true)
      await analysisApi.compareCoastlines(newAnalysis)
      setShowNewAnalysis(false)
      setNewAnalysis({ name: '', baselineCoastlineId: '', comparisonCoastlineId: '' })
      fetchData() // Refresh data
    } catch (err) {
      setError(formatError(err))
    } finally {
      setCreatingAnalysis(false)
    }
  }

  const getRiskBadgeClass = (level) => {
    const classes = {
      Low: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      High: 'bg-orange-100 text-orange-800 border-orange-200',
      Critical: 'bg-red-100 text-red-800 border-red-200'
    }
    return `px-2 py-1 rounded-full text-xs font-medium border ${classes[level] || 'bg-gray-100'}`
  }

  const getRiskColor = (level) => {
    const colors = {
      Low: '#10b981',
      Medium: '#f59e0b',
      High: '#f97316',
      Critical: '#ef4444'
    }
    return colors[level] || '#6b7280'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Chart data
  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
    datasets: [{
      data: [
        analyses.filter(a => a.riskAssessment.level === 'Low').length,
        analyses.filter(a => a.riskAssessment.level === 'Medium').length,
        analyses.filter(a => a.riskAssessment.level === 'High').length,
        analyses.filter(a => a.riskAssessment.level === 'Critical').length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
      borderWidth: 0
    }]
  }

  const lossOverTimeData = {
    labels: analyses.map(a => `${a.comparison.baselineYear}-${a.comparison.comparisonYear}`),
    datasets: [{
      label: 'Land Loss (km²)',
      data: analyses.map(a => a.results.landLossArea),
      borderColor: '#ef4444',
      backgroundColor: '#ef444420',
      fill: true
    }]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    )
  }

  // Analysis Details View
  if (selectedAnalysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Analysis List</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedAnalysis.name}</h1>
              <p className="text-gray-600">
                Detailed analysis of coastline changes
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={getRiskBadgeClass(selectedAnalysis.riskAssessment.level)}>
              {selectedAnalysis.riskAssessment.level} Risk
            </span>
          </div>
        </div>

        {loadingAnalysis && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-6 h-6 mr-2"></div>
            <span>Loading analysis details...</span>
          </div>
        )}

        {/* Analysis Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Land Loss</p>
                <p className="text-2xl font-bold text-red-600">
                  {selectedAnalysis.results.landLossArea.toFixed(2)} km²
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Land Gain</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedAnalysis.results.landGainArea.toFixed(2)} km²
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600 transform rotate-180" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Change</p>
                <p className={`text-2xl font-bold ${selectedAnalysis.results.netChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedAnalysis.results.netChange > 0 ? '+' : ''}{selectedAnalysis.results.netChange.toFixed(2)} km²
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Annual Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedAnalysis.results.averageAnnualChange.toFixed(3)} km²/yr
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Overview</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Region:</strong> {selectedAnalysis.location.region}</p>
                    <p><strong>Province:</strong> {selectedAnalysis.location.province}</p>
                    <p><strong>Municipality:</strong> {selectedAnalysis.location.municipality}</p>
                    {selectedAnalysis.location.barangay && (
                      <p><strong>Barangay:</strong> {selectedAnalysis.location.barangay}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Time Period</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Baseline Year:</strong> {selectedAnalysis.comparison.baselineYear}</p>
                    <p><strong>Comparison Year:</strong> {selectedAnalysis.comparison.comparisonYear}</p>
                    <p><strong>Duration:</strong> {selectedAnalysis.comparison.comparisonYear - selectedAnalysis.comparison.baselineYear} years</p>
                    <p><strong>Analysis Date:</strong> {formatDate(selectedAnalysis.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Area Changes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Land Loss Area:</span>
                      <span className="text-sm font-medium text-red-600">
                        {selectedAnalysis.results.landLossArea.toFixed(4)} km²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Land Gain Area:</span>
                      <span className="text-sm font-medium text-green-600">
                        {selectedAnalysis.results.landGainArea.toFixed(4)} km²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Change:</span>
                      <span className={`text-sm font-medium ${selectedAnalysis.results.netChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedAnalysis.results.netChange > 0 ? '+' : ''}{selectedAnalysis.results.netChange.toFixed(4)} km²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Percentage Change:</span>
                      <span className={`text-sm font-medium ${selectedAnalysis.results.percentageChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedAnalysis.results.percentageChange > 0 ? '+' : ''}{selectedAnalysis.results.percentageChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Rate Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Annual Change:</span>
                      <span className="text-sm font-medium text-orange-600">
                        {selectedAnalysis.results.averageAnnualChange.toFixed(4)} km²/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Affected Coastline Length:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {selectedAnalysis.results.affectedLength.toFixed(2)} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coastline Comparison */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Coastline Data Sources</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Baseline Coastline</h4>
                  {selectedAnalysis.comparison.baselineCoastlineId && (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedAnalysis.comparison.baselineCoastlineId.name}</p>
                      <p><strong>Year:</strong> {selectedAnalysis.comparison.baselineCoastlineId.year}</p>
                      <p><strong>Source:</strong> {selectedAnalysis.comparison.baselineCoastlineId.metadata.source}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comparison Coastline</h4>
                  {selectedAnalysis.comparison.comparisonCoastlineId && (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedAnalysis.comparison.comparisonCoastlineId.name}</p>
                      <p><strong>Year:</strong> {selectedAnalysis.comparison.comparisonCoastlineId.year}</p>
                      <p><strong>Source:</strong> {selectedAnalysis.comparison.comparisonCoastlineId.metadata.source}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment Sidebar */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
              <div className="text-center mb-4">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: getRiskColor(selectedAnalysis.riskAssessment.level) + '20' }}
                >
                  <AlertTriangle 
                    className="h-8 w-8"
                    style={{ color: getRiskColor(selectedAnalysis.riskAssessment.level) }}
                  />
                </div>
                <h4 className="text-xl font-bold" style={{ color: getRiskColor(selectedAnalysis.riskAssessment.level) }}>
                  {selectedAnalysis.riskAssessment.level} Risk
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Risk Factors</h5>
                  <ul className="space-y-1">
                    {selectedAnalysis.riskAssessment.factors.map((factor, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                  <ul className="space-y-1">
                    {selectedAnalysis.riskAssessment.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="btn-primary w-full flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
                <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>View on Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Analysis List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coastline Analysis</h1>
          <p className="text-gray-600">
            Comprehensive analysis of coastline changes and erosion patterns
          </p>
        </div>
        <button
          onClick={() => setShowNewAnalysis(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.overview?.totalAnalyses || 0}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Land Loss</p>
              <p className="text-3xl font-bold text-red-600">
                {(statistics.overview?.totalLandLoss || 0).toFixed(2)} km²
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Areas</p>
              <p className="text-3xl font-bold text-red-600">
                {statistics.overview?.criticalAreas || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Annual Loss</p>
              <p className="text-3xl font-bold text-orange-600">
                {(statistics.overview?.averageAnnualLoss || 0).toFixed(3)} km²/yr
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={riskDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Land Loss Over Time</h3>
          <div className="h-64">
            <Line 
              data={lossOverTimeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Land Loss (km²)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Analysis List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Analyses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Land Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyses.map((analysis) => (
                <tr key={analysis._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {analysis.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {analysis.location.municipality}, {analysis.location.province}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analysis.comparison.baselineYear} - {analysis.comparison.comparisonYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {analysis.results.landLossArea.toFixed(2)} km²
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analysis.results.percentageChange.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRiskBadgeClass(analysis.riskAssessment.level)}>
                      {analysis.riskAssessment.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewDetails(analysis)}
                      className="text-primary-600 hover:text-primary-700 mr-4"
                    >
                      View Details
                    </button>
                    <button className="text-gray-600 hover:text-gray-700">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Analysis Modal */}
      {showNewAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Analysis</h3>
            <form onSubmit={handleCreateAnalysis}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Analysis Name
                  </label>
                  <input
                    type="text"
                    value={newAnalysis.name}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., Manila Bay 2010-2023"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Baseline Coastline
                  </label>
                  <select
                    value={newAnalysis.baselineCoastlineId}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, baselineCoastlineId: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select baseline coastline</option>
                    {coastlines.map(coastline => (
                      <option key={coastline._id} value={coastline._id}>
                        {coastline.name} ({coastline.year})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comparison Coastline
                  </label>
                  <select
                    value={newAnalysis.comparisonCoastlineId}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, comparisonCoastlineId: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select comparison coastline</option>
                    {coastlines.map(coastline => (
                      <option key={coastline._id} value={coastline._id}>
                        {coastline.name} ({coastline.year})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewAnalysis(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAnalysis}
                  className="btn-primary flex items-center space-x-2"
                >
                  {creatingAnalysis && <div className="spinner"></div>}
                  <span>Create Analysis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisPage
import React, { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X, Info, Calendar, MapPin, Database } from 'lucide-react'
import { uploadApi, formatError } from '../utils/api'

const UploadPage = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: File, 2: Basic Metadata, 3: Detailed Metadata
  const [metadata, setMetadata] = useState({
    // Basic Information
    name: '',
    region: '',
    province: '',
    municipality: '',
    barangay: '',
    year: new Date().getFullYear(),
    
    // Citation Information
    title: '',
    description: '',
    abstract: '',
    
    // Spatial Information
    westBounding: '',
    eastBounding: '',
    northBounding: '',
    southBounding: '',
    
    // Technical Metadata
    source: 'NAMRIA',
    projection: 'UTM Zone 51N',
    datum: 'PRS92',
    resolution: '30',
    acquisitionMethod: 'Landsat 8',
    processingLevel: 'Level 2',
    accuracy: '1:50,000',
    
    // Temporal Information
    acquisitionDate: '',
    acquisitionStartDate: '',
    acquisitionEndDate: '',
    
    // Classification Information
    classificationMethod: 'Digital/Visual Classification',
    sensorType: 'Landsat 8',
    cloudCover: '',
    
    // Quality Information
    validationMethod: 'Ground Truth Survey',
    validationDate: '',
    qualityAssessment: '',
    
    // Contact Information
    organization: 'NAMRIA - PCRD',
    contactEmail: '',
    datasetCredit: 'Physiography and Coastal Resource Division (PCRD), Resource Data Analysis Branch (RDAB), National Mapping and Resource Information Authority (NAMRIA)',
    
    // Usage Information
    useConstraints: 'This data is ideal for data overlay/analysis at maximum scale of 1:50,000.',
    accessConstraints: 'None',
    
    // Additional Fields
    keywords: ['coastline', 'erosion', 'Philippines', 'coastal resources'],
    purpose: '',
    supplementalInfo: ''
  })

  const regions = [
    'Region I - Ilocos Region',
    'Region II - Cagayan Valley',
    'Region III - Central Luzon',
    'Region IV-A - CALABARZON',
    'Region IV-B - MIMAROPA',
    'Region V - Bicol Region',
    'Region VI - Western Visayas',
    'Region VII - Central Visayas',
    'Region VIII - Eastern Visayas',
    'Region IX - Zamboanga Peninsula',
    'Region X - Northern Mindanao',
    'Region XI - Davao Region',
    'Region XII - SOCCSKSARGEN',
    'Region XIII - Caraga',
    'NCR - National Capital Region',
    'CAR - Cordillera Administrative Region',
    'BARMM - Bangsamoro Autonomous Region'
  ]

  const dataSources = [
    'NAMRIA',
    'DENR',
    'Project NOAH',
    'OpenStreetMap',
    'Landsat 8',
    'Sentinel-2',
    'WorldView',
    'QuickBird',
    'IKONOS',
    'Other'
  ]

  const sensorTypes = [
    'Landsat 8',
    'Landsat 7',
    'Sentinel-2',
    'WorldView-2',
    'WorldView-3',
    'QuickBird',
    'IKONOS',
    'SPOT',
    'Other'
  ]

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const geoJsonFiles = droppedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.geojson') || 
      file.name.toLowerCase().endsWith('.json')
    )
    
    if (geoJsonFiles.length === 0) {
      setError('Please drop only GeoJSON files (.geojson or .json)')
      return
    }
    
    setFiles(geoJsonFiles)
    setError(null)
    if (geoJsonFiles.length > 0) {
      setCurrentStep(2)
      // Auto-populate title from filename
      setMetadata(prev => ({
        ...prev,
        name: geoJsonFiles[0].name.replace(/\.(geojson|json)$/i, ''),
        title: `Coastal Resource Map - ${geoJsonFiles[0].name.replace(/\.(geojson|json)$/i, '')}`
      }))
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const geoJsonFiles = selectedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.geojson') || 
      file.name.toLowerCase().endsWith('.json')
    )
    
    if (geoJsonFiles.length === 0) {
      setError('Please select only GeoJSON files (.geojson or .json)')
      return
    }
    
    setFiles(geoJsonFiles)
    setError(null)
    if (geoJsonFiles.length > 0) {
      setCurrentStep(2)
      // Auto-populate title from filename
      setMetadata(prev => ({
        ...prev,
        name: geoJsonFiles[0].name.replace(/\.(geojson|json)$/i, ''),
        title: `Coastal Resource Map - ${geoJsonFiles[0].name.replace(/\.(geojson|json)$/i, '')}`
      }))
    }
  }

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleKeywordsChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    setMetadata(prev => ({
      ...prev,
      keywords
    }))
  }

  const validateMetadata = () => {
    const required = ['name', 'region', 'province', 'municipality', 'year', 'source']
    const missing = required.filter(field => !metadata[field])
    
    if (missing.length > 0) {
      setError(`Please fill in required fields: ${missing.join(', ')}`)
      return false
    }
    
    if (metadata.year < 1900 || metadata.year > new Date().getFullYear() + 1) {
      setError('Please enter a valid year')
      return false
    }
    
    return true
  }

  const handleUpload = async () => {
    if (!validateMetadata()) return
    
    setUploading(true)
    setError(null)
    setSuccess(null)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        
        formData.append('geojson', file)
        
        // Append all metadata fields
        Object.keys(metadata).forEach(key => {
          if (metadata[key] !== null && metadata[key] !== undefined) {
            if (Array.isArray(metadata[key])) {
              formData.append(key, JSON.stringify(metadata[key]))
            } else {
              formData.append(key, metadata[key].toString())
            }
          }
        })
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        await uploadApi.uploadGeojson(formData, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
        })
      }
      
      setSuccess(`Successfully uploaded ${files.length} file(s) with complete metadata!`)
      setFiles([])
      setMetadata({
        name: '',
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        year: new Date().getFullYear(),
        title: '',
        description: '',
        abstract: '',
        westBounding: '',
        eastBounding: '',
        northBounding: '',
        southBounding: '',
        source: 'NAMRIA',
        projection: 'UTM Zone 51N',
        datum: 'PRS92',
        resolution: '30',
        acquisitionMethod: 'Landsat 8',
        processingLevel: 'Level 2',
        accuracy: '1:50,000',
        acquisitionDate: '',
        acquisitionStartDate: '',
        acquisitionEndDate: '',
        classificationMethod: 'Digital/Visual Classification',
        sensorType: 'Landsat 8',
        cloudCover: '',
        validationMethod: 'Ground Truth Survey',
        validationDate: '',
        qualityAssessment: '',
        organization: 'NAMRIA - PCRD',
        contactEmail: '',
        datasetCredit: 'Physiography and Coastal Resource Division (PCRD), Resource Data Analysis Branch (RDAB), National Mapping and Resource Information Authority (NAMRIA)',
        useConstraints: 'This data is ideal for data overlay/analysis at maximum scale of 1:50,000.',
        accessConstraints: 'None',
        keywords: ['coastline', 'erosion', 'Philippines', 'coastal resources'],
        purpose: '',
        supplementalInfo: ''
      })
      setCurrentStep(1)
      setUploadProgress({})
      
    } catch (err) {
      setError(formatError(err))
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    if (files.length === 1) {
      setCurrentStep(1)
    }
  }

  const nextStep = () => {
    if (currentStep === 2 && validateMetadata()) {
      setCurrentStep(3)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Coastline Data</h1>
        <p className="text-gray-600 mt-2">
          Upload GeoJSON files with comprehensive NAMRIA-compliant metadata
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">File Upload</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Basic Info</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Detailed Metadata</span>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Step 1: File Upload */}
      {currentStep === 1 && (
        <div className="card p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop your GeoJSON files here
            </h3>
            <p className="text-gray-600 mb-4">
              or click to browse and select files
            </p>
            <input
              type="file"
              multiple
              accept=".geojson,.json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="btn-primary cursor-pointer inline-flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Select Files</span>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Selected Files:</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-primary"
                >
                  Continue to Metadata
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Basic Metadata */}
      {currentStep === 2 && (
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <MapPin className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.name}
                onChange={(e) => handleMetadataChange('name', e.target.value)}
                className="input-field w-full"
                placeholder="e.g., Manila Bay Coastline 2023"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={metadata.year}
                onChange={(e) => handleMetadataChange('year', parseInt(e.target.value))}
                className="input-field w-full"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                value={metadata.region}
                onChange={(e) => handleMetadataChange('region', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.province}
                onChange={(e) => handleMetadataChange('province', e.target.value)}
                className="input-field w-full"
                placeholder="e.g., Manila"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Municipality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.municipality}
                onChange={(e) => handleMetadataChange('municipality', e.target.value)}
                className="input-field w-full"
                placeholder="e.g., Manila City"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay (Optional)
              </label>
              <input
                type="text"
                value={metadata.barangay}
                onChange={(e) => handleMetadataChange('barangay', e.target.value)}
                className="input-field w-full"
                placeholder="e.g., Barangay 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source <span className="text-red-500">*</span>
              </label>
              <select
                value={metadata.source}
                onChange={(e) => handleMetadataChange('source', e.target.value)}
                className="input-field w-full"
                required
              >
                {dataSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sensor Type
              </label>
              <select
                value={metadata.sensorType}
                onChange={(e) => handleMetadataChange('sensorType', e.target.value)}
                className="input-field w-full"
              >
                {sensorTypes.map(sensor => (
                  <option key={sensor} value={sensor}>{sensor}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dataset Title
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => handleMetadataChange('title', e.target.value)}
              className="input-field w-full"
              placeholder="e.g., Coastal Resource Map (CRM) of Manila Bay, Philippines"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description/Abstract
            </label>
            <textarea
              value={metadata.abstract}
              onChange={(e) => handleMetadataChange('abstract', e.target.value)}
              className="input-field w-full"
              rows="4"
              placeholder="Describe the dataset, its purpose, methodology, and key characteristics..."
            />
          </div>

          <div className="mt-8 flex justify-between">
            <button onClick={prevStep} className="btn-secondary">
              Back
            </button>
            <button onClick={nextStep} className="btn-primary">
              Continue to Detailed Metadata
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Detailed Metadata */}
      {currentStep === 3 && (
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Detailed Metadata (NAMRIA Standard)</h3>
          </div>

          {/* Spatial Information */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4">Spatial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  West Bounding Coordinate
                </label>
                <input
                  type="number"
                  step="any"
                  value={metadata.westBounding}
                  onChange={(e) => handleMetadataChange('westBounding', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 119.648528"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  East Bounding Coordinate
                </label>
                <input
                  type="number"
                  step="any"
                  value={metadata.eastBounding}
                  onChange={(e) => handleMetadataChange('eastBounding', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 124.487120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  North Bounding Coordinate
                </label>
                <input
                  type="number"
                  step="any"
                  value={metadata.northBounding}
                  onChange={(e) => handleMetadataChange('northBounding', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 21.128359"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  South Bounding Coordinate
                </label>
                <input
                  type="number"
                  step="any"
                  value={metadata.southBounding}
                  onChange={(e) => handleMetadataChange('southBounding', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 11.559046"
                />
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4">Technical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projection
                </label>
                <input
                  type="text"
                  value={metadata.projection}
                  onChange={(e) => handleMetadataChange('projection', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., UTM Zone 51N"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horizontal Datum
                </label>
                <input
                  type="text"
                  value={metadata.datum}
                  onChange={(e) => handleMetadataChange('datum', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., PRS92"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution (meters)
                </label>
                <input
                  type="text"
                  value={metadata.resolution}
                  onChange={(e) => handleMetadataChange('resolution', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale Accuracy
                </label>
                <input
                  type="text"
                  value={metadata.accuracy}
                  onChange={(e) => handleMetadataChange('accuracy', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 1:50,000"
                />
              </div>
            </div>
          </div>

          {/* Temporal Information */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4">Temporal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  value={metadata.acquisitionDate}
                  onChange={(e) => handleMetadataChange('acquisitionDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Start Date
                </label>
                <input
                  type="date"
                  value={metadata.acquisitionStartDate}
                  onChange={(e) => handleMetadataChange('acquisitionStartDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition End Date
                </label>
                <input
                  type="date"
                  value={metadata.acquisitionEndDate}
                  onChange={(e) => handleMetadataChange('acquisitionEndDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Quality Information */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4">Quality & Validation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classification Method
                </label>
                <input
                  type="text"
                  value={metadata.classificationMethod}
                  onChange={(e) => handleMetadataChange('classificationMethod', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., Digital/Visual Classification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validation Method
                </label>
                <input
                  type="text"
                  value={metadata.validationMethod}
                  onChange={(e) => handleMetadataChange('validationMethod', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., Ground Truth Survey"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cloud Cover (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={metadata.cloudCover}
                  onChange={(e) => handleMetadataChange('cloudCover', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validation Date
                </label>
                <input
                  type="date"
                  value={metadata.validationDate}
                  onChange={(e) => handleMetadataChange('validationDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4">Organization & Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={metadata.organization}
                  onChange={(e) => handleMetadataChange('organization', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., NAMRIA - PCRD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={metadata.contactEmail}
                  onChange={(e) => handleMetadataChange('contactEmail', e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., info@namria.gov.ph"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Credit
              </label>
              <textarea
                value={metadata.datasetCredit}
                onChange={(e) => handleMetadataChange('datasetCredit', e.target.value)}
                className="input-field w-full"
                rows="2"
                placeholder="Credit information for the dataset..."
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4">Additional Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.keywords.join(', ')}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., coastline, erosion, Philippines, coastal resources"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <textarea
                  value={metadata.purpose}
                  onChange={(e) => handleMetadataChange('purpose', e.target.value)}
                  className="input-field w-full"
                  rows="2"
                  placeholder="Describe the purpose of this dataset..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use Constraints
                </label>
                <textarea
                  value={metadata.useConstraints}
                  onChange={(e) => handleMetadataChange('useConstraints', e.target.value)}
                  className="input-field w-full"
                  rows="2"
                  placeholder="e.g., This data is ideal for data overlay/analysis at maximum scale of 1:50,000."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplemental Information
                </label>
                <textarea
                  value={metadata.supplementalInfo}
                  onChange={(e) => handleMetadataChange('supplementalInfo', e.target.value)}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Additional information about the dataset..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={prevStep} className="btn-secondary">
              Back
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary flex items-center space-x-2"
            >
              {uploading && <div className="spinner w-4 h-4"></div>}
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload with Metadata'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="card p-6 mt-6">
          <h3 className="font-medium text-gray-900 mb-4">Upload Progress</h3>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">{filename}</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Guidelines */}
      <div className="card p-6 mt-8">
        <div className="flex items-center mb-4">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-gray-900">NAMRIA Metadata Guidelines</h3>
        </div>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• This form follows NAMRIA's Coastal Resource Map metadata standards</p>
          <p>• Required fields are marked with red asterisks (*)</p>
          <p>• Spatial coordinates should be in decimal degrees (WGS84)</p>
          <p>• Dates should follow YYYY-MM-DD format</p>
          <p>• Keywords help with data discovery and categorization</p>
          <p>• Use constraints define appropriate usage scenarios for the data</p>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, LayersControl, Popup } from 'react-leaflet'
import { coastlineApi, formatError } from '../utils/api'
import { Layers, Filter, Download, Info, Calendar, MapPin } from 'lucide-react'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapPage = () => {
  const [coastlines, setCoastlines] = useState([])
  const [coastlinesWithGeoJSON, setCoastlinesWithGeoJSON] = useState([])
  const [filteredCoastlines, setFilteredCoastlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    region: '',
    province: '',
    municipality: '',
    year: '',
    source: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [locations, setLocations] = useState([])
  const [layerOpacity, setLayerOpacity] = useState(0.7)

  // Philippines center coordinates
  const philippinesCenter = [12.8797, 121.7740]

  useEffect(() => {
    fetchCoastlines()
    fetchLocationSummary()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, coastlinesWithGeoJSON])

  const fetchCoastlines = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, get the list of coastlines (without GeoJSON)
      const response = await coastlineApi.getCoastlines({ limit: 100 })
      const coastlineList = response.data.data
      setCoastlines(coastlineList)

      // Then, fetch each coastline with full GeoJSON data
      const coastlinesWithData = await Promise.all(
        coastlineList.map(async (coastline) => {
          try {
            const fullCoastline = await coastlineApi.getCoastline(coastline._id)
            return fullCoastline.data.data
          } catch (err) {
            console.error(`Failed to fetch coastline ${coastline._id}:`, err)
            return null
          }
        })
      )

      // Filter out any failed requests
      const validCoastlines = coastlinesWithData.filter(c => c !== null)
      setCoastlinesWithGeoJSON(validCoastlines)
      
      console.log('Loaded coastlines:', validCoastlines.length)
      
    } catch (err) {
      setError(formatError(err))
      console.error('Error fetching coastlines:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocationSummary = async () => {
    try {
      const response = await coastlineApi.getLocationSummary()
      setLocations(response.data.data)
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  const applyFilters = () => {
    let filtered = coastlinesWithGeoJSON

    if (filters.region) {
      filtered = filtered.filter(c => 
        c.region.toLowerCase().includes(filters.region.toLowerCase())
      )
    }
    if (filters.province) {
      filtered = filtered.filter(c => 
        c.province.toLowerCase().includes(filters.province.toLowerCase())
      )
    }
    if (filters.municipality) {
      filtered = filtered.filter(c => 
        c.municipality.toLowerCase().includes(filters.municipality.toLowerCase())
      )
    }
    if (filters.year) {
      filtered = filtered.filter(c => c.year.toString() === filters.year)
    }
    if (filters.source) {
      filtered = filtered.filter(c => c.metadata.source === filters.source)
    }

    setFilteredCoastlines(filtered)
  }

  const getCoastlineStyle = (feature, year) => {
    // Color based on year
    const yearColors = {
      2010: '#ff4444',
      2015: '#ff8844',
      2020: '#44ff44',
      2023: '#4444ff',
      2024: '#8844ff'
    }
    
    const color = yearColors[year] || '#666666'
    
    return {
      color: color,
      weight: 3,
      opacity: layerOpacity,
      fillOpacity: layerOpacity * 0.3,
      fillColor: color
    }
  }

  const onEachFeature = (feature, layer, coastlineData) => {
    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${coastlineData.name}</h3>
        <div class="space-y-1 text-sm">
          <p><strong>Location:</strong> ${coastlineData.municipality}, ${coastlineData.province}</p>
          <p><strong>Region:</strong> ${coastlineData.region}</p>
          <p><strong>Year:</strong> ${coastlineData.year}</p>
          <p><strong>Source:</strong> ${coastlineData.metadata.source}</p>
          <p><strong>Accuracy:</strong> ${coastlineData.metadata.accuracy}</p>
        </div>
      </div>
    `
    
    layer.bindPopup(popupContent)
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 5,
          opacity: 1
        })
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle(getCoastlineStyle(feature, coastlineData.year))
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coastline data...</p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment while we fetch the geographic data
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error loading map data</p>
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchCoastlines}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show message if no coastlines are available
  if (coastlinesWithGeoJSON.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">No coastline data available</p>
          <p className="text-gray-600 mb-4">
            Please upload some coastline data or run the seed script to populate the database.
          </p>
          <div className="space-x-4">
            <button 
              onClick={fetchCoastlines}
              className="btn-secondary"
            >
              Refresh
            </button>
            <a href="/upload" className="btn-primary">
              Upload Data
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coastline Map View</h1>
            <p className="text-gray-600">
              Displaying {filteredCoastlines.length} of {coastlinesWithGeoJSON.length} coastlines
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Opacity Slider */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-500">{Math.round(layerOpacity * 100)}%</span>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center space-x-2 ${
                showFilters ? 'bg-primary-100 text-primary-700' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border-b px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <input
                type="text"
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                placeholder="Filter by region"
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <input
                type="text"
                value={filters.province}
                onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                placeholder="Filter by province"
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Municipality
              </label>
              <input
                type="text"
                value={filters.municipality}
                onChange={(e) => setFilters({ ...filters, municipality: e.target.value })}
                placeholder="Filter by municipality"
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="input-field w-full"
              >
                <option value="">All years</option>
                <option value="2010">2010</option>
                <option value="2015">2015</option>
                <option value="2020">2020</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="input-field w-full"
              >
                <option value="">All sources</option>
                <option value="NAMRIA">NAMRIA</option>
                <option value="Project NOAH">Project NOAH</option>
                <option value="OpenStreetMap">OpenStreetMap</option>
                <option value="Manual Upload">Manual Upload</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setFilters({
                region: '', province: '', municipality: '', year: '', source: ''
              })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={philippinesCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            {/* Coastline Layers */}
            {filteredCoastlines.map((coastline) => {
              // Validate GeoJSON before rendering
              if (!coastline.geojson || !coastline.geojson.features) {
                console.warn(`Invalid GeoJSON for coastline ${coastline._id}`);
                return null;
              }

              return (
                <LayersControl.Overlay 
                  key={coastline._id} 
                  name={`${coastline.name} (${coastline.year})`}
                  checked={filteredCoastlines.length <= 3} // Auto-check if few layers
                >
                  <GeoJSON
                    data={coastline.geojson}
                    style={(feature) => getCoastlineStyle(feature, coastline.year)}
                    onEachFeature={(feature, layer) => onEachFeature(feature, layer, coastline)}
                  />
                </LayersControl.Overlay>
              )
            })}
          </LayersControl>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10 max-w-xs">
            <h3 className="font-semibold mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Legend
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-red-500"></div>
                <span>2010 Coastline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-orange-500"></div>
                <span>2015 Coastline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-green-500"></div>
                <span>2020 Coastline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span>2023 Coastline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-purple-500"></div>
                <span>2024 Coastline</span>
              </div>
            </div>
            
            {filteredCoastlines.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {filteredCoastlines.length} coastline{filteredCoastlines.length !== 1 ? 's' : ''} loaded
                </p>
              </div>
            )}
          </div>
        </MapContainer>
      </div>
    </div>
  )
}

export default MapPage
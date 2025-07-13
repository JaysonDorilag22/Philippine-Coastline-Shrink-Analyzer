import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Coastline API
export const coastlineApi = {
  // Get all coastlines with filters
  getCoastlines: (params = {}) => api.get('/coastlines', { params }),
  
  // Get coastlines with GeoJSON for map display
  getCoastlinesForMap: (params = {}) => api.get('/coastlines/map/data', { params }),
  
  // Get specific coastline by ID
  getCoastline: (id) => api.get(`/coastlines/${id}`),
  
  // Create new coastline
  createCoastline: (data) => api.post('/coastlines', data),
  
  // Update coastline
  updateCoastline: (id, data) => api.put(`/coastlines/${id}`, data),
  
  // Delete coastline
  deleteCoastline: (id) => api.delete(`/coastlines/${id}`),
  
  // Get location summary
  getLocationSummary: () => api.get('/coastlines/locations/summary'),
};

// Analysis API
export const analysisApi = {
  // Get all analyses
  getAnalyses: (params = {}) => api.get('/analysis', { params }),
  
  // Get specific analysis
  getAnalysis: (id) => api.get(`/analysis/${id}`),
  
  // Compare coastlines
  compareCoastlines: (data) => api.post('/analysis/compare', data),
  
  // Get statistics
  getStatistics: () => api.get('/analysis/statistics/overview'),
};

// Upload API
export const uploadApi = {
  // Upload single GeoJSON file
  uploadGeoJSON: (formData) => api.post('/upload/geojson', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Upload multiple files
  uploadBatch: (formData) => api.post('/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Validate GeoJSON
  validateGeoJSON: (formData) => api.post('/upload/validate/geojson', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Utility functions
export const formatError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message || 'An unexpected error occurred';
};

export const isApiError = (error) => {
  return error.response && error.response.status >= 400;
};

export default api;

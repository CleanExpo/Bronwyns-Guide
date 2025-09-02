import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log error details
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden:', error.response.data);
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found:', error.config?.url);
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error.response.data);
    } else if (!error.response) {
      // Network error
      console.error('Network error - check your connection');
    }

    return Promise.reject(error);
  }
);

export default api;

// Specific API functions for cleaner usage
export const apiHelpers = {
  // Upload image with proper multipart handling
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/recipes/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get recipes with params
  getRecipes: async (params?: any) => {
    return api.get('/recipes', { params });
  },

  // Create recipe
  createRecipe: async (data: any) => {
    return api.post('/recipes', data);
  },

  // Update recipe
  updateRecipe: async (id: string, data: any) => {
    return api.put(`/recipes/${id}`, data);
  },

  // Delete recipe
  deleteRecipe: async (id: string) => {
    return api.delete(`/recipes/${id}`);
  }
};
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  search: (query) => api.get(`/products?search=${query}`),
};

export const newsAPI = {
  getAll: () => api.get('/news'),
};

export const contactAPI = {
  submit: (contactData) => api.post('/contact', contactData),
};

export const userAPI = {
  getBookings: () => api.get('/user/bookings'),
  createBooking: (bookingData) => api.post('/user/bookings', bookingData),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
};

export default api;
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (email, password, fullName) => 
    api.post('/auth/register', { email, password, fullName }),
  
  getCurrentUser: () => 
    api.get('/users/me'),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => 
    api.get('/transactions'),
  
  sync: () => 
    api.post('/transactions/sync'),
  
  getByDateRange: (startDate, endDate) => 
    api.get('/transactions', { params: { startDate, endDate } }),
};

// Analytics API
export const analyticsAPI = {
  getSpendingByCategory: (startDate, endDate) => 
    api.get('/analytics/spending-by-category', { params: { startDate, endDate } }),
  
  getMonthlySummary: (month) => 
    api.get('/analytics/monthly-summary', { params: { month } }),
  
  compareMonths: () => 
    api.get('/analytics/compare-months'),

  getSpendingTrend: (startDate, endDate) => 
    api.get('/analytics/spending-trend', { params: { startDate, endDate } }),
  
  getTopMerchants: (startDate, endDate, limit = 10) => 
    api.get('/analytics/top-merchants', { params: { startDate, endDate, limit } }),
};

// AI Coach API
export const aiCoachAPI = {
  chat: (message) => 
    api.post('/ai-coach/chat', { message }),
  
  getWeeklySummary: () => 
    api.get('/ai-coach/weekly-summary'),
  
  getMonthlyReport: () => 
    api.get('/ai-coach/monthly-report'),
  
  analyzeCategory: (category) => 
    api.get(`/ai-coach/analyze-category/${category}`),
  
  getSavingsRecommendations: (savingsGoal) => 
    api.post('/ai-coach/savings-recommendations', { savingsGoal }),
};

export default api;
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
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

// Response interceptor - Handle errors and retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Initialize retry count if not present
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Don't retry if:
    // 1. Already retried 3 times
    // 2. Request was cancelled
    // 3. Error is 4xx (client error - retrying won't help)
    const shouldRetry = 
      originalRequest._retryCount < 3 &&
      error.code !== 'ECONNABORTED' &&
      (!error.response || error.response.status >= 500);

    if (shouldRetry) {
      originalRequest._retryCount++;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
      
      console.log(
        `🔄 Retrying request (attempt ${originalRequest._retryCount}/3) after ${delay}ms...`,
        originalRequest.url
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return api(originalRequest);
    }

    // Handle specific error cases
    
    // 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden - you don\'t have permission');
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.error('❌ Not Found:', originalRequest.url);
    }

    // 500+ Server errors (after retries exhausted)
    if (error.response?.status >= 500) {
      console.error('🔥 Server Error:', error.response.status);
    }

    // Network error (no response)
    if (!error.response) {
      console.error('🌐 Network Error - check your connection');
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

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },
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

// Plaid API
export const plaidAPI = {
  createLinkToken: () => 
    api.post('/plaid/create-link-token'),
  
  exchangeToken: (publicToken) => 
    api.post('/plaid/exchange-token', { publicToken }),
  
  getAccounts: () => 
    api.get('/plaid/accounts'),
};

// Budget API 
export const budgetAPI = {
  // Create or update a budget
  createBudget: (budgetData) => 
    api.post('/budgets', budgetData),

  // Get current month budgets with summary
  getCurrentMonthBudgets: () => 
    api.get('/budgets/current'),

  // Get budgets for specific month
  getBudgetsForMonth: (month) => 
    api.get('/budgets', { params: { month } }),

  // Get budget progress (category breakdown)
  getBudgetProgress: (month) => 
    api.get('/budgets/progress', { params: month ? { month } : {} }),

  // Get AI-powered budget recommendations
  getBudgetRecommendations: () => 
    api.get('/budgets/recommendations'),

  // Get exceeded budgets
  getExceededBudgets: () => 
    api.get('/budgets/exceeded'),

  // Get budgets needing alerts (80%+ spent)
  getBudgetAlerts: () => 
    api.get('/budgets/alerts'),

  // Refresh budget spending amounts
  refreshBudgetSpending: (month) => 
    api.post('/budgets/refresh', null, { params: month ? { month } : {} }),

  // Copy previous month's budgets to current month
  copyPreviousMonthBudgets: () => 
    api.post('/budgets/copy-previous'),

  // Update a budget
  updateBudget: (budgetData) => 
    api.post('/budgets', budgetData),

  // Delete a budget
  deleteBudget: (budgetId) => 
    api.delete(`/budgets/${budgetId}`),
};

export default api;
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

// AI replies and a bank's first sync can take well over the default 30s. If the browser
// gave up first, the server would still finish (and count the AI use) but the user would see an error.
const SLOW = { timeout: 120000 };


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

    // Only retry requests that are safe to repeat. Retrying a POST (checkout, linking a bank,
    // AI chat) after a timeout or 5xx could run it twice.
    const isIdempotent = ['get', 'head', 'options', 'put', 'delete']
      .includes((originalRequest.method || 'get').toLowerCase());

    // Don't retry if:
    // 1. Already retried 3 times
    // 2. Request was cancelled
    // 3. Error is 4xx (client error - retrying won't help)
    // 4. The request isn't safe to repeat
    const shouldRetry =
      isIdempotent &&
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
    
    // 401 Unauthorized - session missing/expired/revoked: redirect to login.
    // Auth requests (wrong password, bad reset token) return 401 too; let their pages show the error.
    const isAuthRequest = (originalRequest.url || '').startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
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

  // 200 if the reset link's token is still usable, 400 if invalid or expired
  validateResetToken: (token) =>
    api.get(`/auth/validate-reset-token/${encodeURIComponent(token)}`),

  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },
};

// CSV export of all transactions (paid plans); returns a short-lived download link
export const exportAPI = {
  transactions: () => api.get('/export/transactions', SLOW),
};

// User API
export const userAPI = {
  // Cancels billing, disconnects banks and erases all of the user's data
  deleteAccount: () => api.delete('/users/me', SLOW),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => 
    api.get('/transactions'),
  
  sync: () => 
    api.post('/transactions/sync', null, SLOW),
  
  // Rows from a CSV export: [{ date, description, amount (positive = money out) }]
  importCsv: (accountName, rows) =>
    api.post('/transactions/import', { accountName, rows }, SLOW),

  // remember: also use this category for every past and future transaction from the merchant
  updateCategory: (id, category, remember) =>
    api.patch(`/transactions/${id}/category`, { category, remember }, SLOW),

  // A note, or hidden: true to leave it out of totals (either may be omitted)
  update: (id, changes) =>
    api.patch(`/transactions/${id}`, changes),

  // The parts a transaction was split into
  getSplit: (id) =>
    api.get(`/transactions/${id}/split`),

  // parts: [{ category, amount }] adding up to the transaction's amount
  split: (id, parts) =>
    api.put(`/transactions/${id}/split`, { parts }),

  unsplit: (id) =>
    api.delete(`/transactions/${id}/split`),

  undoImport: (batchId) =>
    api.delete(`/transactions/imports/${batchId}`),

  // Newest first, across all accounts
  recent: (limit = 10) =>
    api.get('/transactions/recent', { params: { limit } }),

  // Merchant name or description contains the text, across all months
  search: (q) =>
    api.get('/transactions/search', { params: { q } }),

  getByDateRange: (startDate, endDate) => 
    api.get('/transactions', { params: { startDate, endDate } }),
};

// Analytics API
export const analyticsAPI = {
  // Income, spending and spending by category per month, oldest first
  monthlyReport: (months = 12) =>
    api.get('/analytics/monthly-report', { params: { months } }),

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
    api.post('/ai-coach/chat', { message }, SLOW),
  
  getWeeklySummary: () => 
    api.get('/ai-coach/weekly-summary', SLOW),
  
  getMonthlyReport: () => 
    api.get('/ai-coach/monthly-report', SLOW),
  
  analyzeCategory: (category) => 
    api.get(`/ai-coach/analyze-category/${category}`, SLOW),
  
  getSavingsRecommendations: (savingsGoal) => 
    api.post('/ai-coach/savings-recommendations', { savingsGoal }, SLOW),

  // Earlier messages of the conversation, oldest first
  getConversation: (sessionId = 'default') =>
    api.get(`/ai-coach/chat/${sessionId}`),

  // Clears the conversation history the coach remembers (chat uses the "default" session)
  clearSession: (sessionId = 'default') =>
    api.delete(`/ai-coach/chat/${sessionId}`),
};

// Unusual spending (anomaly detection)
export const anomaliesAPI = {
  // Re-checks this month against the user's history; existing anomalies are updated, not duplicated
  detect: () => api.post('/anomalies/detect'),
  getUnreviewed: () => api.get('/anomalies/unreviewed'),
  markReviewed: (id) => api.put(`/anomalies/${id}/review`),
};

// "Always categorize this merchant as..." rules
export const categoryRulesAPI = {
  list: () => api.get('/category-rules'),
  remove: (id) => api.delete(`/category-rules/${id}`),
};

// Bills and subscriptions found in the user's transactions
export const recurringAPI = {
  list: () => api.get('/recurring'),
};

// Plaid API
export const plaidAPI = {
  createLinkToken: () => 
    api.post('/plaid/create-link-token'),
  
  exchangeToken: (publicToken) => 
    api.post('/plaid/exchange-token', { publicToken }, SLOW),
  
  getAccounts: () => 
    api.get('/plaid/accounts'),

  // Stops syncing the account; removes the bank connection when it was the last account
  disconnect: (accountId) =>
    api.delete(`/plaid/accounts/${accountId}`),

  // Reopens Plaid Link on an existing connection so the user can sign in to the bank again
  updateLinkToken: (itemId) =>
    api.post(`/plaid/items/${itemId}/update-link-token`),

  reconnected: (itemId) =>
    api.post(`/plaid/items/${itemId}/reconnected`),
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

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  checkFeatureAccess: (featureName) => 
    api.get(`/subscriptions/features/${featureName}/access`),
  createCheckout: (planId, billingCycle) => 
    api.post('/subscriptions/checkout', { planId, billingCycle }),
  cancelSubscription: () => 
    api.post('/subscriptions/cancel'),
};

export const investmentsAPI = {
  // Sync holdings from Plaid
  syncAllHoldings: () => api.post('/investments/sync', null, SLOW),
  
  syncAccountHoldings: (accountId) => 
    api.post(`/investments/sync/${accountId}`),
  
  // Get portfolio data
  getPortfolio: () => api.get('/investments/portfolio'),
  
  getHoldingsByAccount: (accountId) => 
    api.get(`/investments/holdings/${accountId}`),
  
  getAllocation: () => api.get('/investments/allocation'),
  
  getHistory: (days = 30) => 
    api.get('/investments/history', { params: { days } }),
};

export const networthAPI = {
  // Net worth
  getCurrent: () => api.get('/net-worth/current'),
  
  getHistory: (days = 30) => 
    api.get('/net-worth/history', { params: { days } }),
  
  // Manual assets
  getAssets: () => api.get('/net-worth/assets'),
  
  addAsset: (data) => api.post('/net-worth/assets', data),
  
  updateAsset: (id, data) => 
    api.put(`/net-worth/assets/${id}`, data),
  
  deleteAsset: (id) => api.delete(`/net-worth/assets/${id}`),
  
  // Manual liabilities
  getLiabilities: () => api.get('/net-worth/liabilities'),
  
  addLiability: (data) => api.post('/net-worth/liabilities', data),
  
  updateLiability: (id, data) => 
    api.put(`/net-worth/liabilities/${id}`, data),
  
  deleteLiability: (id) => 
    api.delete(`/net-worth/liabilities/${id}`),
};
export default api;
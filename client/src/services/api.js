// ENHANCED API: client/src/services/api.js (with button functionality)
import axios from 'axios';

// Updated API base URL to use port 5001
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
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

// Handle responses and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Expense API
export const expenseAPI = {
  getAll: (params = {}) => api.get('/expenses', { params }),
  getExpenses: (params = {}) => api.get('/expenses', { params }), // Alias
  getById: (id) => api.get(`/expenses/${id}`),
  create: (expenseData) => api.post('/expenses', expenseData),
  createExpense: (expenseData) => api.post('/expenses', expenseData), // Alias
  update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  delete: (id) => api.delete(`/expenses/${id}`),
  deleteExpense: (id) => api.delete(`/expenses/${id}`), // Alias
  getStats: () => api.get('/expenses/stats'),
  getRecent: (limit = 5) => api.get('/expenses/recent', { params: { limit } }),
  getAnalytics: (period = 'month') => api.get(`/expenses/analytics?period=${period}`)
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (period = '30') => api.get('/analytics/overview', { params: { period } }),
  getInsights: () => api.get('/analytics/insights'),
  getMonthlyTrends: () => api.get('/analytics/trends'),
};

// ENHANCED AI API - NOW WITH REAL MACHINE LEARNING
export const aiAPI = {
  // Get ML-powered spending predictions
  getPredictions: (type = 'monthly', categoryId = null) => {
    const params = { type };
    if (categoryId) params.category_id = categoryId;
    return api.get('/ai/predictions', { params });
  },

  // Get intelligent anomaly detection results
  getAnomalies: () => api.get('/ai/anomalies'),

  // Get AI-optimized budget recommendations
  getBudgetRecommendations: () => api.get('/ai/budget-recommendations'),

  // Parse natural language expense input with enhanced NLP
  parseExpense: (text) => api.post('/ai/parse-expense', { text }),

  // Get AI-generated insights
  getInsights: () => api.get('/ai/insights'),

  // Mark insight as read
  markInsightRead: (insightId) => api.put(`/ai/insights/${insightId}/read`),

  // Get AI preferences
  getPreferences: () => api.get('/ai/preferences'),

  // Update AI preferences (AI Settings functionality)
  updatePreferences: (preferences) => api.put('/ai/preferences', preferences),

  // NEW: Button functionality endpoints
  
  // Set Budget Goal button functionality
  setBudgetGoal: (goalData) => api.post('/ai/set-budget-goal', goalData),

  // View Breakdown button functionality
  getSpendingBreakdown: (period = 'month') => api.get('/ai/spending-breakdown', { 
    params: { period } 
  }),

  // Additional ML endpoints
  
  // Get detailed prediction analysis
  getPredictionAnalysis: (predictionId) => api.get(`/ai/predictions/${predictionId}/analysis`),
  
  // Get anomaly trend analysis
  getAnomalyTrends: (period = '3months') => api.get('/ai/anomaly-trends', {
    params: { period }
  }),

  // Train model with user feedback
  provideFeedback: (feedbackData) => api.post('/ai/feedback', feedbackData),

  // Get AI model performance metrics
  getModelMetrics: () => api.get('/ai/model-metrics'),

  // Advanced prediction scenarios
  getPredictionScenarios: (scenarioData) => api.post('/ai/prediction-scenarios', scenarioData),

  // Smart category suggestions based on description
  suggestCategory: (description) => api.post('/ai/suggest-category', { description }),

  // Get spending optimization suggestions
  getOptimizationSuggestions: () => api.get('/ai/optimization-suggestions'),

  // Bulk expense analysis
  analyzeBulkExpenses: (expenses) => api.post('/ai/analyze-bulk', { expenses }),
};

// Budget API (enhanced for AI integration)
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  create: (budgetData) => api.post('/budgets', budgetData),
  update: (id, budgetData) => api.put(`/budgets/${id}`, budgetData),
  delete: (id) => api.delete(`/budgets/${id}`),
  
  // AI-enhanced budget features
  getAIRecommendedBudgets: () => api.get('/budgets/ai-recommended'),
  optimizeBudget: (optimizationParams) => api.post('/budgets/optimize', optimizationParams),
  compareBudgetScenarios: (scenarios) => api.post('/budgets/compare-scenarios', scenarios),
};

// Machine Learning API - Advanced ML Operations
export const mlAPI = {
  // Model training and evaluation
  trainModel: (modelType, trainingData) => api.post(`/ml/train/${modelType}`, trainingData),
  evaluateModel: (modelType) => api.get(`/ml/evaluate/${modelType}`),
  
  // Advanced predictions
  predictCategorySpending: (categoryId, horizon = 30) => api.get(`/ml/predict/category/${categoryId}`, {
    params: { horizon }
  }),
  
  // Clustering and pattern analysis
  findSpendingPatterns: (analysisType = 'clustering') => api.get('/ml/patterns', {
    params: { type: analysisType }
  }),
  
  // Recommendation engine
  getPersonalizedRecommendations: () => api.get('/ml/recommendations'),
  
  // Forecasting
  forecastSpending: (forecastParams) => api.post('/ml/forecast', forecastParams),
  
  // Anomaly explanation
  explainAnomaly: (anomalyId) => api.get(`/ml/explain-anomaly/${anomalyId}`),
};

// Notification API - AI-powered notifications
export const notificationAPI = {
  getAINotifications: () => api.get('/notifications/ai'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  updateNotificationPreferences: (preferences) => api.put('/notifications/preferences', preferences),
  
  // Smart alerts
  setupSmartAlerts: (alertConfig) => api.post('/notifications/smart-alerts', alertConfig),
  getAlertHistory: () => api.get('/notifications/alert-history'),
};

// Export utility functions for AI data processing
export const aiUtils = {
  // Format ML predictions for display
  formatPrediction: (prediction) => {
    return {
      amount: prediction.predicted_amount,
      confidence: Math.round(prediction.confidence_score * 100),
      trend: prediction.trend_direction,
      isHighConfidence: prediction.confidence_score >= 0.8,
      isMLPowered: prediction.model_used && prediction.model_used !== 'insufficient_data'
    };
  },

  // Format anomaly data
  formatAnomaly: (anomaly) => {
    return {
      ...anomaly,
      severityLevel: anomaly.severity_score >= 0.8 ? 'critical' : 
                   anomaly.severity_score >= 0.6 ? 'high' : 
                   anomaly.severity_score >= 0.4 ? 'medium' : 'low',
      formattedDescription: anomaly.description,
      isMLDetected: anomaly.ml_confidence && anomaly.ml_confidence > 0.7
    };
  },

  // Calculate recommendation impact
  calculateImpact: (recommendation) => {
    const savingsPercentage = (recommendation.potential_savings / recommendation.current_budget) * 100;
    return {
      ...recommendation,
      savingsPercentage: Math.round(savingsPercentage),
      impactLevel: savingsPercentage >= 20 ? 'high' : savingsPercentage >= 10 ? 'medium' : 'low',
      isSignificant: savingsPercentage >= 15
    };
  }
};

// Real-time AI updates using WebSocket (if implemented)
export const aiRealtime = {
  // Connect to AI updates stream
  connectToAIUpdates: (callback) => {
    // WebSocket implementation would go here
    console.log('AI real-time updates would connect here');
  },
  
  // Subscribe to anomaly alerts
  subscribeToAnomalies: (callback) => {
    // Real-time anomaly detection
    console.log('Real-time anomaly detection would subscribe here');
  }
};

// Default export
export default api;
// FIXED: client/src/components/ai/AIDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import { Brain } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SmartExpenseInput from './SmartExpenseInput';
import PredictionCard from './PredictionCard';
import AnomalyAlert from './AnomalyAlert';

const AIDashboard = () => {
  const { user } = useAuth();
  const [aiData, setAiData] = useState({
    predictions: null,
    anomalies: [],
    recommendations: null,
    insights: [],
    isLoading: true
  });

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    setAiData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch all AI data with proper error handling
      const results = await Promise.allSettled([
        aiAPI.getPredictions(),
        aiAPI.getAnomalies(),
        aiAPI.getBudgetRecommendations(),
        aiAPI.getInsights()
      ]);

      const [predictionsResult, anomaliesResult, recommendationsResult, insightsResult] = results;

      setAiData({
        predictions: predictionsResult.status === 'fulfilled' ? predictionsResult.value.data.prediction : null,
        anomalies: anomaliesResult.status === 'fulfilled' ? anomaliesResult.value.data.anomalies || [] : [],
        recommendations: recommendationsResult.status === 'fulfilled' ? recommendationsResult.value.data : null,
        insights: insightsResult.status === 'fulfilled' ? insightsResult.value.data.insights || [] : [],
        isLoading: false
      });

    } catch (error) {
      console.error('Failed to fetch AI data:', error);
      toast.error('Failed to load AI insights');
      setAiData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDataUpdate = () => {
    fetchAIData(); // Refresh data when new expense is created
  };

  if (aiData.isLoading) {
    return (
      <div className="ai-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading AI insights...</p>
      </div>
    );
  }

  return (
    <div className="ai-dashboard">
      {/* AI Dashboard Header */}
      <div className="ai-dashboard-header">
        <div className="ai-header-content">
          <div className="ai-title-section">
            <Brain size={32} className="ai-icon" />
            <div>
              <h1>AI Financial Assistant</h1>
              <p>Intelligent insights powered by machine learning</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Smart Expense Input */}
      <SmartExpenseInput onExpenseCreated={handleDataUpdate} />

      {/* AI Insights Grid */}
      <div className="ai-insights-grid">
        {/* Spending Predictions */}
        <PredictionCard 
          predictions={aiData.predictions}
          user={user}
          onDataUpdate={handleDataUpdate}
        />

        {/* Anomaly Alerts */}
        <AnomalyAlert 
          anomalies={aiData.anomalies}
        />

        {/* Budget Recommendations Card */}
        <div className="ai-card recommendations-card">
          <div className="card-header">
            <div className="card-title">
              <span className="card-icon">🎯</span>
              <h3>Budget Recommendations</h3>
            </div>
          </div>
          <div className="card-content">
            {aiData.recommendations?.recommendations?.length > 0 ? (
              <div className="recommendations-content">
                <div className="main-metric">
                  {formatCurrency(aiData.recommendations.total_potential_savings || 0, user?.preferredCurrency)}
                </div>
                <div className="metric-label">Potential monthly savings</div>
                <div className="recommendations-list">
                  {aiData.recommendations.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="rec-category">{rec.category_name}</div>
                      <div className="rec-amounts">
                        <span className="current-amount">
                          {formatCurrency(rec.current_budget, user?.preferredCurrency)}
                        </span>
                        <span className="arrow">→</span>
                        <span className="recommended-amount">
                          {formatCurrency(rec.recommended_budget, user?.preferredCurrency)}
                        </span>
                      </div>
                      <div className="rec-savings">
                        Save {formatCurrency(rec.potential_savings, user?.preferredCurrency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">🎯</div>
                <h4>Analyzing Spending Patterns</h4>
                <p>Recommendations will appear after more data is available</p>
                <div className="no-data-requirements">
                  <div className="requirement-item">
                    <span className="requirement-icon">📊</span>
                    <span>Add expenses across multiple categories</span>
                  </div>
                  <div className="requirement-item">
                    <span className="requirement-icon">⏱️</span>
                    <span>Track spending for at least 2-3 weeks</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="ai-card insights-card">
          <div className="card-header">
            <div className="card-title">
              <span className="card-icon">💡</span>
              <h3>Smart Insights</h3>
            </div>
            {aiData.insights.filter(i => !i.is_read).length > 0 && (
              <span className="badge">{aiData.insights.filter(i => !i.is_read).length} new</span>
            )}
          </div>
          <div className="card-content">
            {aiData.insights.length > 0 ? (
              <div className="insights-list">
                {aiData.insights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className={`insight-item ${insight.is_read ? 'read' : 'unread'}`}>
                    <div className="insight-header">
                      <span className={`insight-type ${insight.insight_type}`}>
                        {insight.insight_type}
                      </span>
                      <span className={`importance ${insight.importance_level}`}>
                        {insight.importance_level}
                      </span>
                    </div>
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-desc">{insight.description}</div>
                    <div className="insight-date">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">💡</div>
                <h4>No insights available yet</h4>
                <p>AI will generate insights as you use the app</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Quick Stats */}
      <div className="ai-quick-stats">
        <div className="stat-item">
          <div className="stat-icon prediction-stat">📈</div>
          <div className="stat-content">
            <div className="stat-label">Prediction Accuracy</div>
            <div className="stat-value">
              {aiData.predictions?.confidence_score ? `${Math.round(aiData.predictions.confidence_score * 100)}%` : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon anomaly-stat">🚨</div>
          <div className="stat-content">
            <div className="stat-label">Anomalies Detected</div>
            <div className="stat-value">{aiData.anomalies.length}</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon recommendation-stat">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Active Recommendations</div>
            <div className="stat-value">
              {aiData.recommendations?.recommendations?.length || 0}
            </div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon insight-stat">💡</div>
          <div className="stat-content">
            <div className="stat-label">Unread Insights</div>
            <div className="stat-value">
              {aiData.insights.filter(i => !i.is_read).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for currency formatting
const formatCurrency = (amount, currency = 'MKD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  } catch (error) {
    const symbol = currency === 'MKD' ? 'ден' : currency === 'EUR' ? '€' : '$';
    return `${parseFloat(amount || 0).toFixed(2)} ${symbol}`;
  }
};

export default AIDashboard;
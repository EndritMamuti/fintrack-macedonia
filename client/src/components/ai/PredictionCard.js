// FIXED: client/src/components/ai/PredictionCard.js
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, RefreshCw, Target, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { aiAPI } from '../../services/api'; // Removed unused budgetAPI import
import { toast } from 'react-hot-toast';

const PredictionCard = ({ predictions, user, onDataUpdate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [budgetGoal, setBudgetGoal] = useState('');
  const [spendingBreakdown, setSpendingBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp size={16} className="trend-icon increasing" />;
      case 'decreasing':
        return <TrendingDown size={16} className="trend-icon decreasing" />;
      default:
        return <Minus size={16} className="trend-icon stable" />;
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { label: 'High', color: '#10B981' };
    if (confidence >= 0.6) return { label: 'Medium', color: '#F59E0B' };
    return { label: 'Low', color: '#EF4444' };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await aiAPI.getPredictions();
      if (onDataUpdate) {
        onDataUpdate();
      }
      toast.success('Predictions updated successfully');
    } catch (error) {
      toast.error('Failed to refresh predictions');
    }
    setIsRefreshing(false);
  };

  const handleSetBudgetGoal = async () => {
    if (!budgetGoal || budgetGoal <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    try {
      const response = await aiAPI.setBudgetGoal({
        target_amount: parseFloat(budgetGoal),
        period: 'monthly',
        category_id: null
      });

      if (response.data.success) {
        toast.success('Budget goal set successfully!');
        setShowBudgetModal(false);
        setBudgetGoal('');
        if (onDataUpdate) {
          onDataUpdate();
        }
      }
    } catch (error) {
      toast.error('Failed to set budget goal');
    }
  };

  const handleViewBreakdown = async () => {
    setShowBreakdownModal(true);
    setLoadingBreakdown(true);
    
    try {
      const response = await aiAPI.getSpendingBreakdown('month');
      if (response.data.success) {
        setSpendingBreakdown(response.data.breakdown);
      }
    } catch (error) {
      toast.error('Failed to load spending breakdown');
    }
    setLoadingBreakdown(false);
  };

  return (
    <>
      <div className="ai-card predictions-card">
        <div className="card-header">
          <div className="card-title">
            <span className="card-icon">📈</span>
            <h3>Spending Predictions</h3>
          </div>
          <div className="card-actions">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="btn-icon info-btn"
              title="Show details"
            >
              <Info size={16} />
            </button>
            <button 
              onClick={handleRefresh}
              className={`btn-icon refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              title="Refresh predictions"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        <div className="card-content">
          {predictions && predictions.predicted_amount > 0 ? (
            <div className="prediction-content">
              {/* Main Prediction */}
              <div className="main-prediction">
                <div className="predicted-amount">
                  {formatCurrency(predictions.predicted_amount, user?.preferredCurrency)}
                </div>
                <div className="prediction-label">
                  Predicted next month
                  {predictions.trend_direction && (
                    <span className="trend-indicator">
                      {getTrendIcon(predictions.trend_direction)}
                      {predictions.trend_direction}
                    </span>
                  )}
                </div>
                
                {/* ML Badge */}
                {predictions.model_used && predictions.model_used !== 'insufficient_data' && (
                  <div className="ml-badge">
                    🤖 AI Powered Analysis
                  </div>
                )}
              </div>

              {/* Confidence Indicator */}
              <div className="confidence-section">
                <div className="confidence-header">
                  <span className="confidence-label">AI Confidence Level</span>
                  <span 
                    className="confidence-value"
                    style={{ color: getConfidenceLevel(predictions.confidence_score).color }}
                  >
                    {getConfidenceLevel(predictions.confidence_score).label} 
                    ({Math.round(predictions.confidence_score * 100)}%)
                  </span>
                </div>
                <div className="confidence-bar-container">
                  <div 
                    className="confidence-bar"
                    style={{ 
                      '--confidence': `${predictions.confidence_score * 100}%`,
                      '--confidence-color': getConfidenceLevel(predictions.confidence_score).color
                    }}
                  >
                    <div className="confidence-fill"></div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              {showDetails && (
                <div className="prediction-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-icon">📊</div>
                      <div className="detail-content">
                        <div className="detail-label">Data Points</div>
                        <div className="detail-value">
                          {predictions.data_points || 'N/A'} weeks
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon">🎯</div>
                      <div className="detail-content">
                        <div className="detail-label">Model</div>
                        <div className="detail-value">
                          {predictions.model_used === 'statistical_analysis' ? 'Statistical Analysis' : 
                           predictions.model_used || 'Basic Analysis'}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon">📈</div>
                      <div className="detail-content">
                        <div className="detail-label">Volatility</div>
                        <div className="detail-value">
                          {predictions.volatility_score ? 
                            `${Math.round(predictions.volatility_score * 100)}% volatility` : 
                            'Low volatility'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon">🔮</div>
                      <div className="detail-content">
                        <div className="detail-label">Trend</div>
                        <div className="detail-value">
                          {predictions.trend_direction || 'Stable'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="prediction-insights">
                    <h4>🧠 AI Insights</h4>
                    <div className="insights-list">
                      {predictions.trend_direction === 'increasing' && (
                        <div className="insight-item warning">
                          <span className="insight-icon">⚠️</span>
                          <span>AI detects increasing spending trend. Consider budget optimization.</span>
                        </div>
                      )}
                      {predictions.trend_direction === 'decreasing' && (
                        <div className="insight-item positive">
                          <span className="insight-icon">✅</span>
                          <span>Excellent! AI detects decreasing spending trend.</span>
                        </div>
                      )}
                      {predictions.confidence_score >= 0.8 && (
                        <div className="insight-item positive">
                          <span className="insight-icon">🎯</span>
                          <span>High confidence prediction - your spending patterns are predictable.</span>
                        </div>
                      )}
                      <div className="insight-item info">
                        <span className="insight-icon">🤖</span>
                        <span>This prediction uses advanced statistical algorithms.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="prediction-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowBudgetModal(true)}
                >
                  <Target size={16} />
                  Set Budget Goal
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={handleViewBreakdown}
                >
                  <BarChart3 size={16} />
                  View Breakdown
                </button>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">🔮</div>
              <div className="no-data-content">
                <h4>Building Your AI Financial Assistant</h4>
                <p>We need more spending data to train our AI models</p>
                <div className="no-data-requirements">
                  <div className="requirement-item">
                    <span className="requirement-icon">📝</span>
                    <span>Add at least 15-20 expenses</span>
                  </div>
                  <div className="requirement-item">
                    <span className="requirement-icon">📅</span>
                    <span>Spanning multiple weeks</span>
                  </div>
                  <div className="requirement-item">
                    <span className="requirement-icon">🏷️</span>
                    <span>With proper categories</span>
                  </div>
                  <div className="requirement-item">
                    <span className="requirement-icon">🤖</span>
                    <span>For AI algorithm training</span>
                  </div>
                </div>
                <button 
                  className="get-started-btn"
                  onClick={() => window.location.href = '/expenses'}
                >
                  Start Adding Expenses
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Goal Modal */}
      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Set Monthly Budget Goal</h3>
              <button onClick={() => setShowBudgetModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Based on your predicted spending of {formatCurrency(predictions?.predicted_amount || 0, user?.preferredCurrency)}, set a realistic budget goal:</p>
              
              <div className="form-group">
                <label htmlFor="budget-goal">Monthly Budget Goal</label>
                <input
                  id="budget-goal"
                  type="number"
                  value={budgetGoal}
                  onChange={(e) => setBudgetGoal(e.target.value)}
                  placeholder="Enter amount"
                  className="form-input"
                  min="0"
                  step="100"
                />
              </div>
              
              {predictions?.predicted_amount && budgetGoal && (
                <div className="budget-comparison">
                  <div className="comparison-item">
                    <span>Predicted Spending:</span>
                    <span>{formatCurrency(predictions.predicted_amount, user?.preferredCurrency)}</span>
                  </div>
                  <div className="comparison-item">
                    <span>Your Goal:</span>
                    <span>{formatCurrency(parseFloat(budgetGoal || 0), user?.preferredCurrency)}</span>
                  </div>
                  <div className={`comparison-item ${parseFloat(budgetGoal) < predictions.predicted_amount ? 'savings' : 'over-budget'}`}>
                    <span>Difference:</span>
                    <span>
                      {parseFloat(budgetGoal) < predictions.predicted_amount ? 'Save ' : 'Over by '}
                      {formatCurrency(Math.abs(parseFloat(budgetGoal) - predictions.predicted_amount), user?.preferredCurrency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBudgetModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSetBudgetGoal} className="btn btn-primary">
                Set Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spending Breakdown Modal */}
      {showBreakdownModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Monthly Spending Breakdown</h3>
              <button onClick={() => setShowBreakdownModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              {loadingBreakdown ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Analyzing your spending patterns...</p>
                </div>
              ) : spendingBreakdown && spendingBreakdown.length > 0 ? (
                <div className="breakdown-content">
                  <div className="breakdown-summary">
                    <h4>Category Breakdown</h4>
                    <p>Here's how your spending is distributed across categories this month:</p>
                  </div>
                  
                  <div className="breakdown-list">
                    {spendingBreakdown.map((item, index) => (
                      <div key={index} className="breakdown-item">
                        <div className="breakdown-category">
                          <div 
                            className="category-color"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="category-name">{item.category}</span>
                        </div>
                        <div className="breakdown-stats">
                          <div className="stat">
                            <span className="stat-label">Total:</span>
                            <span className="stat-value">{formatCurrency(item.total, user?.preferredCurrency)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Transactions:</span>
                            <span className="stat-value">{item.transaction_count}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Average:</span>
                            <span className="stat-value">{formatCurrency(item.avg_transaction, user?.preferredCurrency)}</span>
                          </div>
                          <div className="stat percentage">
                            <span className="stat-label">% of Total:</span>
                            <span className="stat-value">{Math.round(item.percentage || 0)}%</span>
                          </div>
                        </div>
                        <div className="breakdown-bar">
                          <div 
                            className="breakdown-fill"
                            style={{ 
                              width: `${item.percentage || 0}%`,
                              backgroundColor: item.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-breakdown-data">
                  <p>No spending data available for this month.</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBreakdownModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PredictionCard;
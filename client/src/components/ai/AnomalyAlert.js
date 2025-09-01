// client/src/components/ai/AnomalyAlert.js

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AnomalyAlert = ({ anomalies }) => {
  const [dismissedAnomalies, setDismissedAnomalies] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const getSeverityConfig = (severity) => {
    if (severity >= 0.8) {
      return {
        level: 'critical',
        color: '#DC2626',
        bg: '#FEF2F2',
        icon: AlertTriangle,
        label: 'Critical'
      };
    } else if (severity >= 0.6) {
      return {
        level: 'high',
        color: '#EA580C',
        bg: '#FFF7ED',
        icon: AlertCircle,
        label: 'High'
      };
    } else if (severity >= 0.4) {
      return {
        level: 'medium',
        color: '#F59E0B',
        bg: '#FFFBEB',
        icon: AlertTriangle,
        label: 'Medium'
      };
    } else {
      return {
        level: 'low',
        color: '#10B981',
        bg: '#F0FDF4',
        icon: AlertCircle,
        label: 'Low'
      };
    }
  };

  const handleDismiss = (anomalyIndex) => {
    setDismissedAnomalies(prev => new Set([...prev, anomalyIndex]));
  };

  const handleAcknowledge = (anomalyIndex) => {
    // In a real app, this would make an API call to mark as acknowledged
    console.log('Acknowledging anomaly:', anomalyIndex);
    handleDismiss(anomalyIndex);
  };

  const visibleAnomalies = anomalies.filter((_, index) => !dismissedAnomalies.has(index));
  const displayedAnomalies = showAll ? visibleAnomalies : visibleAnomalies.slice(0, 3);

  return (
    <div className="ai-card anomalies-card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">🚨</span>
          <h3>Spending Anomalies</h3>
        </div>
        <div className="card-actions">
          {visibleAnomalies.length > 0 && (
            <div className="anomaly-summary">
              <span className="anomaly-count">{visibleAnomalies.length}</span>
              <span className="anomaly-label">detected</span>
            </div>
          )}
          {visibleAnomalies.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="btn-icon toggle-btn"
              title={showAll ? 'Show less' : 'Show all'}
            >
              {showAll ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="card-content">
        {visibleAnomalies.length > 0 ? (
          <div className="anomalies-container">
            {/* Severity Distribution */}
            <div className="severity-overview">
              <div className="severity-stats">
                {['critical', 'high', 'medium', 'low'].map(level => {
                  const count = visibleAnomalies.filter(a => getSeverityConfig(a.severity_score).level === level).length;
                  if (count === 0) return null;
                  
                  const config = getSeverityConfig(level === 'critical' ? 0.9 : level === 'high' ? 0.7 : level === 'medium' ? 0.5 : 0.3);
                  
                  return (
                    <div key={level} className="severity-stat" style={{ '--color': config.color }}>
                      <div className="stat-count">{count}</div>
                      <div className="stat-label">{config.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anomaly List */}
            <div className="anomalies-list">
              {displayedAnomalies.map((anomaly, index) => {
                const config = getSeverityConfig(anomaly.severity_score);
                const IconComponent = config.icon;
                
                return (
                  <div 
                    key={index} 
                    className={`anomaly-item ${config.level}`}
                    style={{ 
                      borderLeftColor: config.color,
                      backgroundColor: config.bg 
                    }}
                  >
                    <div className="anomaly-header">
                      <div className="anomaly-icon" style={{ color: config.color }}>
                        <IconComponent size={20} />
                      </div>
                      <div className="anomaly-meta">
                        <div className="severity-badge" style={{ backgroundColor: config.color }}>
                          {config.label}
                        </div>
                        <div className="severity-score">
                          {Math.round(anomaly.severity_score * 100)}% unusual
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDismiss(index)}
                        className="dismiss-btn"
                        title="Dismiss"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="anomaly-content">
                      <div className="anomaly-description">
                        {anomaly.description}
                      </div>
                      
                      <div className="anomaly-details">
                        <div className="detail-row">
                          <span className="detail-label">Expected:</span>
                          <span className="detail-value expected">
                            {anomaly.expected_value?.toLocaleString()} MKD
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Actual:</span>
                          <span className="detail-value actual">
                            {anomaly.actual_value?.toLocaleString()} MKD
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Difference:</span>
                          <span className="detail-value difference">
                            +{(anomaly.actual_value - anomaly.expected_value)?.toLocaleString()} MKD
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="anomaly-actions">
                      <button 
                        onClick={() => handleAcknowledge(index)}
                        className="action-btn acknowledge"
                      >
                        <CheckCircle size={14} />
                        Acknowledge
                      </button>
                      <button className="action-btn view-expense">
                        <Eye size={14} />
                        View Expense
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More/Less Button */}
            {visibleAnomalies.length > 3 && (
              <div className="show-more-section">
                <button 
                  onClick={() => setShowAll(!showAll)}
                  className="show-more-btn"
                >
                  {showAll ? (
                    <>
                      <EyeOff size={16} />
                      Show Less
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      Show {visibleAnomalies.length - 3} More
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Anomaly Insights */}
            <div className="anomaly-insights">
              <h4>🧠 AI Insights</h4>
              <div className="insights-grid">
                {visibleAnomalies.length > 5 && (
                  <div className="insight-card warning">
                    <span className="insight-icon">⚠️</span>
                    <div className="insight-content">
                      <div className="insight-title">Multiple Anomalies Detected</div>
                      <div className="insight-desc">Consider reviewing your recent spending patterns</div>
                    </div>
                  </div>
                )}
                
                {visibleAnomalies.some(a => a.severity_score > 0.8) && (
                  <div className="insight-card critical">
                    <span className="insight-icon">🔥</span>
                    <div className="insight-content">
                      <div className="insight-title">Critical Spending Alert</div>
                      <div className="insight-desc">Some expenses are significantly higher than usual</div>
                    </div>
                  </div>
                )}
                
                <div className="insight-card info">
                  <span className="insight-icon">💡</span>
                  <div className="insight-content">
                    <div className="insight-title">Pattern Recognition</div>
                    <div className="insight-desc">AI analyzes your spending patterns to detect unusual activity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <div className="no-data-icon">✅</div>
            <div className="no-data-content">
              <h4>All Clear!</h4>
              <p>No unusual spending patterns detected</p>
              <div className="no-anomaly-stats">
                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <span>Your spending is within normal patterns</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🤖</span>
                  <span>AI is monitoring your expenses 24/7</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🔔</span>
                  <span>You'll be notified of any unusual activity</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAlert;
import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend = 'neutral' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-info">
          <h4 className="stats-title">{title}</h4>
          <p className="stats-value">{value}</p>
        </div>
        <div 
          className="stats-icon"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={24} />
        </div>
      </div>
      
      {trend !== 'neutral' && (
        <div className="stats-trend">
          <div 
            className="trend-indicator"
            style={{ color: getTrendColor() }}
          >
            {trend === 'up' ? '↗' : '↘'} {trend === 'up' ? 'Increase' : 'Decrease'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
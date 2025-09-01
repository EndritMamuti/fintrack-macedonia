import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Target } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-hot-toast';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    categoryBreakdown: [],
    monthlyTrend: [],
    totalSpending: 0,
    period: 'month'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const fetchAnalytics = async (period) => {
    setIsLoading(true);
    try {
      const response = await expenseAPI.getAnalytics(period);
      setAnalyticsData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    }
    setIsLoading(false);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const COLORS = [
    '#2563EB', '#059669', '#DC2626', '#7C3AED', 
    '#F59E0B', '#EC4899', '#10B981', '#6366F1'
  ];

  const formatMonthlyTrendData = (data) => {
    return data.map(item => ({
      month: new Date(item.month).toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      }),
      amount: parseFloat(item.total)
    }));
  };

  const formatCategoryData = (data) => {
    return data.map(item => ({
      name: item.name,
      value: parseFloat(item.total),
      color: item.color,
      count: item.count
    }));
  };

  const getTopSpendingCategory = () => {
    if (analyticsData.categoryBreakdown.length === 0) return null;
    return analyticsData.categoryBreakdown.reduce((top, current) => 
      parseFloat(current.total) > parseFloat(top.total) ? current : top
    );
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial analytics...</p>
      </div>
    );
  }

  const topCategory = getTopSpendingCategory();
  const categoryData = formatCategoryData(analyticsData.categoryBreakdown);
  const trendData = formatMonthlyTrendData(analyticsData.monthlyTrend);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Insights into your spending patterns</p>
        </div>
        
        <div className="period-selector">
          {['week', 'month', 'year'].map(period => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} style={{ color: '#2563EB' }} />
          </div>
          <div className="stat-content">
            <h3>Total Spent</h3>
            <p className="stat-value">
              {formatCurrency(analyticsData.totalSpending, user?.preferredCurrency)}
            </p>
            <span className="stat-period">{getPeriodLabel()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} style={{ color: '#059669' }} />
          </div>
          <div className="stat-content">
            <h3>Top Category</h3>
            <p className="stat-value">
              {topCategory ? topCategory.name : 'No data'}
            </p>
            <span className="stat-period">
              {topCategory ? formatCurrency(topCategory.total, user?.preferredCurrency) : ''}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} style={{ color: '#7C3AED' }} />
          </div>
          <div className="stat-content">
            <h3>Transactions</h3>
            <p className="stat-value">
              {analyticsData.categoryBreakdown.reduce((total, cat) => total + parseInt(cat.count), 0)}
            </p>
            <span className="stat-period">{getPeriodLabel()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} style={{ color: '#DC2626' }} />
          </div>
          <div className="stat-content">
            <h3>Categories</h3>
            <p className="stat-value">{analyticsData.categoryBreakdown.length}</p>
            <span className="stat-period">Used {getPeriodLabel().toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Category Breakdown Pie Chart */}
        <div className="chart-card">
          <h3>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value, user?.preferredCurrency)}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="category-legend">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ 
                        backgroundColor: category.color || COLORS[index % COLORS.length] 
                      }}
                    ></div>
                    <span className="legend-name">{category.name}</span>
                    <span className="legend-value">
                      {formatCurrency(category.value, user?.preferredCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-chart">
              <p>No spending data available for the selected period</p>
            </div>
          )}
        </div>

        {/* Monthly Trend Bar Chart */}
        {trendData.length > 0 && (
          <div className="chart-card">
            <h3>Spending Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value, user?.preferredCurrency), 'Amount']}
                />
                <Bar dataKey="amount" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <div className="insights-card">
          <h3>Financial Insights</h3>
          <div className="insights-list">
            {topCategory && (
              <div className="insight-item">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <strong>Top Spending Category:</strong> You spent the most on {topCategory.name} 
                  ({formatCurrency(topCategory.total, user?.preferredCurrency)}) {getPeriodLabel().toLowerCase()}.
                </div>
              </div>
            )}
            
            {analyticsData.categoryBreakdown.length > 0 && (
              <div className="insight-item">
                <div className="insight-icon">📊</div>
                <div className="insight-content">
                  <strong>Spending Spread:</strong> Your expenses are distributed across {analyticsData.categoryBreakdown.length} different categories.
                </div>
              </div>
            )}

            {selectedPeriod === 'month' && (
              <div className="insight-item">
                <div className="insight-icon">📅</div>
                <div className="insight-content">
                  <strong>Daily Average:</strong> You spend approximately {' '}
                  {formatCurrency(analyticsData.totalSpending / new Date().getDate(), user?.preferredCurrency)} per day this month.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
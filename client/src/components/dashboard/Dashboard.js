import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { expenseAPI } from '../../services/api';
import StatsCard from './StatsCard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalSpending: 0,
    monthlySpending: 0,
    categoryBreakdown: [],
    recentExpenses: [],
    isLoading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics for current month
      const analyticsResponse = await expenseAPI.getAnalytics('month');
      
      // Fetch recent expenses
      const expensesResponse = await expenseAPI.getExpenses({ limit: 5 });
      
      setDashboardData({
        totalSpending: analyticsResponse.data.totalSpending,
        monthlySpending: analyticsResponse.data.totalSpending,
        categoryBreakdown: analyticsResponse.data.categoryBreakdown,
        recentExpenses: expensesResponse.data.expenses,
        isLoading: false
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getTopCategories = () => {
    return dashboardData.categoryBreakdown
      .slice(0, 3)
      .map(cat => ({
        name: cat.name,
        amount: cat.total,
        color: cat.color
      }));
  };

  if (dashboardData.isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial overview...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
          <p className="dashboard-subtitle">
            Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/expenses" className="add-expense-btn">
          <Plus size={20} />
          Add Expense
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total This Month"
          value={formatCurrency(dashboardData.monthlySpending, user?.preferredCurrency)}
          icon={DollarSign}
          color="#2563EB"
          trend={dashboardData.monthlySpending > 0 ? 'up' : 'neutral'}
        />
        
        <StatsCard
          title="Categories Used"
          value={dashboardData.categoryBreakdown.length}
          icon={Calendar}
          color="#059669"
          trend="neutral"
        />
        
        <StatsCard
          title="Recent Transactions"
          value={dashboardData.recentExpenses.length}
          icon={TrendingUp}
          color="#DC2626"
          trend="neutral"
        />
        
        <StatsCard
          title="Average Daily"
          value={formatCurrency(dashboardData.monthlySpending / new Date().getDate(), user?.preferredCurrency)}
          icon={TrendingDown}
          color="#7C3AED"
          trend="neutral"
        />
      </div>

      <div className="dashboard-content">
        {/* Recent Expenses */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Expenses</h3>
            <Link to="/expenses" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {dashboardData.recentExpenses.length > 0 ? (
            <div className="recent-expenses">
              {dashboardData.recentExpenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-category">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: expense.category_color }}
                    ></div>
                    <span className="category-name">{expense.category_name}</span>
                  </div>
                  <div className="expense-details">
                    <div className="expense-description">{expense.description}</div>
                    <div className="expense-date">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="expense-amount">
                    {formatCurrency(expense.amount, expense.currency)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No expenses yet this month</p>
              <Link to="/expenses" className="empty-state-action">
                Add your first expense
              </Link>
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Top Categories</h3>
            <Link to="/analytics" className="view-all-link">
              View Analytics <ArrowRight size={16} />
            </Link>
          </div>
          
          {getTopCategories().length > 0 ? (
            <div className="top-categories">
              {getTopCategories().map((category, index) => (
                <div key={category.name} className="category-item">
                  <div className="category-info">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-amount">
                    {formatCurrency(category.amount, user?.preferredCurrency)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No spending data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
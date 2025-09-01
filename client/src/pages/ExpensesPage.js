import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI, categoryAPI } from '../services/api';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const fetchExpenses = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(filters.category && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      // Use the correct method name that matches your API
      const response = await expenseAPI.getAll(params);
      
      if (response.data && response.data.expenses) {
        setExpenses(response.data.expenses);
        setPagination(response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.expenses.length
        });
      } else {
        console.error('Invalid expenses response:', response.data);
        setExpenses([]);
      }
    } catch (error) {
      console.error('Fetch expenses error:', error);
      toast.error('Failed to load expenses: ' + (error.response?.data?.message || error.message));
      setExpenses([]);
    }
    setIsLoading(false);
  }, [filters.category, filters.startDate, filters.endDate]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoryAPI.getAll();
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      } else {
        console.error('Invalid categories response:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Don't show toast error for categories in filter - it's not critical
      setCategories([]);
    }
    setCategoriesLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Load both expenses and categories in parallel
      await Promise.all([fetchExpenses(), fetchCategories()]);
    };
    loadData();
  }, [fetchExpenses, fetchCategories]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddExpense = () => {
    setEditExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await expenseAPI.delete(expenseId);
      toast.success('Expense deleted successfully');
      fetchExpenses(pagination.currentPage);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses(1); // Go back to first page after adding
  };

  const handlePageChange = (page) => {
    fetchExpenses(page);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const filteredExpenses = expenses.filter(expense =>
    filters.search === '' || 
    expense.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
    expense.category_name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>Track and manage your spending</p>
        </div>
        <button
          onClick={handleAddExpense}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category filter with better error handling */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : 'All Categories'}
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            {!categoriesLoading && categories.length === 0 && (
              <option value="" disabled>No categories available</option>
            )}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="filter-date"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="filter-date"
            placeholder="End Date"
          />

          <button
            onClick={clearFilters}
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="expenses-content">
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onExpenseAdded={handleExpenseAdded}
        editExpense={editExpense}
      />
    </div>
  );
};

export default ExpensesPage;
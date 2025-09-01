import React, { useState, useEffect, useCallback } from 'react';
import { categoryAPI, expenseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { X, Save } from 'lucide-react';

const ExpenseForm = ({ isOpen, onClose, onExpenseAdded, editExpense = null }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    currency: user?.preferredCurrency || 'MKD'
  });

  // Memoize resetForm to avoid useEffect dependency issues
  const resetForm = useCallback(() => {
    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      currency: user?.preferredCurrency || 'MKD'
    });
  }, [user?.preferredCurrency]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    console.log('Fetching categories...'); // Debug log
    
    try {
      const response = await categoryAPI.getAll();
      console.log('Categories response:', response.data); // Debug log
      
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
        console.log('Categories set:', response.data.categories); // Debug log
      } else {
        console.error('Invalid categories response structure:', response.data);
        toast.error('Invalid categories data format');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories: ' + (error.response?.data?.message || error.message));
    }
    
    setCategoriesLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      console.log('ExpenseForm opened, fetching categories...'); // Debug log
      fetchCategories();
      
      if (editExpense) {
        setFormData({
          amount: editExpense.amount,
          categoryId: editExpense.category_id,
          description: editExpense.description,
          expenseDate: editExpense.expense_date,
          currency: editExpense.currency
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editExpense, resetForm, fetchCategories]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editExpense) {
        await expenseAPI.update(editExpense.id, formData);
        toast.success('Expense updated successfully');
      } else {
        await expenseAPI.create(formData);
        toast.success('Expense added successfully');
      }
      
      onExpenseAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save expense');
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="form-input"
              >
                <option value="MKD">MKD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category</label>
            {categoriesLoading ? (
              <div className="loading-categories">Loading categories...</div>
            ) : categories.length > 0 ? (
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="categories-error">
                <select disabled className="form-input">
                  <option>No categories available</option>
                </select>
                <button 
                  type="button" 
                  onClick={fetchCategories}
                  className="retry-btn"
                >
                  Retry Loading Categories
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="What did you spend on?"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="expenseDate">Date</label>
            <input
              type="date"
              id="expenseDate"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || categories.length === 0}
              className="btn btn-primary"
            >
              {isLoading ? (
                <div className="button-loading">
                  <div className="spinner"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save size={18} />
                  {editExpense ? 'Update Expense' : 'Add Expense'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
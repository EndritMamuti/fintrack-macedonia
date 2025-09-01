// Expense model for data validation and structure
class Expense {
  constructor(expenseData) {
    this.id = expenseData.id;
    this.user_id = expenseData.user_id;
    this.category_id = expenseData.category_id;
    this.amount = expenseData.amount;
    this.currency = expenseData.currency || 'MKD';
    this.description = expenseData.description;
    this.expense_date = expenseData.expense_date;
    this.receipt_url = expenseData.receipt_url;
    this.is_recurring = expenseData.is_recurring || false;
    this.created_at = expenseData.created_at;
    this.updated_at = expenseData.updated_at;
    
    // Category info (if joined)
    this.category_name = expenseData.category_name;
    this.category_color = expenseData.category_color;
  }

  // Static method to validate expense data
  static validate(expenseData) {
    const errors = [];

    // Amount validation
    if (!expenseData.amount) {
      errors.push('Amount is required');
    } else {
      const amount = parseFloat(expenseData.amount);
      if (isNaN(amount)) {
        errors.push('Amount must be a valid number');
      } else if (amount <= 0) {
        errors.push('Amount must be greater than 0');
      } else if (amount > 999999.99) {
        errors.push('Amount must be less than 1,000,000');
      }
    }

    // Currency validation
    const validCurrencies = ['MKD', 'EUR', 'USD'];
    if (expenseData.currency && !validCurrencies.includes(expenseData.currency)) {
      errors.push('Invalid currency. Must be MKD, EUR, or USD');
    }

    // Description validation
    if (!expenseData.description) {
      errors.push('Description is required');
    } else if (expenseData.description.trim().length < 1) {
      errors.push('Description cannot be empty');
    } else if (expenseData.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    // Category validation
    if (!expenseData.categoryId) {
      errors.push('Category is required');
    } else if (isNaN(parseInt(expenseData.categoryId))) {
      errors.push('Category ID must be a valid number');
    }

    // Date validation
    if (!expenseData.expenseDate) {
      errors.push('Expense date is required');
    } else {
      const date = new Date(expenseData.expenseDate);
      if (isNaN(date.getTime())) {
        errors.push('Please provide a valid date');
      }
      
      // Check if date is not too far in future (1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (date > oneYearFromNow) {
        errors.push('Expense date cannot be more than 1 year in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format amount with proper decimal places
  static formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
  }

  // Convert to API response format
  toResponseObject() {
    return {
      id: this.id,
      userId: this.user_id,
      categoryId: this.category_id,
      amount: parseFloat(this.amount),
      currency: this.currency,
      description: this.description,
      expenseDate: this.expense_date,
      receiptUrl: this.receipt_url,
      isRecurring: this.is_recurring,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
      // Category info if available
      ...(this.category_name && {
        category: {
          name: this.category_name,
          color: this.category_color
        }
      })
    };
  }

  // Group expenses by date
  static groupByDate(expenses) {
    return expenses.reduce((groups, expense) => {
      const date = expense.expense_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    }, {});
  }

  // Calculate total amount for array of expenses
  static calculateTotal(expenses) {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }

  // Convert database row to Expense instance
  static fromDatabaseRow(row) {
    return new Expense(row);
  }
}

module.exports = Expense;
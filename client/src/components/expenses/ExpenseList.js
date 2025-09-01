import React from 'react';
import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ expenses, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="expense-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <h3>No expenses found</h3>
          <p>Start tracking your expenses by adding your first entry.</p>
        </div>
      </div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.expense_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  return (
    <div className="expense-list">
      {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
        <div key={date} className="expense-day-group">
          <div className="day-header">
            <h4 className="day-date">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            <div className="day-total">
              Total: {dayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)} {dayExpenses[0].currency}
            </div>
          </div>
          
          <div className="day-expenses">
            {dayExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
import React, { useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    onEdit(expense);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDelete(expense.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="expense-item">
      <div className="expense-category">
        <div 
          className="category-indicator"
          style={{ backgroundColor: expense.category_color }}
        ></div>
        <span className="category-name">{expense.category_name}</span>
      </div>

      <div className="expense-details">
        <div className="expense-description">{expense.description}</div>
        <div className="expense-meta">
          <span className="expense-time">
            {new Date(expense.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>
      </div>

      <div className="expense-amount">
        {formatCurrency(expense.amount, expense.currency)}
      </div>

      <div className="expense-actions">
        <button
          className="action-menu-trigger"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div className="action-menu">
            <button
              onClick={handleEdit}
              className="action-menu-item edit"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="action-menu-item delete"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseItem;
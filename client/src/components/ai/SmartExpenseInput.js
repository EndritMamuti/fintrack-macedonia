// FIXED: client/src/components/ai/SmartExpenseInput.js
import React, { useState, useEffect } from 'react';
import { aiAPI, expenseAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Wand2, Check, X, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SmartExpenseInput = ({ onExpenseCreated }) => {
  const { user } = useAuth();
  const [nlpInput, setNlpInput] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleNLPParse = async () => {
    if (!nlpInput.trim()) {
      toast.error('Please enter an expense description');
      return;
    }

    setNlpLoading(true);
    try {
const response = await aiAPI.parseExpense(nlpInput.trim());
      if (response.data.success) {
        setNlpResult(response.data);
        setEditedValues(response.data.suggestions);
        
        if (response.data.parsed.confidence > 0.8) {
          toast.success('Expense parsed successfully!');
        } else {
          toast.info('Expense parsed, please review the details');
        }
      } else {
        toast.error(response.data.message || 'Failed to parse expense');
      }
    } catch (error) {
      console.error('NLP parsing error:', error);
      toast.error('Failed to parse expense text');
    }
    setNlpLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    setNlpResult(prev => ({
      ...prev,
      suggestions: editedValues
    }));
    toast.success('Changes saved');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedValues(nlpResult.suggestions);
  };

  const handleEditChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createExpenseFromNLP = async () => {
    if (!nlpResult?.suggestions) return;

    // Find category ID from category name
    const categoryId = categories.find(cat => 
      cat.name.toLowerCase() === editedValues.category?.toLowerCase()
    )?.id || categories[0]?.id;

    if (!categoryId) {
      toast.error('Please select a valid category');
      return;
    }

    // Validate required fields
    if (!editedValues.amount || !editedValues.description) {
      toast.error('Amount and description are required');
      return;
    }

    try {
      const response = await expenseAPI.create({
        amount: editedValues.amount,
        categoryId: categoryId,
        description: editedValues.description,
        expenseDate: editedValues.date,
        currency: editedValues.currency || user?.preferredCurrency || 'MKD'
      });

      if (response.data.message?.includes('successfully')) {
        toast.success('Expense created successfully!');
        setNlpInput('');
        setNlpResult(null);
        setEditedValues({});
        if (onExpenseCreated) {
          onExpenseCreated();
        }
      } else {
        toast.error(response.data.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Create expense error:', error);
      toast.error('Failed to create expense');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10B981'; // green
    if (confidence >= 0.6) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const exampleInputs = [
    "I spent 500 denars on groceries today",
    "Paid 50 EUR for dinner last night", 
    "Bought coffee for 150 денари this morning",
    "Gas expense 2000 MKD yesterday"
  ];

  return (
    <div className="smart-expense-input">
      <div className="smart-input-card">
        <div className="card-header">
          <div className="card-title">
            <MessageSquare size={24} />
            <h3>Smart Expense Entry</h3>
          </div>
          <div className="ai-badge">
            <Wand2 size={16} />
            AI Powered
          </div>
        </div>
        
        <div className="card-content">
          {/* Input Section */}
          <div className="input-section">
            <div className="input-wrapper">
              <textarea
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                placeholder="Describe your expense in natural language..."
                className="nlp-input"
                rows={3}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleNLPParse();
                  }
                }}
              />
              <button 
                onClick={handleNLPParse}
                disabled={nlpLoading || !nlpInput.trim()}
                className="parse-btn"
              >
                <Wand2 size={18} />
                {nlpLoading ? 'Parsing...' : 'Parse'}
              </button>
            </div>
            
            {/* Example inputs */}
            <div className="example-inputs">
              <span className="example-label">Try these examples:</span>
              <div className="examples-grid">
                {exampleInputs.map((example, index) => (
                  <button
                    key={index}
                    className="example-btn"
                    onClick={() => setNlpInput(example)}
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Parsed Result */}
          {nlpResult && (
            <div className="nlp-result">
              <div className="result-header">
                <div className="confidence-indicator">
                  <div className="confidence-label">AI Confidence</div>
                  <div 
                    className="confidence-bar"
                    style={{ 
                      '--confidence': `${nlpResult.parsed.confidence * 100}%`,
                      '--confidence-color': getConfidenceColor(nlpResult.parsed.confidence)
                    }}
                  >
                    <div className="confidence-fill"></div>
                    <span className="confidence-text">
                      {Math.round(nlpResult.parsed.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="result-actions">
                  {!isEditing ? (
                    <button onClick={handleEdit} className="btn-icon edit-btn">
                      <Edit3 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button onClick={handleSaveEdit} className="btn-icon save-btn">
                        <Check size={16} />
                      </button>
                      <button onClick={handleCancelEdit} className="btn-icon cancel-btn">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="parsed-details">
                <div className="detail-item">
                  <label className="detail-label">Amount</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedValues.amount || ''}
                      onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                      className="detail-input"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className="detail-value amount-value">
                      {editedValues.amount} {editedValues.currency || user?.preferredCurrency || 'MKD'}
                    </span>
                  )}
                </div>

                <div className="detail-item">
                  <label className="detail-label">Category</label>
                  {isEditing ? (
                    <select
                      value={editedValues.category || ''}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="detail-select"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="detail-value category-value">
                      {editedValues.category || 'Not detected'}
                    </span>
                  )}
                </div>

                <div className="detail-item">
                  <label className="detail-label">Description</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedValues.description || ''}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      className="detail-input"
                    />
                  ) : (
                    <span className="detail-value description-value">
                      {editedValues.description}
                    </span>
                  )}
                </div>

                <div className="detail-item">
                  <label className="detail-label">Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedValues.date || ''}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      className="detail-input"
                    />
                  ) : (
                    <span className="detail-value date-value">
                      {new Date(editedValues.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="nlp-actions">
                <button 
                  onClick={() => { setNlpResult(null); setNlpInput(''); }}
                  className="btn btn-secondary"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  onClick={createExpenseFromNLP} 
                  className="btn btn-primary"
                  disabled={!editedValues.amount || !editedValues.description}
                >
                  <Check size={18} />
                  Create Expense
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartExpenseInput;
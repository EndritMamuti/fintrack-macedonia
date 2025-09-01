const pool = require('../config/database');

// Get all expenses for user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    
    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 1;
    
    // Add filters
    if (category) {
      paramCount++;
      query += ` AND e.category_id = $${paramCount}`;
      queryParams.push(category);
    }
    
    if (startDate) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      queryParams.push(endDate);
    }
    
    query += ' ORDER BY e.expense_date DESC, e.created_at DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);
    
    const expenses = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM expenses WHERE user_id = $1';
    const countParams = [userId];
    
    const totalResult = await pool.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count);
    
    res.json({
      expenses: expenses.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, categoryId, description, expenseDate, currency = 'MKD' } = req.body;
    
    const newExpense = await pool.query(
      `INSERT INTO expenses (user_id, category_id, amount, currency, description, expense_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, categoryId, amount, currency, description, expenseDate]
    );
    
    // Get expense with category info
    const expenseWithCategory = await pool.query(
      `SELECT e.*, c.name as category_name, c.color as category_color
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1`,
      [newExpense.rows[0].id]
    );
    
    res.status(201).json({
      message: 'Expense created successfully',
      expense: expenseWithCategory.rows[0]
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { amount, categoryId, description, expenseDate, currency } = req.body;
    
    const updatedExpense = await pool.query(
      `UPDATE expenses 
       SET amount = $1, category_id = $2, description = $3, expense_date = $4, currency = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [amount, categoryId, description, expenseDate, currency, expenseId, userId]
    );
    
    if (updatedExpense.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense.rows[0]
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    
    const deletedExpense = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [expenseId, userId]
    );
    
    if (deletedExpense.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

// Get expense analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = "AND expense_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND expense_date >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "AND expense_date >= CURRENT_DATE - INTERVAL '365 days'";
        break;
    }
    
    // Category breakdown
    const categoryBreakdown = await pool.query(`
      SELECT c.name, c.color, SUM(e.amount) as total, COUNT(e.id) as count
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1 ${dateFilter}
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `, [userId]);
    
    // Monthly trend (last 6 months)
    const monthlyTrend = await pool.query(`
      SELECT 
        DATE_TRUNC('month', expense_date) as month,
        SUM(amount) as total
      FROM expenses
      WHERE user_id = $1 AND expense_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', expense_date)
      ORDER BY month
    `, [userId]);
    
    // Total spending
    const totalSpending = await pool.query(`
      SELECT SUM(amount) as total
      FROM expenses
      WHERE user_id = $1 ${dateFilter}
    `, [userId]);
    
    res.json({
      categoryBreakdown: categoryBreakdown.rows,
      monthlyTrend: monthlyTrend.rows,
      totalSpending: totalSpending.rows[0].total || 0,
      period
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics
};
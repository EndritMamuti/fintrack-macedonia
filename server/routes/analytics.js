const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET /api/analytics/overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get total expenses for the period
    const totalResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3',
      [userId, startDate, endDate]
    );

    // Get expenses by category
    const categoryResult = await pool.query(`
      SELECT c.name, c.color, COALESCE(SUM(e.amount), 0) as amount
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = $1 AND e.created_at >= $2 AND e.created_at <= $3
      WHERE c.user_id = $1
      GROUP BY c.id, c.name, c.color
      ORDER BY amount DESC
    `, [userId, startDate, endDate]);

    // Get daily expenses for chart
    const dailyResult = await pool.query(`
      SELECT DATE(created_at) as date, SUM(amount) as amount
      FROM expenses
      WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [userId, startDate, endDate]);

    res.json({
      total: parseFloat(totalResult.rows[0].total) || 0,
      categories: categoryResult.rows.map(row => ({
        name: row.name,
        color: row.color,
        amount: parseFloat(row.amount) || 0
      })),
      daily: dailyResult.rows.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount) || 0
      }))
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

// GET /api/analytics/insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current month expenses
    const currentMonth = new Date();
    const firstDayCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const currentMonthResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND created_at >= $2',
      [userId, firstDayCurrentMonth]
    );

    // Get previous month expenses
    const firstDayPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    const previousMonthResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3',
      [userId, firstDayPreviousMonth, lastDayPreviousMonth]
    );

    // Get most expensive category this month
    const topCategoryResult = await pool.query(`
      SELECT c.name, SUM(e.amount) as amount
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1 AND e.created_at >= $2
      GROUP BY c.id, c.name
      ORDER BY amount DESC
      LIMIT 1
    `, [userId, firstDayCurrentMonth]);

    const currentTotal = parseFloat(currentMonthResult.rows[0].total) || 0;
    const previousTotal = parseFloat(previousMonthResult.rows[0].total) || 0;
    const changePercentage = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;

    res.json({
      currentMonth: currentTotal,
      previousMonth: previousTotal,
      changePercentage: Math.round(changePercentage * 100) / 100,
      topCategory: topCategoryResult.rows[0] ? {
        name: topCategoryResult.rows[0].name,
        amount: parseFloat(topCategoryResult.rows[0].amount)
      } : null
    });
  } catch (error) {
    console.error('Analytics insights error:', error);
    res.status(500).json({ message: 'Failed to fetch insights data' });
  }
});

module.exports = router;
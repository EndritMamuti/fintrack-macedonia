const express = require('express');
const { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  getExpenseAnalytics 
} = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');
const { validateExpense } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Analytics route must come before /:id routes
router.get('/analytics', getExpenseAnalytics);
router.get('/', getExpenses);
router.post('/', validateExpense, createExpense);
router.put('/:id', validateExpense, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
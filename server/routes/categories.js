const express = require('express');
const { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', validateCategory, createCategory);
router.put('/:id', validateCategory, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
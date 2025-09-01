const pool = require('../config/database');

// Get all categories for user
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const categories = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    
    res.json({ categories: categories.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color = '#3B82F6', icon = 'folder' } = req.body;
    
    const newCategory = await pool.query(
      'INSERT INTO categories (user_id, name, color, icon) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name.trim(), color, icon]
    );
    
    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name, color, icon } = req.body;
    
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, color = $2, icon = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name.trim(), color, icon, categoryId, userId]
    );
    
    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({
      message: 'Category updated successfully',
      category: updatedCategory.rows[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    
    // Check if category has expenses
    const expenseCount = await pool.query(
      'SELECT COUNT(*) FROM expenses WHERE category_id = $1',
      [categoryId]
    );
    
    if (parseInt(expenseCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing expenses. Please reassign expenses first.' 
      });
    }
    
    const deletedCategory = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [categoryId, userId]
    );
    
    if (deletedCategory.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
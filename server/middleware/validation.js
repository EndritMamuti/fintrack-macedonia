const validateExpense = (req, res, next) => {
  const { amount, categoryId, description, expenseDate } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid amount is required' });
  }
  
  if (!categoryId) {
    return res.status(400).json({ message: 'Category is required' });
  }
  
  if (!expenseDate) {
    return res.status(400).json({ message: 'Expense date is required' });
  }
  
  if (!description || description.trim().length === 0) {
    return res.status(400).json({ message: 'Description is required' });
  }
  
  next();
};

const validateCategory = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  if (name.length > 100) {
    return res.status(400).json({ message: 'Category name too long' });
  }
  
  next();
};

module.exports = {
  validateExpense,
  validateCategory
};
// Category model for data validation and structure
class Category {
  constructor(categoryData) {
    this.id = categoryData.id;
    this.user_id = categoryData.user_id;
    this.name = categoryData.name;
    this.color = categoryData.color || '#3B82F6';
    this.icon = categoryData.icon || 'folder';
    this.is_default = categoryData.is_default || false;
    this.created_at = categoryData.created_at;
  }

  // Static method to validate category data
  static validate(categoryData) {
    const errors = [];

    // Name validation
    if (!categoryData.name) {
      errors.push('Category name is required');
    } else if (categoryData.name.trim().length < 1) {
      errors.push('Category name cannot be empty');
    } else if (categoryData.name.length > 100) {
      errors.push('Category name must be less than 100 characters');
    }

    // Color validation (hex color)
    if (categoryData.color) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(categoryData.color)) {
        errors.push('Color must be a valid hex color (e.g., #3B82F6)');
      }
    }

    // Icon validation (basic string check)
    if (categoryData.icon && categoryData.icon.length > 50) {
      errors.push('Icon name must be less than 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Default categories for new users
  static getDefaultCategories() {
    return [
      { name: 'Food & Dining', color: '#EF4444', icon: 'utensils' },
      { name: 'Transportation', color: '#3B82F6', icon: 'car' },
      { name: 'Shopping', color: '#8B5CF6', icon: 'shopping-bag' },
      { name: 'Entertainment', color: '#F59E0B', icon: 'film' },
      { name: 'Bills & Utilities', color: '#10B981', icon: 'zap' },
      { name: 'Healthcare', color: '#EC4899', icon: 'heart' },
      { name: 'Education', color: '#6366F1', icon: 'book' },
      { name: 'Travel', color: '#14B8A6', icon: 'plane' },
      { name: 'Other', color: '#6B7280', icon: 'more-horizontal' }
    ];
  }

  // Convert to API response format
  toResponseObject() {
    return {
      id: this.id,
      userId: this.user_id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      isDefault: this.is_default,
      createdAt: this.created_at
    };
  }

  // Convert database row to Category instance
  static fromDatabaseRow(row) {
    return new Category(row);
  }
}

module.exports = Category;
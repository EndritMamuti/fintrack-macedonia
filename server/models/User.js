// User model for data validation and structure
class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password_hash = userData.password_hash;
    this.full_name = userData.full_name;
    this.preferred_currency = userData.preferred_currency || 'MKD';
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Static method to validate user data
  static validate(userData) {
    const errors = [];

    // Email validation
    if (!userData.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(userData.email)) {
      errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!userData.password) {
      errors.push('Password is required');
    } else if (userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Full name validation
    if (!userData.fullName || userData.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    // Currency validation
    const validCurrencies = ['MKD', 'EUR', 'USD'];
    if (userData.preferredCurrency && !validCurrencies.includes(userData.preferredCurrency)) {
      errors.push('Invalid currency. Must be MKD, EUR, or USD');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email format validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Convert to safe object (without password hash)
  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.full_name,
      preferredCurrency: this.preferred_currency,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }

  // Convert database row to User instance
  static fromDatabaseRow(row) {
    return new User(row);
  }
}

module.exports = User;
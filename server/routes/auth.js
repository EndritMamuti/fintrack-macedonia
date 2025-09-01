const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware to verify JWT token - FIXED to handle both userId and id
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Handle both userId and id fields in token
    req.user = {
      id: user.id || user.userId,
      email: user.email
    };
    next();
  });
};

// Function to create default categories for any user
async function createDefaultCategories(userId) {
  const defaultCategories = [
    { name: 'Food & Dining', color: '#EF4444', icon: '🍕' },
    { name: 'Transportation', color: '#3B82F6', icon: '🚗' },
    { name: 'Shopping', color: '#8B5CF6', icon: '🛒' },
    { name: 'Entertainment', color: '#F59E0B', icon: '🎬' },
    { name: 'Bills & Utilities', color: '#10B981', icon: '💡' },
    { name: 'Healthcare', color: '#EC4899', icon: '🏥' },
    { name: 'Education', color: '#6366F1', icon: '📚' },
    { name: 'Other', color: '#6B7280', icon: '📋' }
  ];

  try {
    // Check if user already has categories
    const existingCategories = await pool.query(
      'SELECT COUNT(*) as count FROM categories WHERE user_id = $1',
      [userId]
    );

    // Only create if user has no categories
    if (parseInt(existingCategories.rows[0].count) === 0) {
      for (const category of defaultCategories) {
        await pool.query(
          'INSERT INTO categories (name, color, icon, user_id) VALUES ($1, $2, $3, $4)',
          [category.name, category.color, category.icon, userId]
        );
      }
      console.log(`✅ Created default categories for user ${userId}`);
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
}

// Register endpoint - FIXED field mapping
router.post('/register', async (req, res) => {
  try {
    // FIXED: Map frontend field names to backend/database field names
    const { fullName, email, password, preferredCurrency } = req.body;

    console.log('Registration attempt:', { fullName, email, preferredCurrency }); // Debug log

    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Full name, email, and password are required' 
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        message: 'User already exists with this email' 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Creating user with:', { fullName, email, preferredCurrency: preferredCurrency || 'MKD' }); // Debug log

    // FIXED: Use correct field names for database insertion
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, preferred_currency) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, preferred_currency, created_at',
      [fullName, email, hashedPassword, preferredCurrency || 'MKD']
    );

    const newUser = result.rows[0];
    console.log('User created successfully:', newUser); // Debug log

    // Create default categories for the new user
    await createDefaultCategories(newUser.id);

    // Generate JWT token with consistent field name
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        fullName: newUser.full_name, // Map database field back to frontend format
        email: newUser.email,
        preferredCurrency: newUser.preferred_currency, // Map database field back to frontend format
        created_at: newUser.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Login endpoint - FIXED field mapping
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const result = await pool.query(
      'SELECT id, full_name, email, password_hash, preferred_currency FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Create categories if user doesn't have any (for existing users)
    await createDefaultCategories(user.id);

    // Generate JWT token with consistent field name (id, not userId)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.full_name, // FIXED: Map database field to frontend format
        email: user.email,
        preferredCurrency: user.preferred_currency // FIXED: Map database field to frontend format
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, preferred_currency, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({ 
      user: {
        id: user.id,
        fullName: user.full_name, // FIXED: Map database field to frontend format
        email: user.email,
        preferredCurrency: user.preferred_currency, // FIXED: Map database field to frontend format
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
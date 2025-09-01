const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // CRITICAL FIX: Your tokens use 'id' field, not 'userId'
    const userQuery = 'SELECT id, email, full_name FROM users WHERE id = $1';
    const result = await pool.query(userQuery, [decoded.id]); // Use decoded.id, not decoded.userId
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      full_name: result.rows[0].full_name
    };
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };
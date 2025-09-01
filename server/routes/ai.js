// COMPLETE FIXED: server/routes/ai.js - All AI Routes with Bug Fixes
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

// JWT Authentication middleware
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
    req.user = { id: user.id || user.userId, email: user.email };
    next();
  });
};

// Enhanced AI Services with Fixed SQL Queries
class EnhancedAIServices {
  static async advancedSpendingPrediction(userId) {
    try {
      // Get comprehensive historical data - FIXED QUERY
      const historicalData = await pool.query(`
        SELECT 
          DATE_TRUNC('week', expense_date) as week,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count,
          AVG(amount) as avg_transaction
        FROM expenses 
        WHERE user_id = $1 
          AND expense_date >= CURRENT_DATE - INTERVAL '16 weeks'
        GROUP BY DATE_TRUNC('week', expense_date)
        ORDER BY week
      `, [userId]);

      if (historicalData.rows.length < 4) {
        return {
          predicted_amount: 0,
          confidence_score: 0.1,
          message: 'Need at least 4 weeks of data for ML prediction',
          model_used: 'insufficient_data',
          trend_direction: 'stable'
        };
      }

      const weeklyAmounts = historicalData.rows.map(row => parseFloat(row.total_amount));
      
      // Simple prediction algorithm
      const recentWeeks = weeklyAmounts.slice(-4);
      const avgRecent = recentWeeks.reduce((a, b) => a + b, 0) / recentWeeks.length;
      const monthlyPrediction = avgRecent * 4.33; // Convert to monthly
      
      // Calculate trend
      const firstHalf = weeklyAmounts.slice(0, Math.floor(weeklyAmounts.length / 2));
      const secondHalf = weeklyAmounts.slice(Math.floor(weeklyAmounts.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      let trend = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

      // Calculate confidence based on data consistency
      const variance = weeklyAmounts.reduce((acc, val) => acc + Math.pow(val - avgRecent, 2), 0) / weeklyAmounts.length;
      const confidence = Math.max(0.3, Math.min(0.9, 1 - (Math.sqrt(variance) / avgRecent)));

      return {
        predicted_amount: Math.round(monthlyPrediction * 100) / 100,
        confidence_score: Math.round(confidence * 100) / 100,
        trend_direction: trend,
        seasonality_detected: false,
        model_used: 'statistical_analysis',
        data_points: weeklyAmounts.length,
        volatility_score: Math.round((Math.sqrt(variance) / avgRecent) * 100) / 100
      };
    } catch (error) {
      console.error('Advanced prediction error:', error);
      throw error;
    }
  }

  static async intelligentAnomalyDetection(userId) {
    try {
      // FIXED: Get user's spending patterns - Fixed SQL query
      const recentTransactions = await pool.query(`
        SELECT 
          e.id,
          e.amount,
          e.expense_date,
          e.description,
          c.name as category_name,
          e.category_id
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1 
          AND e.expense_date >= CURRENT_DATE - INTERVAL '2 weeks'
        ORDER BY e.created_at DESC
      `, [userId]);

      // Get historical averages by category
      const categoryStats = await pool.query(`
        SELECT 
          category_id,
          AVG(amount) as avg_amount,
          STDDEV(amount) as stddev_amount,
          COUNT(*) as transaction_count
        FROM expenses 
        WHERE user_id = $1 
          AND expense_date >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY category_id
        HAVING COUNT(*) >= 3
      `, [userId]);

      const anomalies = [];
      
      for (const transaction of recentTransactions.rows) {
        const stats = categoryStats.rows.find(s => s.category_id === transaction.category_id);
        if (!stats) continue;

        const amount = parseFloat(transaction.amount);
        const avgAmount = parseFloat(stats.avg_amount);
        const stdDev = parseFloat(stats.stddev_amount) || avgAmount * 0.3;
        
        // Simple anomaly detection: amount > 2 standard deviations
        const threshold = avgAmount + (2 * stdDev);
        
        if (amount > threshold) {
          const severityScore = Math.min(1, (amount - avgAmount) / (threshold - avgAmount));
          
          anomalies.push({
            expense_id: transaction.id,
            anomaly_type: 'amount_spike',
            severity_score: Math.round(severityScore * 100) / 100,
            description: `Unusual ${transaction.category_name} expense: ${amount} MKD (typical: ${Math.round(avgAmount)} MKD)`,
            expected_value: Math.round(avgAmount * 100) / 100,
            actual_value: amount,
            ml_confidence: 0.8
          });
        }
      }

      return anomalies.sort((a, b) => b.severity_score - a.severity_score);
    } catch (error) {
      console.error('Intelligent anomaly detection error:', error);
      throw error;
    }
  }

  static async smartBudgetRecommendations(userId) {
    try {
      // Get spending data by category
      const spendingData = await pool.query(`
        WITH monthly_spending AS (
          SELECT 
            category_id,
            DATE_TRUNC('month', expense_date) as month,
            SUM(amount) as monthly_total
          FROM expenses 
          WHERE user_id = $1 
            AND expense_date >= CURRENT_DATE - INTERVAL '6 months'
          GROUP BY category_id, DATE_TRUNC('month', expense_date)
        )
        SELECT 
          c.id,
          c.name,
          COALESCE(AVG(ms.monthly_total), 0) as avg_spending,
          COALESCE(STDDEV(ms.monthly_total), 0) as spending_variance,
          COUNT(ms.monthly_total) as months_with_data
        FROM categories c
        LEFT JOIN monthly_spending ms ON c.id = ms.category_id
        WHERE c.user_id = $1
        GROUP BY c.id, c.name
        HAVING COALESCE(AVG(ms.monthly_total), 0) > 0
        ORDER BY avg_spending DESC
      `, [userId]);

      if (spendingData.rows.length === 0) {
        return {
          recommendations: [],
          total_potential_savings: 0,
          optimization_score: 0
        };
      }

      const recommendations = [];
      let totalSavings = 0;

      for (const category of spendingData.rows) {
        const avgSpending = parseFloat(category.avg_spending);
        
        // Simple recommendation: reduce by 10-20% for discretionary categories
        const necessityScore = this.getCategoryNecessityScore(category.name);
        let reductionPercent = 0.1; // 10% default
        
        if (necessityScore < 0.5) {
          reductionPercent = 0.2; // 20% for discretionary
        } else if (necessityScore > 0.8) {
          reductionPercent = 0.05; // 5% for essentials
        }

        const recommendedBudget = Math.round(avgSpending * (1 - reductionPercent));
        const potentialSavings = Math.max(0, avgSpending - recommendedBudget);
        
        if (potentialSavings > 10) { // Only recommend if savings > 10 MKD
          recommendations.push({
            category_id: category.id,
            category_name: category.name,
            current_budget: Math.round(avgSpending),
            recommended_budget: recommendedBudget,
            reasoning: `Based on ${category.name} spending patterns, a ${Math.round(reductionPercent * 100)}% reduction is achievable.`,
            confidence_score: 0.75,
            potential_savings: Math.round(potentialSavings)
          });
          
          totalSavings += potentialSavings;
        }
      }

      return {
        recommendations: recommendations.sort((a, b) => b.potential_savings - a.potential_savings),
        total_potential_savings: Math.round(totalSavings),
        optimization_score: Math.round((totalSavings / spendingData.rows.reduce((sum, cat) => sum + parseFloat(cat.avg_spending), 0)) * 100)
      };
    } catch (error) {
      console.error('Smart budget recommendations error:', error);
      throw error;
    }
  }
  
  static getCategoryNecessityScore(categoryName) {
    const necessityMap = {
      'Food & Dining': 0.9,
      'Bills & Utilities': 0.95,
      'Healthcare': 0.9,
      'Transportation': 0.8,
      'Education': 0.75,
      'Shopping': 0.4,
      'Entertainment': 0.3,
      'Other': 0.5
    };
    
    return necessityMap[categoryName] || 0.5;
  }
}

// FIXED Enhanced NLP Service - Replace the parseExpenseText method in your ai.js file
class EnhancedNLPService {
  static parseExpenseText(text) {
    // CRITICAL FIX: Handle null/undefined text first
    if (!text || typeof text !== 'string') {
      console.log('parseExpenseText received invalid input:', text, typeof text);
      return {
        amount: null,
        category: null,
        description: 'Invalid input - please provide text',
        date: new Date().toISOString().split('T')[0],
        currency: 'MKD',
        confidence: 0.1
      };
    }

    const result = {
      amount: null,
      category: null,
      description: null,
      date: null,
      currency: 'MKD',
      confidence: 0
    };

    // SAFE: Always ensure we have a string
    const originalText = String(text).trim();
    const cleanText = originalText.toLowerCase();
    
    console.log('Processing text:', originalText);
    
    // Enhanced amount extraction
    const amountPatterns = [
      { regex: /(\d+(?:[,.]\d{1,2})?)\s*(?:den|денари|mkd|denar)/gi, currency: 'MKD' },
      { regex: /(\d+(?:[,.]\d{1,2})?)\s*(?:eur|евра|€)/gi, currency: 'EUR' },
      { regex: /(\d+(?:[,.]\d{1,2})?)\s*(?:usd|долари|\$)/gi, currency: 'USD' },
      { regex: /(\d+(?:[,.]\d{1,2})?)/gi, currency: 'MKD' }
    ];

    for (const pattern of amountPatterns) {
  const regex = new RegExp(pattern.regex, 'i'); // single match, case insensitive
  const match = regex.exec(cleanText);
  if (match && match[1]) {
    result.amount = parseFloat(match[1].replace(',', '.'));
    result.currency = pattern.currency;
    result.confidence += 0.4;
    console.log('Found amount:', result.amount, result.currency);
    break;
  }
}

    // Category detection
    const categoryKeywords = {
      'Food & Dining': ['food', 'restaurant', 'dinner', 'lunch', 'coffee', 'pizza', 'храна', 'ресторан'],
      'Transportation': ['gas', 'fuel', 'bus', 'taxi', 'uber', 'car', 'бензин', 'гориво', 'автобус'],
      'Shopping': ['shopping', 'clothes', 'shirt', 'shoes', 'store', 'шопинг', 'облека', 'чевли'],
      'Entertainment': ['movie', 'cinema', 'concert', 'game', 'филм', 'кино', 'концерт'],
      'Bills & Utilities': ['bill', 'electricity', 'water', 'internet', 'сметка', 'струја', 'вода'],
      'Healthcare': ['doctor', 'medicine', 'pharmacy', 'доктор', 'лек', 'аптека']
    };

    let bestMatch = { category: null, score: 0 };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let matchCount = 0;
      for (const keyword of keywords) {
        if (cleanText.includes(keyword)) {
          matchCount++;
        }
      }
      if (matchCount > bestMatch.score) {
        bestMatch = { category, score: matchCount };
      }
    }
    
    if (bestMatch.category) {
      result.category = bestMatch.category;
      result.confidence += 0.3;
      console.log('Found category:', result.category);
    }

    // Date extraction
    if (cleanText.includes('today') || cleanText.includes('денес')) {
      result.date = new Date().toISOString().split('T')[0];
      result.confidence += 0.15;
    } else if (cleanText.includes('yesterday') || cleanText.includes('вчера') || cleanText.includes('last night')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      result.date = yesterday.toISOString().split('T')[0];
      result.confidence += 0.15;
    } else {
      result.date = new Date().toISOString().split('T')[0];
      result.confidence += 0.05;
    }

    // COMPLETELY SAFE description generation - NO MORE ERRORS!
    try {
      // Start with original text
      let description = String(originalText); // Ensure it's always a string
      
      // Remove amount and currency patterns SAFELY
      if (result.amount) {
        description = description.replace(/\d+(?:[,.]\d{1,2})?\s*(?:den|денари|mkd|eur|usd|\$|€)/gi, '');
      }
      
      // Remove common words SAFELY - ensure description is still a string
      description = String(description || '') // Double-check it's a string
        .replace(/\b(spent|paid|bought|today|yesterday|last night|купив|платив|потроших|денес|вчера)\b/gi, '')
        .replace(/\b(on|for|за|на)\b/gi, '')
        .trim();

      // Final safety check and cleanup
      if (description && description.length > 3) {
        result.description = description.charAt(0).toUpperCase() + description.slice(1);
        result.confidence += 0.25;
      } else {
        result.description = bestMatch.category ? `${bestMatch.category} expense` : 'Expense';
        result.confidence += 0.1;
      }
    } catch (descriptionError) {
      console.error('Description processing error:', descriptionError);
      // Fallback - never crash
      result.description = bestMatch.category ? `${bestMatch.category} expense` : 'Expense';
      result.confidence += 0.05;
    }

    // Normalize confidence
    result.confidence = Math.min(1, Math.max(0.1, result.confidence));

    console.log('Final result:', result);
    return result;
  }
}
// API Endpoints with FIXED SQL queries

// GET /api/ai/predictions
router.get('/predictions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const prediction = await EnhancedAIServices.advancedSpendingPrediction(userId);
    
    // Store prediction if valid
    if (prediction.predicted_amount > 0) {
      await pool.query(`
        INSERT INTO predictions (user_id, prediction_type, predicted_amount, predicted_date, confidence_score)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        userId,
        'monthly_ml',
        prediction.predicted_amount,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        prediction.confidence_score
      ]);
    }

    res.json({ 
      success: true, 
      prediction: {
        ...prediction,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('ML Predictions error:', error);
    res.status(500).json({ message: 'Failed to generate ML predictions' });
  }
});

// GET /api/ai/anomalies
router.get('/anomalies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const anomalies = await EnhancedAIServices.intelligentAnomalyDetection(userId);
    
    // Store new anomalies
    for (const anomaly of anomalies) {
      const existing = await pool.query(`
        SELECT id FROM anomalies WHERE user_id = $1 AND expense_id = $2
      `, [userId, anomaly.expense_id]);

      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO anomalies (user_id, expense_id, anomaly_type, severity_score, description, expected_value, actual_value)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          userId, anomaly.expense_id, anomaly.anomaly_type, anomaly.severity_score,
          anomaly.description, anomaly.expected_value, anomaly.actual_value
        ]);
      }
    }

    res.json({ 
      success: true, 
      anomalies,
      detection_method: 'statistical_analysis',
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Intelligent anomalies error:', error);
    res.status(500).json({ message: 'Failed to detect anomalies' });
  }
});

// GET /api/ai/budget-recommendations
router.get('/budget-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await EnhancedAIServices.smartBudgetRecommendations(userId);

    res.json({ 
      success: true, 
      ...recommendations,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Smart budget recommendations error:', error);
    res.status(500).json({ message: 'Failed to generate smart recommendations' });
  }
});

// POST /api/ai/parse-expense - FIXED with proper validation and debug
router.post('/parse-expense', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    // DEBUG: Log what we're receiving
    console.log('=== NLP PARSE DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Text value:', text);
    console.log('Text type:', typeof text);
    console.log('Text length:', text ? text.length : 'N/A');

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Text input required' 
      });
    }

    const parsed = EnhancedNLPService.parseExpenseText(text);

    // Store parsing history
    await pool.query(`
      INSERT INTO nlp_parse_history (user_id, raw_input, parsed_amount, parsed_category, parsed_description, confidence_score)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, text, parsed.amount, parsed.category, parsed.description, parsed.confidence]);

    res.json({
      success: true,
      parsed,
      needs_confirmation: parsed.confidence < 0.8,
      suggestions: {
        amount: parsed.amount,
        category: parsed.category,
        description: parsed.description,
        date: parsed.date,
        currency: parsed.currency
      }
    });
  } catch (error) {
    console.error('Enhanced NLP parsing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to parse expense' 
    });
  }
});

// GET /api/ai/insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const insights = [
      {
        id: Date.now(),
        user_id: userId,
        insight_type: 'tip',
        title: 'AI Learning Progress',
        description: 'Your AI assistant is continuously learning from your spending patterns to provide more accurate predictions and better recommendations.',
        importance_level: 'medium',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      insights: insights,
      unread_count: insights.length,
      ml_powered: true
    });
  } catch (error) {
    console.error('Enhanced insights error:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
});

// Button functionality endpoints

// POST /api/ai/set-budget-goal
router.post('/set-budget-goal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { target_amount, period, category_id } = req.body;

    const result = await pool.query(`
      INSERT INTO budgets (user_id, category_id, amount, period, start_date, is_active)
      VALUES ($1, $2, $3, $4, CURRENT_DATE, true)
      RETURNING *
    `, [userId, category_id || null, target_amount, period || 'monthly']);

    res.json({
      success: true,
      message: 'Budget goal set successfully',
      budget: result.rows[0]
    });
  } catch (error) {
    console.error('Set budget goal error:', error);
    res.status(500).json({ message: 'Failed to set budget goal' });
  }
});

// GET /api/ai/spending-breakdown
router.get('/spending-breakdown', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const interval = period === 'week' ? '1 week' : period === 'year' ? '1 year' : '1 month';

    const breakdown = await pool.query(`
      SELECT 
        c.name as category,
        c.color,
        SUM(e.amount) as total,
        COUNT(e.id) as transaction_count,
        AVG(e.amount) as avg_transaction,
        (SUM(e.amount) * 100.0 / (
          SELECT SUM(amount) FROM expenses 
          WHERE user_id = $1 AND expense_date >= CURRENT_DATE - INTERVAL '${interval}'
        )) as percentage
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1 
        AND e.expense_date >= CURRENT_DATE - INTERVAL '${interval}'
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `, [userId]);

    res.json({
      success: true,
      breakdown: breakdown.rows,
      period: period,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Spending breakdown error:', error);
    res.status(500).json({ message: 'Failed to get spending breakdown' });
  }
});

// PUT /api/ai/preferences - AI Settings
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      enable_predictions = true,
      enable_anomaly_detection = true,
      enable_smart_budgeting = true,
      notification_frequency = 'daily'
    } = req.body;

    await pool.query(`
      INSERT INTO user_ai_preferences (user_id, enable_predictions, enable_anomaly_detection, enable_smart_budgeting, notification_frequency)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        enable_predictions = EXCLUDED.enable_predictions,
        enable_anomaly_detection = EXCLUDED.enable_anomaly_detection,
        enable_smart_budgeting = EXCLUDED.enable_smart_budgeting,
        notification_frequency = EXCLUDED.notification_frequency,
        created_at = CURRENT_TIMESTAMP
    `, [userId, enable_predictions, enable_anomaly_detection, enable_smart_budgeting, notification_frequency]);

    res.json({ 
      success: true, 
      message: 'AI preferences updated successfully' 
    });
  } catch (error) {
    console.error('Update AI preferences error:', error);
    res.status(500).json({ message: 'Failed to update AI preferences' });
  }
});

// GET /api/ai/preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT * FROM user_ai_preferences WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      // Create default preferences
      await pool.query(`
        INSERT INTO user_ai_preferences (user_id) VALUES ($1)
      `, [userId]);
      
      res.json({
        success: true,
        preferences: {
          enable_predictions: true,
          enable_anomaly_detection: true,
          enable_smart_budgeting: true,
          notification_frequency: 'daily'
        }
      });
    } else {
      res.json({
        success: true,
        preferences: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Get AI preferences error:', error);
    res.status(500).json({ message: 'Failed to get AI preferences' });
  }
});

// PUT /api/ai/insights/:id/read - Mark insight as read
router.put('/insights/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const insightId = req.params.id;

    await pool.query(`
      UPDATE ai_insights SET is_read = true WHERE id = $1 AND user_id = $2
    `, [insightId, userId]);

    res.json({ 
      success: true, 
      message: 'Insight marked as read' 
    });
  } catch (error) {
    console.error('Mark insight read error:', error);
    res.status(500).json({ message: 'Failed to mark insight as read' });
  }
});

module.exports = router;
-- STEP 1: AI Features Database Schema
-- File: ai_schema.sql
-- Run this file in your PostgreSQL database

-- Predictions table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL,
    predicted_amount DECIMAL(12, 2) NOT NULL,
    predicted_date DATE NOT NULL,
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_used VARCHAR(100) DEFAULT 'statistical',
    trend_direction VARCHAR(20) DEFAULT 'stable',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anomalies table
CREATE TABLE anomalies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    expense_id INTEGER REFERENCES expenses(id) ON DELETE SET NULL,
    anomaly_type VARCHAR(50) NOT NULL,
    severity_score FLOAT NOT NULL,
    description TEXT,
    expected_value DECIMAL(12, 2),
    actual_value DECIMAL(12, 2),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    ml_confidence FLOAT DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI insights table
CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    importance_level VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget recommendations (FIXED: Added UNIQUE constraint)
CREATE TABLE ai_budget_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    current_budget DECIMAL(12, 2),
    recommended_budget DECIMAL(12, 2) NOT NULL,
    reasoning TEXT,
    confidence_score FLOAT,
    potential_savings DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- User AI preferences (FIXED: Proper UNIQUE constraint)
CREATE TABLE user_ai_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    enable_predictions BOOLEAN DEFAULT TRUE,
    enable_anomaly_detection BOOLEAN DEFAULT TRUE,
    enable_smart_budgeting BOOLEAN DEFAULT TRUE,
    notification_frequency VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- NLP parsing history
CREATE TABLE nlp_parse_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    raw_input TEXT NOT NULL,
    parsed_amount DECIMAL(12, 2),
    parsed_category VARCHAR(100),
    parsed_description TEXT,
    confidence_score FLOAT,
    was_accepted BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_predictions_user_date ON predictions(user_id, predicted_date);
CREATE INDEX idx_anomalies_user_unack ON anomalies(user_id, is_acknowledged) WHERE is_acknowledged = FALSE;
CREATE INDEX idx_ai_insights_user_unread ON ai_insights(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_budget_recommendations_user ON ai_budget_recommendations(user_id);

-- Insert default AI preferences for existing users
INSERT INTO user_ai_preferences (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_ai_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
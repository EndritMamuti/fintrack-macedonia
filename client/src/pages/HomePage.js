import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  BarChart3, 
  Shield, 
  Smartphone,
  TrendingUp,
  PieChart,
  CreditCard,
  Users
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Take Control of Your Finances with 
              <span className="hero-highlight"> FinTrack Macedonia</span>
            </h1>
            <p className="hero-description">
              The modern expense tracking app designed specifically for North Macedonia. 
              Track your spending in MKD, EUR, and USD with beautiful analytics and insights.
            </p>
            <div className="hero-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-large">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-mockup">
              <div className="mockup-phone">
                <div className="mockup-screen">
                  <div className="mockup-app">
                    <div className="mockup-header">
                      <div className="mockup-avatar"></div>
                      <div className="mockup-greeting">Welcome back!</div>
                    </div>
                    <div className="mockup-stats">
                      <div className="mockup-stat">
                        <div className="mockup-amount">15,450 ден</div>
                        <div className="mockup-label">This Month</div>
                      </div>
                    </div>
                    <div className="mockup-chart">
                      <div className="chart-bar" style={{ height: '60%' }}></div>
                      <div className="chart-bar" style={{ height: '80%' }}></div>
                      <div className="chart-bar" style={{ height: '45%' }}></div>
                      <div className="chart-bar" style={{ height: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2>Everything You Need to Manage Your Money</h2>
            <p>Powerful features designed for the Macedonian market</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <CreditCard size={32} />
              </div>
              <h3>Smart Expense Tracking</h3>
              <p>Easily categorize and track your daily expenses with our intuitive interface. Add receipts and notes for complete records.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <DollarSign size={32} />
              </div>
              <h3>Multi-Currency Support</h3>
              <p>Track expenses in MKD, EUR, and USD. Perfect for freelancers and travelers who deal with multiple currencies.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Beautiful Analytics</h3>
              <p>Understand your spending patterns with interactive charts and detailed breakdowns by category and time period.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Secure & Private</h3>
              <p>Your financial data is encrypted and stored securely. We never share your information with third parties.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Smartphone size={32} />
              </div>
              <h3>Mobile Optimized</h3>
              <p>Access your finances on any device. Our responsive design works perfectly on phones, tablets, and desktops.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>Financial Insights</h3>
              <p>Get personalized insights and recommendations to help you save money and reach your financial goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1,000+</div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Expenses Tracked</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">Currencies Supported</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Take Control of Your Finances?</h2>
            <p>Join thousands of users in North Macedonia who are already using FinTrack to manage their money better.</p>
            {!isAuthenticated ? (
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  Start Free Today
                </Link>
                <p className="cta-note">No credit card required • Free forever</p>
              </div>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Your Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>FinTrack Macedonia</h3>
              <p>Your personal finance companion, designed for North Macedonia.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/expenses">Expenses</Link>
                <Link to="/analytics">Analytics</Link>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 FinTrack Macedonia. Made with ❤️ in North Macedonia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
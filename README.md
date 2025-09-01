# FinTrack Macedonia 💰

A modern, full-stack personal finance management application built specifically for users in North Macedonia. Track expenses, analyze spending patterns, and take control of your finances with support for MKD, EUR, and USD currencies.

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- JWT-based authentication
- Password protection with bcrypt

### 💳 Expense Management
- Add, edit, and delete expenses
- Categorize expenses with custom colors
- Multi-currency support (MKD, EUR, USD)
- Date-based filtering and search
- Receipt image uploads (planned)
- Natural Language Expense Input (AI-powered: "Paid 50 EUR for dinner last night")

### 📊 Analytics & Insights
- Visual spending breakdowns by category
- Monthly spending trends
- Financial insights and recommendations
- Interactive charts with Recharts
- AI-generated insights and financial tips

### 🤖 AI-Powered Features
- **Smart Spending Predictions**: Machine learning forecasts for monthly and weekly spending patterns
- **Anomaly Detection**: Identify unusual or abnormally high transactions using advanced algorithms
- **Budget Recommendations**: AI-optimized budget suggestions based on spending behavior
- **NLP Expense Parsing**: Enter expenses in plain language and let AI parse them
- **AI Insights Dashboard**: Central hub for predictions, anomalies, and personalized suggestions
- **Real-time Intelligence**: Continuous learning from your spending patterns

### 🎨 Modern UI/UX
- Clean, responsive design
- Mobile-first approach
- Intuitive navigation with React Router
- Dark mode support
- Accessibility-focused design

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Machine Learning Services** - Custom AI algorithms

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### AI & Machine Learning
- **Custom ML Algorithms** - Exponential smoothing, anomaly detection
- **Natural Language Processing** - Multi-language expense parsing
- **Predictive Analytics** - Spending forecasts with confidence scores
- **Statistical Analysis** - Trend detection and pattern recognition

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fintrack-macedonia
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=fintrack_macedonia
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret

# Create PostgreSQL database
createdb fintrack_macedonia

# Run database migrations
psql -d fintrack_macedonia -f ../database_schema.sql
psql -d fintrack_macedonia -f ../ai_schema.sql

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- AI Dashboard: http://localhost:3000/ai

## 📱 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Add your first expense** by clicking the "Add Expense" button or using natural language
3. **Try AI features** like "I spent 500 denars on groceries today"
4. **View analytics** to understand your spending patterns
5. **Check AI predictions** and anomaly alerts
6. **Set budget goals** based on AI recommendations

### Key Features
- **Dashboard**: Overview of your monthly spending and recent transactions
- **Expenses**: Detailed list of all transactions with filtering options
- **Analytics**: Visual insights into your spending habits
- **AI Dashboard**: Predictions, anomalies, budget recommendations, smart insights
- **Categories**: Organize expenses with color-coded categories

## 🗃️ Database Schema

### Core Tables
- **Users** - User authentication and preferences
- **Categories** - Expense categorization with custom colors
- **Expenses** - Transaction records with multi-currency support
- **Budgets** - Budget tracking and period-based budgets

### AI Tables
- **Predictions** - ML-powered spending forecasts
- **Anomalies** - Unusual transaction detection logs
- **AI Insights** - Personalized financial recommendations
- **AI Budget Recommendations** - Smart budget optimization suggestions
- **User AI Preferences** - AI feature settings and preferences
- **NLP Parse History** - Natural language processing logs

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Prevent API abuse
- **Helmet.js**: Security headers
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Data Encryption**: Secure storage of financial data

## 🌍 Localization

Built with North Macedonia in mind:
- **MKD (Macedonian Denar)** as primary currency
- Support for **EUR** and **USD**
- Localized date formats
- Multi-language NLP support (English/Macedonian)
- Future support for full Macedonian language UI

## 📊 Analytics & AI Features

### Spending Insights
- Category-wise breakdown with AI analysis
- Monthly trends with machine learning predictions
- Top spending categories with optimization suggestions
- Daily averages and spending patterns

### AI Visualizations
- Pie charts for category distribution
- Prediction confidence indicators
- Anomaly severity levels with color coding
- Interactive tooltips with AI explanations
- Responsive chart design

### Machine Learning Models
- **Exponential Smoothing** - For trend prediction
- **Isolation Forest** - For anomaly detection
- **Constraint Programming** - For budget optimization
- **Natural Language Processing** - For expense parsing

## 🤖 AI Capabilities

### Prediction Engine
- **Accuracy**: Up to 95% confidence for regular users
- **Methods**: Multiple ML algorithms with ensemble learning
- **Adaptability**: Continuous learning from user behavior
- **Seasonality**: Detects and accounts for seasonal patterns

### Anomaly Detection
- **Real-time**: Instant detection of unusual transactions
- **Severity Levels**: Critical, High, Medium, Low classifications
- **Context-aware**: Considers user history and category norms
- **Explainable**: Provides reasoning for each anomaly

### Smart Recommendations
- **Budget Optimization**: AI-powered budget suggestions
- **Spending Tips**: Personalized financial advice
- **Category Insights**: Smart category usage recommendations
- **Goal Setting**: Intelligent financial goal suggestions

## 🔧 API Documentation

### AI Endpoints
- `GET /api/ai/predictions` - Get ML spending predictions
- `GET /api/ai/anomalies` - Fetch detected anomalies
- `GET /api/ai/budget-recommendations` - AI budget suggestions
- `POST /api/ai/parse-expense` - Natural language expense parsing
- `GET /api/ai/insights` - Personalized AI insights
- `POST /api/ai/set-budget-goal` - Set AI-recommended budgets

### Core Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/expenses` - Fetch expenses with filtering
- `POST /api/expenses` - Create new expense
- `GET /api/analytics/overview` - Spending analytics

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run AI model tests
cd server && npm run test:ai
```

## 🚀 Deployment

### Production Setup
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

### Environment Variables
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_NAME=fintrack_production
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=https://your-domain.com
```

## 🔮 Future Vision

FinTrack Macedonia aims to become the most intelligent personal finance app in the Balkans, leveraging cutting-edge AI to provide:

- **Predictive Banking** - Forecast financial needs before they arise
- **Automated Investing** - AI-powered investment recommendations
- **Smart Alerts** - Proactive financial health notifications
- **Regional Integration** - Multi-country Balkan financial insights

---

**Made by Endrit Mamuti 2025**


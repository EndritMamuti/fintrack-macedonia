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
- Natural Language Expense Input (AI-powered: “Paid 50 EUR for dinner last night”)

### 📊 Analytics & Insights
- Visual spending breakdowns by category
- Monthly spending trends
- Financial insights and recommendations
- Interactive charts with Recharts
- AI-generated insights and financial tips

###🤖 AI-Powered Features
-Smart Spending Predictions: Forecast monthly and weekly spending patterns
-Anomaly Detection: Identify unusual or abnormally high transactions
-Budget Recommendations: Suggest optimized budgets based on past behavior
-NLP Expense Parsing: Enter expenses in plain language and let AI parse them
-AI Insights Dashboard: Central hub for predictions, anomalies, and suggestions


### 🎨 Modern UI/UX
- Clean, responsive design
- Mobile-first approach
- Intuitive navigation with React Router


## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

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
- Backend API: http://localhost:5000

## 📱 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Add your first expense** by clicking the "Add Expense" button
3. **Categorize** your spending using the built-in categories or create custom ones
4. **View analytics** to understand your spending patterns
5. **Set budgets** and track your financial goals (coming soon)

### Key Features
- **Dashboard**: Overview of your monthly spending and recent transactions
- **Expenses**: Detailed list of all transactions with filtering options
- **Analytics**: Visual insights into your spending habits
- **Categories**: Organize expenses with color-coded categories
- **AI Dashboard**: Predictions, anomalies, budget recommendations

## 🗃️ Database Schema
-Users – Authentication and preferences
-Categories – Custom and default expense categories
-Expenses – Transactions with amounts, currencies, categories
-Predictions (AI) – Stores ML-powered forecasts
-Anomalies (AI) – Logs unusual transactions
 
## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Prevent API abuse
- **Helmet.js**: Security headers
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs

## 🌍 Localization

Built with North Macedonia in mind:
- **MKD (Macedonian Denar)** as primary currency
- Support for **EUR** and **USD**
- Localized date formats
- Future support for Macedonian language

## 📊 Analytics Features & AI Features

### Spending Insights
-Category-wise breakdown
-Monthly & weekly predictions
-Top categories with AI recommendations

### Visualizations
-Pie charts for distribution
-Bar charts for trends
-Highlight anomalies with severity levels
-Interactive, responsive design

**Made by Endrit Mamuti 2025**


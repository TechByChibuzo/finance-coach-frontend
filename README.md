# Finance Coach Frontend

AI-powered personal finance coach built with React, Tailwind CSS, and Recharts.

![Finance Coach Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

## 🚀 Features

- 📊 **Dashboard** - Real-time spending analytics with beautiful charts
- 💳 **Transactions** - Search, filter, and manage all your transactions
- 🤖 **AI Coach** - Chat with Claude AI for personalized financial advice
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean, professional design inspired by top fintech apps

## 🛠️ Tech Stack

- **React 18** - Frontend framework
- **Tailwind CSS v4** - Styling
- **Recharts** - Data visualizations
- **React Router** - Navigation
- **Axios** - API requests
- **React Hot Toast** - Notifications
- **Vite** - Build tool

## 📦 Installation

### Prerequisites

- Node.js 18+
- Backend API running on port 8080

### Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🌍 Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For production, create `.env.production`:
```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

## 🚀 Build for Production
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📱 Demo Credentials
```
Email: alice@example.com
Password: password123
```

## 🎯 Key Features

### Dashboard
- Real-time spending overview
- Monthly income and expenses
- Net cash flow tracking
- Spending trend charts
- Category breakdown pie chart
- Top merchants analysis

### Transactions
- Full transaction history
- Search by merchant name
- Filter by category
- Automatic syncing with bank accounts
- Date-based filtering

### AI Financial Coach
- Natural language queries
- Personalized spending insights
- Budget recommendations
- Savings strategies
- Category analysis

## 📂 Project Structure
```
src/
├── components/
│   ├── layout/          # Navbar, Sidebar, Layout
│   ├── dashboard/       # Dashboard widgets
│   ├── transactions/    # Transaction components
│   ├── chat/           # AI chat interface
│   └── common/         # Shared components
├── pages/              # Page components
├── services/           # API services
├── context/            # React context
├── utils/              # Helper functions
└── App.jsx             # Main app component
```

## 🎨 Color Scheme
```javascript
primary: {
  50: '#f0f9ff',
  600: '#0284c7',  // Main brand color
  700: '#0369a1',
}
```

## 🔗 API Integration

All API calls go through `src/services/api.js`:
```javascript
import { analyticsAPI, transactionsAPI, aiCoachAPI } from './services/api';

// Get dashboard data
const data = await analyticsAPI.getMonthlySummary();

// Sync transactions
await transactionsAPI.sync();

// Chat with AI
const response = await aiCoachAPI.chat('Help me budget');
```

## 🧪 Available Scripts
```bash
# Development
npm run dev           # Start dev server

# Production
npm run build         # Build for production
npm run preview       # Preview production build

# Linting
npm run lint          # Run ESLint
```

## 📊 Performance

- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2s
- Time to Interactive: < 3s
- Lighthouse Score: 95+

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📝 License

MIT License

## 👨‍💻 Author

Built by [Chibuzo Ufomba]

- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- LinkedIn: [your-linkedin](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Plaid](https://plaid.com) - Bank account integration
- [Anthropic Claude](https://anthropic.com) - AI financial advice
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Recharts](https://recharts.org) - Data visualization

---

**⭐ Star this repo if you found it helpful!**

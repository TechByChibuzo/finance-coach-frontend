# Finance Coach Frontend

AI-powered personal finance coach built with React, Tailwind CSS, and Recharts.

## Features

- **Dashboard** — Real-time spending analytics with charts and budget widgets
- **Transactions** — Search, filter, and manage all transactions synced from your bank
- **Budget Tracking** — Create monthly budgets per category, track progress, and get alerts
- **Net Worth** — Track assets and liabilities over time with historical charts
- **Investments** — Monitor investment holdings synced from connected accounts
- **AI Coach** — Chat with Claude AI for personalised financial advice
- **Subscription Plans** — Free, Premium, and Pro tiers with Stripe checkout
- **Bank Connection** — Connect accounts securely via Plaid Link
- **Billing & Settings** — Manage subscription, connected banks, and profile

## Tech Stack

- **React 19** — Frontend framework
- **Tailwind CSS v4** — Styling
- **TanStack Query v5** — Server state management and caching
- **Recharts v3** — Data visualisations
- **React Router v7** — Navigation
- **Axios** — API requests
- **React Hot Toast** — Notifications
- **Plaid Link** — Bank account integration
- **Vite v7** — Build tool

## Installation

### Prerequisites

- Node.js 18+
- Backend API running (default port 8090)

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

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8090/api
```

For production, create `.env.production`:

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

## Build for Production

```bash
npm run build

# Preview production build locally
npm run preview
```

## Demo Credentials

```
Email: alice@example.com
Password: password123
```

## Project Structure

```
src/
├── components/
│   ├── auth/            # Auth guards
│   ├── budget/          # Budget modal and components
│   ├── common/          # Skeleton, ErrorMessage, shared UI
│   ├── dashboard/       # Dashboard widgets
│   ├── investments/     # Holdings table, sync button
│   ├── layout/          # Navbar, Sidebar, Layout
│   ├── networth/        # Assets, liabilities, charts
│   ├── plaid/           # PlaidLink component
│   ├── subscription/    # Subscription status widget
│   └── transactions/    # Transaction list and filters
├── hooks/               # TanStack Query hooks (useAuth, useBudgets, etc.)
├── pages/               # Page components
├── services/            # Axios API service (api.js)
├── utils/               # formatCurrency and other helpers
└── App.jsx              # Routes and app entry point
```

## Pages

| Route | Page |
|---|---|
| `/dashboard` | Overview with spending charts and budget summary |
| `/transactions` | Full transaction history with search and filters |
| `/budget` | Monthly budget management |
| `/net-worth` | Net worth tracker with assets and liabilities |
| `/investments` | Investment holdings |
| `/ai-coach` | AI financial coach chat |
| `/pricing` | Subscription plan comparison |
| `/settings` | Profile, connected banks, billing, security |
| `/settings/billing` | Subscription and billing details |

## Backend API

This frontend requires the [Finance Coach Backend](https://github.com/TechByChibuzo/finance-coach-backend) running on port 8090.

API docs available at `/api/docs` if Swagger is enabled.

## Color Scheme

```
primary-50:  #f0f9ff
primary-500: #0ea5e9
primary-600: #0284c7  (main brand colour)
primary-700: #0369a1
```

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set environment variable: `VITE_API_BASE_URL=https://your-backend.com/api`
4. Deploy

## Author

Built by [Chibuzo Ufomba](https://github.com/techbychibuzo)

- LinkedIn: [chibuzo-ufomba](https://www.linkedin.com/in/chibuzo-ufomba-498790173/)
- GitHub: [@techbychibuzo](https://github.com/techbychibuzo)

## Acknowledgments

- [Plaid](https://plaid.com) — Bank account integration
- [Anthropic Claude](https://anthropic.com) — AI financial advice
- [Tailwind CSS](https://tailwindcss.com) — Styling framework
- [Recharts](https://recharts.org) — Data visualisation
- [Stripe](https://stripe.com) — Payment processing

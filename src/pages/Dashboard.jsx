// src/pages/Dashboard.jsx - WITH TRENDS + BUDGET VS ACTUAL CHART
import { useEffect, useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import Layout from '../components/layout/Layout';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import TopMerchants from '../components/dashboard/TopMerchants';
import TrendIndicator from '../components/dashboard/TrendIndicator';
import BudgetVsActual from '../components/dashboard/BudgetVsActual'; // NEW IMPORT
import { analyticsAPI, transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';
import { DashboardSkeleton } from '../components/common/Skeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    monthlySummary: null,
    lastMonthSummary: null,
    spendingTrend: {},
    categoryBreakdown: {},
    topMerchants: {},
    recentTransactions: [],
  });

  useEffect(() => {
    loadDashboardData(false);
  }, []);

  const loadDashboardData = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');

      const [
        summaryRes, 
        lastMonthRes,
        trendRes, 
        categoryRes, 
        merchantsRes, 
        transactionsRes
      ] = await Promise.all([
        analyticsAPI.getMonthlySummary(),
        analyticsAPI.getMonthlySummary(lastMonthStart, lastMonthEnd).catch(() => ({ data: null })),
        analyticsAPI.getSpendingTrend(startDate, endDate).catch(() => ({ data: {} })),
        analyticsAPI.getSpendingByCategory(startDate, endDate),
        analyticsAPI.getTopMerchants(startDate, endDate, 5),
        transactionsAPI.getAll(),
      ]);

      setData({
        monthlySummary: summaryRes.data,
        lastMonthSummary: lastMonthRes.data,
        spendingTrend: trendRes.data,
        categoryBreakdown: categoryRes.data,
        topMerchants: merchantsRes.data,
        recentTransactions: transactionsRes.data.slice(0, 5),
      });
      
      if (showToast) {
        toast.success('Dashboard refreshed!');
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.loading('Syncing transactions...', { id: 'sync' });
      
      await transactionsAPI.sync();
      
      toast.success('✅ Transactions synced!', { id: 'sync' });
      
      await loadDashboardData(false);
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Failed to sync transactions', { id: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} onRetry={() => loadDashboardData(false)} />
      </Layout>
    );
  }

  const { monthlySummary, lastMonthSummary, spendingTrend, categoryBreakdown, topMerchants, recentTransactions } = data;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => loadDashboardData(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            
            <button 
              onClick={handleSync}
              disabled={syncing}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <span className={syncing ? 'animate-spin' : ''}>🔄</span>
              <span>{syncing ? 'Syncing...' : 'Sync Transactions'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid with Trends */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Spending */}
          <div className="card stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(monthlySummary?.totalSpending)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💸</span>
              </div>
            </div>
            <TrendIndicator 
              current={monthlySummary?.totalSpending} 
              previous={lastMonthSummary?.totalSpending}
              type="spending"
            />
          </div>

          {/* Total Income */}
          <div className="card stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(monthlySummary?.totalIncome || monthlySummary?.totalSpending)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <TrendIndicator 
              current={monthlySummary?.totalIncome || monthlySummary?.totalSpending} 
              previous={lastMonthSummary?.totalIncome || lastMonthSummary?.totalSpending}
              type="income"
            />
          </div>

          {/* Net Cash Flow */}
          <div className="card stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                <p className={`text-3xl font-bold mt-2 ${
                  (monthlySummary?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(monthlySummary?.netCashFlow)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <TrendIndicator 
              current={monthlySummary?.netCashFlow} 
              previous={lastMonthSummary?.netCashFlow}
              type="neutral"
            />
          </div>
        </div>

        {/* NEW: Budget vs Actual Chart - Full Width */}
        <BudgetVsActual />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart data={spendingTrend} />
          <CategoryBreakdown data={categoryBreakdown} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMerchants merchants={topMerchants} />

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all →
              </a>
            </div>
            
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">
                          {getCategoryIcon(transaction.category)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.merchantName || transaction.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.amount < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {transaction.amount < 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">💳</span>
                <p className="text-gray-500 mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Sync your bank accounts to see transactions
                </p>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span className={syncing ? 'animate-spin' : ''}>🔄</span>
                  <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function getCategoryIcon(category) {
  const icons = {
    'FOOD_AND_DRINK': '🍔',
    'TRANSPORTATION': '🚗',
    'ENTERTAINMENT': '🎬',
    'SHOPPING': '🛍️',
    'TRAVEL': '✈️',
    'GENERAL_MERCHANDISE': '🏪',
    'RENT_AND_UTILITIES': '🏠',
    'TRANSFER_OUT': '💸',
    'TRANSFER_IN': '💰',
    'PERSONAL_CARE': '💅',
    'HEALTHCARE': '🏥',
  };
  return icons[category] || '💳';
}
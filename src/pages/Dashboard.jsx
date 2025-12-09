import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import Layout from '../components/layout/Layout';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import TopMerchants from '../components/dashboard/TopMerchants';
import { analyticsAPI, transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';
import { DashboardSkeleton } from '../components/common/Skeleton';




export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    monthlySummary: null,
    spendingTrend: {},
    categoryBreakdown: {},
    topMerchants: {},
    recentTransactions: [],
  });

  // In useEffect - don't show toast
  useEffect(() => {
    loadDashboardData(false); // Don't show toast on mount
  }, []);

  const loadDashboardData = async (showToast = false) => {
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const [summaryRes, trendRes, categoryRes, merchantsRes, transactionsRes] = await Promise.all([
        analyticsAPI.getMonthlySummary(),
        analyticsAPI.getSpendingTrend(startDate, endDate).catch(() => ({ data: {} })),
        analyticsAPI.getSpendingByCategory(startDate, endDate),
        analyticsAPI.getTopMerchants(startDate, endDate, 5),
        transactionsAPI.getAll(),
      ]);

      setData({
        monthlySummary: summaryRes.data,
        spendingTrend: trendRes.data,
        categoryBreakdown: categoryRes.data,
        topMerchants: merchantsRes.data,
        recentTransactions: transactionsRes.data.slice(0, 5),
      });
      // Only show toast if explicitly requested
      if (showToast){
        toast.success('Dashboard refreshed!');
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  const { monthlySummary, spendingTrend, categoryBreakdown, topMerchants, recentTransactions } = data;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <button 
            onClick={() => loadDashboardData(true)} // Show toast on refresh
            className="btn-primary"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Spending */}
          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(monthlySummary?.totalSpending)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          {/* Total Income */}
          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(monthlySummary?.totalSpending)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                <p className={`text-3xl font-bold mt-2 ${
                  (monthlySummary?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${monthlySummary?.netCashFlow?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart data={spendingTrend} />
          <CategoryBreakdown data={categoryBreakdown} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Merchants */}
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
                        <span className="text-lg">💳</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${transaction.amount?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
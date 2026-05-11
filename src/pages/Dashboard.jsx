import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import Layout from '../components/layout/Layout';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import TopMerchants from '../components/dashboard/TopMerchants';
import TrendIndicator from '../components/dashboard/TrendIndicator';
import BudgetVsActual from '../components/dashboard/BudgetVsActual';
import { analyticsAPI, transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/helpers';
import { DashboardSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import CategoryIcon from '../components/common/CategoryIcon';
import { TrendingDown, TrendingUp, DollarSign, CreditCard, RotateCw, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';



export default function Dashboard() {
  const { user } = useAuth();
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
      
      toast.success('Transactions synced!', { id: 'sync' });
      
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
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Here's your financial overview.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDashboardData(true)}
              className="btn-secondary p-2 rounded-lg"
              title="Refresh"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Transactions'}</span>
            </button>
          </div>
        </div>

       

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="card stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {formatCurrency(monthlySummary?.totalSpending)}
                </p>
              </div>
              <div className="h-11 w-11 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-red-500" strokeWidth={2} />
              </div>
            </div>
            <TrendIndicator
              current={monthlySummary?.totalSpending}
              previous={lastMonthSummary?.totalSpending}
              type="spending"
            />
          </div>

          <div className="card stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {formatCurrency(monthlySummary?.totalIncome || monthlySummary?.totalSpending)}
                </p>
              </div>
              <div className="h-11 w-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-green-500" strokeWidth={2} />
              </div>
            </div>
            <TrendIndicator
              current={monthlySummary?.totalIncome || monthlySummary?.totalSpending}
              previous={lastMonthSummary?.totalIncome || lastMonthSummary?.totalSpending}
              type="income"
            />
          </div>

          <div className="card stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
                <p className={`text-2xl font-bold mt-1.5 ${
                  (monthlySummary?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(monthlySummary?.netCashFlow)}
                </p>
              </div>
              <div className="h-11 w-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <TrendIndicator
              current={monthlySummary?.netCashFlow}
              previous={lastMonthSummary?.netCashFlow}
              type="neutral"
            />
          </div>
        </div>

        <BudgetVsActual />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart data={spendingTrend} />
          <CategoryBreakdown data={categoryBreakdown} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMerchants merchants={topMerchants} />

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last {recentTransactions.length} transactions</p>
              </div>
              <Link to="/transactions" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                View all →
              </Link>
            </div>
            
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={transaction.category} size="md" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.merchantName || transaction.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${
                      transaction.amount < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {transaction.amount < 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Sync your bank accounts to see transactions
                </p>
                <button onClick={handleSync} disabled={syncing} className="btn-primary inline-flex items-center gap-2">
                  <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
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


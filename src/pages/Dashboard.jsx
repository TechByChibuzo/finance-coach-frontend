import Layout from '../components/layout/Layout';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import TopMerchants from '../components/dashboard/TopMerchants';
import { DashboardSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/helpers';

export default function Dashboard() {
  throw new Error('Test error boundary!');
  const { 
    monthlySummary, 
    spendingTrend, 
    categoryBreakdown, 
    topMerchants, 
    isLoading, 
    error,
    errorType,
    refetch 
  } = useAnalytics();
  
  const { transactions, sync, isSyncing } = useTransactions();
  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage 
          message={error?.message || 'Failed to load dashboard'} 
          onRetry={refetch} 
          type={errorType || 'error'}
        />
      </Layout>
    );
  }

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
              onClick={refetch}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            
            <button 
              onClick={sync}
              disabled={isSyncing}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              <span>{isSyncing ? 'Syncing...' : 'Sync Transactions'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Spending */}
          <div className="card stat-card">
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
          <div className="card stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(monthlySummary?.totalIncome || monthlySummary?.totalSpending)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="card stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                <p className={`text-3xl font-bold mt-2 ${
                  (monthlySummary?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(monthlySummary?.netCashFlow)}
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
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 transaction-item rounded-lg px-2 -mx-2">
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
                  onClick={sync}
                  disabled={isSyncing}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
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
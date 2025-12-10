import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useTransactions } from '../hooks/useTransactions';

export default function Transactions() {
  const { transactions, isLoading, sync, isSyncing } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, selectedCategory, transactions]);

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchantName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    setFilteredTransactions(filtered);
  };

  const categories = ['all', ...new Set(transactions.map(t => t.category).filter(Boolean))];

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading transactions..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-500 mt-1">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={sync}
            disabled={isSyncing}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            <span>{isSyncing ? 'Syncing...' : 'Sync Transactions'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="sm:w-64">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="card">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="py-4 hover:bg-gray-50 transition-colors px-4 -mx-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {getCategoryIcon(transaction.category)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {transaction.merchantName || transaction.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {transaction.category && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500 capitalize">
                                {transaction.category.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className={`font-bold text-lg ${
                        transaction.amount < 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.amount < 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No transactions yet"
              message="Sync your bank accounts to see your transactions here"
              action={sync}
              actionLabel="Sync Transactions"
            />
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-gray-500 text-lg mb-2">No transactions found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          )}
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
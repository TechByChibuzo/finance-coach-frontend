import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import Layout from '../components/layout/Layout';
import CategoryIcon from '../components/common/CategoryIcon';
import { transactionsAPI } from '../services/api';
import { Search, SlidersHorizontal, RefreshCw, CreditCard, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import Skeleton from '../components/common/Skeleton';

const CATEGORY_NAME_MAP = {
  'FOOD_AND_DRINK':      'Food & Dining',
  'LOAN_PAYMENTS':       'Loans',
  'TRANSPORTATION':      'Transportation',
  'GENERAL_MERCHANDISE': 'Shopping',
  'ENTERTAINMENT':       'Entertainment',
  'TRAVEL':              'Travel',
  'PERSONAL_CARE':       'Personal Care',
  'RENT_AND_UTILITIES':  'Bills & Utilities',
  'HEALTHCARE':          'Healthcare',
  'HOME_IMPROVEMENT':    'Home',
  'TRANSFER_IN':         'Transfer In',
  'TRANSFER_OUT':        'Transfer Out',
  'INCOME':              'Income',
};

const todayStr = format(new Date(), 'yyyy-MM-dd');
const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

function formatGroupLabel(dateStr) {
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return format(new Date(`${dateStr}T12:00:00`), 'MMMM d, yyyy');
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="card">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-56 rounded-lg" />
        </div>
      </div>
      <div className="card">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, selectedCategory, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async () => {
    try {
      setSyncing(true);
      toast.loading('Syncing transactions...', { id: 'sync' });
      await transactionsAPI.sync();
      await loadTransactions();
      toast.success('Transactions synced!', { id: 'sync' });
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      toast.error('Failed to sync transactions', { id: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

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

  const totalSpent = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    const key = format(new Date(`${t.date}T12:00:00`), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const sortedGroups = Object.entries(groupedTransactions)
    .sort(([a], [b]) => new Date(b) - new Date(a));

  if (loading) {
    return (
      <Layout>
        <TransactionsSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={syncTransactions}
            disabled={syncing}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Transactions'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white"
              />
            </div>
            <div className="relative sm:w-56">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all'
                      ? 'All Categories'
                      : CATEGORY_NAME_MAP[category] || category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          {filteredTransactions.length > 0 ? (
            <>
              {/* Summary bar */}
              <div className="flex items-center gap-6 pb-4 mb-2 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Spent</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Income</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Net</p>
                  <p className={`text-sm font-semibold ${totalIncome - totalSpent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {totalIncome - totalSpent >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalIncome - totalSpent))}
                  </p>
                </div>
              </div>

              {/* Grouped list */}
              <div className="space-y-5">
                {sortedGroups.map(([dateKey, txns]) => (
                  <div key={dateKey}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {formatGroupLabel(dateKey)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {txns.length} transaction{txns.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {txns.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg"
                        >
                          <CategoryIcon category={transaction.category} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {transaction.merchantName || transaction.name}
                            </p>
                            {transaction.category && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {CATEGORY_NAME_MAP[transaction.category] || transaction.category.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                          <p className={`text-sm font-semibold shrink-0 ${
                            transaction.amount < 0 ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {transaction.amount < 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : transactions.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-1">No transactions yet</p>
              <p className="text-sm text-gray-400 mb-4">Sync your bank accounts to see transactions</p>
              <button onClick={syncTransactions} disabled={syncing} className="btn-primary inline-flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-1">No transactions found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

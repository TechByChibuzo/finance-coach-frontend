import { useEffect, useMemo, useState } from 'react';
import { addMonths, format, isSameMonth, parseISO, startOfMonth, subDays } from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Search, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import CategoryIcon from '../components/common/CategoryIcon';
import Skeleton from '../components/common/Skeleton';
import ImportCsvModal from '../components/transactions/ImportCsvModal';
import { plaidAPI, transactionsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { categoryLabel } from '../utils/categories';

// Same rule as the backend's totals: moving money between your own accounts
// (transfers, paying off a credit card) is neither spending nor income.
const isTransfer = (t) =>
  t.category === 'TRANSFER_IN' ||
  t.category === 'TRANSFER_OUT' ||
  t.subcategory === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT';

const todayKey = format(new Date(), 'yyyy-MM-dd');
const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');

const dayLabel = (key) => {
  if (key === todayKey) return 'Today';
  if (key === yesterdayKey) return 'Yesterday';
  return format(parseISO(key), 'EEEE, MMM d');
};

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="card space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accountNames, setAccountNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [importing, setImporting] = useState(false);

  const loadTransactions = async () => {
    try {
      const [txRes, accountsRes] = await Promise.all([
        transactionsAPI.getAll(),
        plaidAPI.getAccounts().catch(() => ({ data: [] })),
      ]);
      setTransactions(txRes.data);
      setAccountNames(Object.fromEntries(accountsRes.data.map((a) => [a.id, a.accountName])));
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error("Couldn't load your transactions. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const syncTransactions = async () => {
    setSyncing(true);
    const id = toast.loading('Syncing your accounts…');
    try {
      await transactionsAPI.sync();
      await loadTransactions();
      toast.success('Accounts synced', { id });
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      toast.error("Sync didn't finish. Try again in a moment.", { id });
    } finally {
      setSyncing(false);
    }
  };

  const monthTransactions = useMemo(
    () => transactions.filter((t) => isSameMonth(parseISO(t.date), month)),
    [transactions, month]
  );

  const categories = useMemo(
    () => [...new Set(monthTransactions.map((t) => t.category).filter(Boolean))]
      .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b))),
    [monthTransactions]
  );

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return monthTransactions.filter((t) =>
      (category === 'all' || t.category === category) &&
      (!term || t.name?.toLowerCase().includes(term) || t.merchantName?.toLowerCase().includes(term))
    );
  }, [monthTransactions, searchTerm, category]);

  const totals = useMemo(() => {
    let spent = 0;
    let income = 0;
    for (const t of visible) {
      if (isTransfer(t)) continue;
      if (t.amount > 0) spent += t.amount;
      else income += -t.amount;
    }
    return { spent, income, net: income - spent };
  }, [visible]);

  const days = useMemo(() => {
    const groups = {};
    for (const t of visible) (groups[t.date] ||= []).push(t);
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [visible]);

  if (loading) {
    return <Layout><TransactionsSkeleton /></Layout>;
  }

  const isCurrentMonth = isSameMonth(month, new Date());
  const filtering = searchTerm || category !== 'all';

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Transactions</h1>
          <div className="flex gap-2">
            <button onClick={() => setImporting(true)} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Import CSV">
              <Upload className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            <button onClick={syncTransactions} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Sync accounts">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden />
              <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
            </button>
          </div>
        </header>

        <section className="card p-0" aria-label="Month summary">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <p className="text-base font-bold text-gray-900">{format(month, 'MMMM yyyy')}</p>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              disabled={isCurrentMonth}
              className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              ['Spent', formatCurrency(totals.spent), 'text-gray-900'],
              ['Money in', formatCurrency(totals.income), 'text-green-600'],
              ['Net', `${totals.net > 0 ? '+' : ''}${formatCurrency(totals.net)}`, totals.net < 0 ? 'text-red-600' : 'text-green-600'],
            ].map(([label, value, tone]) => (
              <div key={label} className="px-4 sm:px-6 py-4">
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                <dd className={`mt-1 text-base sm:text-xl font-bold ${tone}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Search transactions</span>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden />
            <input
              type="search"
              placeholder="Search by merchant"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:outline-2 focus:outline-primary-600"
            />
          </label>
          <label className="relative sm:w-60">
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white appearance-none focus:outline-2 focus:outline-primary-600"
            >
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden />
          </label>
        </div>

        {days.length === 0 ? (
          <div className="card text-center py-14">
            {transactions.length === 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Connect a bank in Settings and sync, or import a CSV file of transactions downloaded from your bank.
                </p>
                <div className="flex justify-center gap-2">
                  <button onClick={() => setImporting(true)} className="btn-primary text-sm">Import CSV</button>
                  <button onClick={syncTransactions} disabled={syncing} className="btn-secondary text-sm">
                    {syncing ? 'Syncing…' : 'Sync now'}
                  </button>
                </div>
              </>
            ) : filtering ? (
              <p className="text-sm text-gray-600">Nothing in {format(month, 'MMMM')} matches that search or category.</p>
            ) : (
              <p className="text-sm text-gray-600">No transactions in {format(month, 'MMMM yyyy')}.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {days.map(([day, txns]) => {
              const daySpent = txns.reduce((sum, t) => (!isTransfer(t) && t.amount > 0 ? sum + t.amount : sum), 0);
              return (
                <section key={day} className="card py-2 px-5 sm:px-6" aria-label={dayLabel(day)}>
                  <div className="flex items-baseline justify-between py-3 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">{dayLabel(day)}</h2>
                    {daySpent > 0 && <p className="text-xs font-medium text-gray-500">{formatCurrency(daySpent)} spent</p>}
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {txns.map((t) => {
                      const transfer = isTransfer(t);
                      const moneyIn = t.amount < 0;
                      return (
                        <li key={t.id} className="flex items-center gap-3 sm:gap-4 py-3">
                          <CategoryIcon category={t.category} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{t.merchantName || t.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {transfer ? 'Transfer' : categoryLabel(t.category)}
                              {(accountNames[t.accountId] || t.importAccountName) && (
                                <span className="hidden sm:inline">, {accountNames[t.accountId] || t.importAccountName}</span>
                              )}
                              {t.pending && <span className="ml-1.5 font-medium text-amber-600">Pending</span>}
                            </p>
                          </div>
                          <p className={`text-sm font-bold shrink-0 ${transfer ? 'text-gray-400' : moneyIn ? 'text-green-600' : 'text-gray-900'}`}>
                            {moneyIn ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
            <p className="text-xs text-gray-500 px-1">
              Transfers between your own accounts and credit card payments are listed but not counted as spending or income.
            </p>
          </div>
        )}
      </div>
      {importing && <ImportCsvModal onClose={() => setImporting(false)} onImported={loadTransactions} />}
    </Layout>
  );
}

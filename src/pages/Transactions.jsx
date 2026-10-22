import { useCallback, useEffect, useMemo, useState } from 'react';
import { addMonths, endOfMonth, format, isSameMonth, parseISO, startOfMonth, subDays } from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight, Download, RefreshCw, Search, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import MerchantIcon from '../components/common/MerchantIcon';
import Skeleton from '../components/common/Skeleton';
import ImportCsvModal from '../components/transactions/ImportCsvModal';
import TransactionEditor from '../components/transactions/TransactionEditor';
import { exportAPI, plaidAPI, transactionsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { categoryLabel } from '../utils/categories';
import { countsInTotals, isTransfer, withoutSplitOriginals } from '../utils/transactions';
import { merchantOf } from '../utils/merchant';

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
  // Only the selected month is loaded; search asks the server across all months
  const [transactions, setTransactions] = useState([]);
  const [hasAny, setHasAny] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [accountNames, setAccountNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState(null);
  // Bumped after an edit so open search results are fetched again
  const [searchVersion, setSearchVersion] = useState(0);
  const [exporting, setExporting] = useState(false);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data } = await exportAPI.transactions();
      window.location.assign(data.downloadUrl);
    } catch (error) {
      toast.error(error.response?.status === 403
        ? (error.response.data?.message || 'Exporting is available on Premium.')
        : "Couldn't prepare the export. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const loadMonth = useCallback(async (m) => {
    try {
      const { data } = await transactionsAPI.getByDateRange(
        format(startOfMonth(m), 'yyyy-MM-dd'), format(endOfMonth(m), 'yyyy-MM-dd'));
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error("Couldn't load your transactions. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHasAny = () =>
    transactionsAPI.recent(1).then(({ data }) => setHasAny(data.length > 0)).catch(() => {});

  useEffect(() => {
    loadMonth(month);
  }, [month, loadMonth]);

  useEffect(() => {
    checkHasAny();
    plaidAPI.getAccounts()
      .then(({ data }) => setAccountNames(Object.fromEntries(data.map((a) => [a.id, a.accountName]))))
      .catch(() => {});
  }, []);

  // Search all months on the server, a moment after typing stops
  const searchText = searchTerm.trim();
  const searchActive = searchText.length >= 2;
  useEffect(() => {
    if (searchText.length < 2) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await transactionsAPI.search(searchText);
        if (!cancelled) setSearchResults({ text: searchText, items: data });
      } catch {
        if (!cancelled) toast.error("Search didn't work. Try again.");
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchText, searchVersion]);

  const loadTransactions = async () => {
    await loadMonth(month);
    checkHasAny();
  };

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

  // In search mode the list is the server's matches (once they're for the current text)
  const baseList = useMemo(() => {
    if (!searchActive) return withoutSplitOriginals(transactions);
    return searchResults?.text === searchText ? withoutSplitOriginals(searchResults.items) : [];
  }, [searchActive, searchResults, searchText, transactions]);

  const categories = useMemo(
    () => [...new Set(baseList.map((t) => t.category).filter(Boolean))]
      .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b))),
    [baseList]
  );

  const visible = useMemo(
    () => baseList.filter((t) => category === 'all' || t.category === category),
    [baseList, category]
  );

  const totals = useMemo(() => {
    let spent = 0;
    let income = 0;
    for (const t of visible) {
      if (!countsInTotals(t)) continue;
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
  const filtering = category !== 'all';

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Transactions</h1>
          <div className="flex gap-2">
            <button onClick={exportCsv} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Export CSV">
              <Download className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">{exporting ? 'Preparing…' : 'Export'}</span>
            </button>
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
          {searchActive ? (
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
              <p className="text-base font-bold text-gray-900">
                {searching ? 'Searching…' : `${visible.length} ${visible.length === 1 ? 'match' : 'matches'} for "${searchText}"`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Across all months. Clear the search to browse by month.</p>
            </div>
          ) : (
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
          )}
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-surface placeholder:text-gray-400 focus:outline-2 focus:outline-primary-600"
            />
          </label>
          <label className="relative sm:w-60">
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-surface appearance-none focus:outline-2 focus:outline-primary-600"
            >
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden />
          </label>
        </div>

        {days.length === 0 ? (
          <div className="card text-center py-14">
            {!hasAny ? (
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
            ) : searchActive ? (
              <p className="text-sm text-gray-600">
                {searching ? 'Searching…' : `No transactions match "${searchText}"${filtering ? ' in that category' : ''}.`}
              </p>
            ) : filtering ? (
              <p className="text-sm text-gray-600">Nothing in {format(month, 'MMMM')} is in that category.</p>
            ) : (
              <p className="text-sm text-gray-600">No transactions in {format(month, 'MMMM yyyy')}.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card p-0 overflow-hidden">
            {days.map(([day, txns]) => {
              const daySpent = txns.reduce((sum, t) => (countsInTotals(t) && t.amount > 0 ? sum + t.amount : sum), 0);
              return (
                <section key={day} aria-label={dayLabel(day)}>
                  <div className="flex items-baseline justify-between px-5 sm:px-6 py-2 bg-gray-50 border-y border-gray-100 first:border-t-0">
                    <h2 className="text-xs font-semibold text-gray-600">{dayLabel(day)}</h2>
                    {daySpent > 0 && <p className="text-xs text-gray-500 tabular-nums">{formatCurrency(daySpent)} spent</p>}
                  </div>
                  <ul className="divide-y divide-gray-100 px-3 sm:px-4">
                    {txns.map((t) => {
                      const transfer = isTransfer(t);
                      const muted = transfer || t.hidden;
                      const moneyIn = t.amount < 0;
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => setEditing(t)}
                            className="w-full flex items-center gap-3 sm:gap-4 py-3 px-2 text-left rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary-600"
                            aria-label={`Edit ${merchantOf(t)}`}
                          >
                          <MerchantIcon logoUrl={t.logoUrl} category={t.category} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{merchantOf(t)}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {transfer ? 'Transfer' : categoryLabel(t.category)}
                              {(accountNames[t.accountId] || t.importAccountName) && (
                                <span className="hidden sm:inline">, {accountNames[t.accountId] || t.importAccountName}</span>
                              )}
                              {t.pending && <span className="ml-1.5 font-medium text-amber-600">Pending</span>}
                              {t.splitFromId && <span className="ml-1.5 font-medium text-gray-600">Split</span>}
                              {t.hidden && <span className="ml-1.5 font-medium text-gray-600">Hidden</span>}
                            </p>
                            {t.notes && <p className="text-xs text-gray-500 italic truncate">{t.notes}</p>}
                          </div>
                          <p className={`text-sm font-bold shrink-0 ${muted ? `text-gray-400${t.hidden ? ' line-through' : ''}` : moneyIn ? 'text-green-600' : 'text-gray-900'}`}>
                            {moneyIn ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                          </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
            </div>
            <p className="text-xs text-gray-500 px-1">
              Transfers between your own accounts, credit card payments, and hidden transactions are listed but not counted as spending or income.
            </p>
          </div>
        )}
      </div>
      {importing && <ImportCsvModal onClose={() => setImporting(false)} onImported={loadTransactions} />}
      {editing && (
        <TransactionEditor
          transaction={editing}
          onClose={() => setEditing(null)}
          onChanged={() => {
            loadMonth(month);
            setSearchVersion((v) => v + 1);
          }}
        />
      )}
    </Layout>
  );
}

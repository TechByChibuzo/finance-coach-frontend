import { useEffect, useState } from 'react';
import { format, getDate, getDaysInMonth, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import MonthPulse from '../components/dashboard/MonthPulse';
import { BudgetProgress, CategoryBars, MerchantList, RecentTransactions } from '../components/dashboard/DashboardLists';
import { DashboardSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import { analyticsAPI, budgetAPI, transactionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ymd = (d) => format(d, 'yyyy-MM-dd');

// Daily spending map {date: amount} -> running total by day of month
const cumulativeByDay = (daily, monthStart, days, lastDay) => {
  const result = [];
  let total = 0;
  for (let day = 1; day <= days; day++) {
    const date = ymd(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
    total += Number(daily?.[date] || 0);
    result.push(day <= lastDay ? total : null);
  }
  return result;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const now = new Date();
  const today = getDate(now);
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const loadDashboardData = async () => {
    try {
      setError(null);
      // Everything on this page covers the same period: the current calendar month
      const [summaryRes, thisTrendRes, lastTrendRes, budgetsRes, transactionsRes] = await Promise.all([
        analyticsAPI.getMonthlySummary(),
        analyticsAPI.getSpendingTrend(ymd(thisMonthStart), ymd(now)).catch(() => ({ data: {} })),
        analyticsAPI.getSpendingTrend(ymd(lastMonthStart), ymd(endOfMonth(lastMonthStart))).catch(() => ({ data: {} })),
        budgetAPI.getCurrentMonthBudgets().catch(() => ({ data: null })),
        transactionsAPI.getAll(),
      ]);

      const days = getDaysInMonth(now);
      const thisMonth = cumulativeByDay(thisTrendRes.data, thisMonthStart, days, today);
      const lastMonth = cumulativeByDay(lastTrendRes.data, lastMonthStart, days, getDaysInMonth(lastMonthStart));

      setData({
        summary: summaryRes.data,
        series: thisMonth.map((value, i) => ({ day: i + 1, thisMonth: value, lastMonth: lastMonth[i] })),
        budgets: budgetsRes.data,
        // Newest first: the API doesn't promise an order (imported files arrive oldest first)
        recentTransactions: [...transactionsRes.data]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError("Couldn't load your dashboard. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const id = toast.loading('Syncing your accounts…');
    try {
      await transactionsAPI.sync();
      await loadDashboardData();
      toast.success('Accounts synced', { id });
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error("Sync didn't finish. Try again in a moment.", { id });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <Layout><DashboardSkeleton /></Layout>;
  }
  if (error) {
    return <Layout><ErrorMessage message={error} onRetry={loadDashboardData} /></Layout>;
  }

  const firstName = user?.fullName?.split(' ')[0];

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">{firstName ? `Hi ${firstName}` : 'Your month'}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{format(now, 'MMMM')}</h1>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-secondary flex items-center gap-2 text-sm"
            aria-label="Sync accounts"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden />
            <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
          </button>
        </header>

        <MonthPulse
          summary={data.summary}
          series={data.series}
          today={today}
          lastMonthName={format(lastMonthStart, 'MMMM')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BudgetProgress budgets={data.budgets} />
          <CategoryBars breakdown={data.summary?.categoryBreakdown} />
          <MerchantList merchants={data.summary?.topMerchants} />
        </div>

        <RecentTransactions transactions={data.recentTransactions} onSync={handleSync} syncing={syncing} />
      </div>
    </Layout>
  );
}

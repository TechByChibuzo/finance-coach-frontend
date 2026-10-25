import { useEffect, useState } from 'react';
import { format, getDate, getDaysInMonth, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import MonthPulse from '../components/dashboard/MonthPulse';
import { BudgetProgress, CategoryBars, ComingUp, MerchantList, NetWorthCard, RecentTransactions } from '../components/dashboard/DashboardLists';
import { DashboardSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import { withoutSplitOriginals } from '../utils/transactions';
import { aiCoachAPI, analyticsAPI, budgetAPI, networthAPI, recurringAPI, transactionsAPI } from '../services/api';
import SetupChecklist from '../components/dashboard/SetupChecklist';
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
      const [summaryRes, thisTrendRes, lastTrendRes, budgetsRes, transactionsRes, netWorthRes, conversationRes, recurringRes] = await Promise.all([
        analyticsAPI.getMonthlySummary(),
        analyticsAPI.getSpendingTrend(ymd(thisMonthStart), ymd(now)).catch(() => ({ data: {} })),
        analyticsAPI.getSpendingTrend(ymd(lastMonthStart), ymd(endOfMonth(lastMonthStart))).catch(() => ({ data: {} })),
        budgetAPI.getCurrentMonthBudgets().catch(() => ({ data: null })),
        transactionsAPI.recent(6),
        networthAPI.getCurrent().catch(() => ({ data: null })),
        aiCoachAPI.getConversation().catch(() => ({ data: [] })),
        recurringAPI.list().catch(() => ({ data: [] })),
      ]);

      const days = getDaysInMonth(now);
      const thisMonth = cumulativeByDay(thisTrendRes.data, thisMonthStart, days, today);
      const lastMonth = cumulativeByDay(lastTrendRes.data, lastMonthStart, days, getDaysInMonth(lastMonthStart));

      setData({
        summary: summaryRes.data,
        series: thisMonth.map((value, i) => ({ day: i + 1, thisMonth: value, lastMonth: lastMonth[i] })),
        budgets: budgetsRes.data,
        netWorth: netWorthRes.data,
        recurring: recurringRes.data,
        setup: {
          hasTransactions: transactionsRes.data.length > 0,
          hasBudgets: (budgetsRes.data?.budgets?.length ?? 0) > 0,
          hasAskedCoach: (conversationRes.data?.length ?? 0) > 0,
        },
        recentTransactions: withoutSplitOriginals(transactionsRes.data),
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError("Couldn't load your dashboard. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetches from the API on mount; state is set when the response arrives
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <MonthPulse
          summary={data.summary}
          series={data.series}
          today={today}
          lastMonthName={format(lastMonthStart, 'MMMM')}
          greeting={firstName ? `Hi ${firstName}` : 'Your month'}
          monthName={format(now, 'MMMM')}
          onSync={handleSync}
          syncing={syncing}
        />

        <SetupChecklist {...data.setup} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BudgetProgress budgets={data.budgets} />
          <CategoryBars breakdown={data.summary?.categoryBreakdown} />
          <MerchantList merchants={data.summary?.topMerchants} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions transactions={data.recentTransactions} onSync={handleSync} syncing={syncing} />
          </div>
          <div className="space-y-6">
            <NetWorthCard netWorth={data.netWorth} />
            <ComingUp recurring={data.recurring} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

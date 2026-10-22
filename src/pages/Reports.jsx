import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Layout from '../components/layout/Layout';
import Skeleton from '../components/common/Skeleton';
import CategoryIcon from '../components/common/CategoryIcon';
import CashFlowSankey from '../components/reports/CashFlowSankey';
import { analyticsAPI } from '../services/api';
import { categoryLabel } from '../utils/categories';
import { formatCurrency, formatCurrencyCompact } from '../utils/helpers';

const RANGES = [6, 12];
const INCOME = 'var(--color-chart-income)';
const SPENDING = 'var(--color-chart-spending)';

const monthDate = (key) => parse(key, 'yyyy-MM', new Date());

function Tile({ label, value, detail }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
    </div>
  );
}

function MonthTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-gray-900">{format(monthDate(m.month), 'MMMM yyyy')}</p>
      <p className="mt-1 flex items-center gap-2 text-gray-600">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: INCOME }} aria-hidden />
        Money in <span className="ml-auto pl-4 font-semibold text-gray-900 tabular-nums">{formatCurrency(m.income)}</span>
      </p>
      <p className="flex items-center gap-2 text-gray-600">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SPENDING }} aria-hidden />
        Spending <span className="ml-auto pl-4 font-semibold text-gray-900 tabular-nums">{formatCurrency(m.spending)}</span>
      </p>
      <p className="mt-1 border-t border-gray-100 pt-1 text-gray-600">
        {m.net >= 0 ? 'Saved' : 'Overspent'}{' '}
        <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(Math.abs(m.net))}</span>
      </p>
    </div>
  );
}

export default function Reports() {
  const [range, setRange] = useState(12);
  const [selected, setSelected] = useState(null);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['monthly-report', range],
    queryFn: () => analyticsAPI.monthlyReport(range).then((r) => r.data.map((m) => ({
      ...m,
      income: Number(m.income),
      spending: Number(m.spending),
      net: Number(m.net),
    }))),
  });

  // Start at the first month with any activity (keeping at least three), so a short
  // history doesn't leave most of the chart empty
  const months = useMemo(() => {
    const all = report || [];
    const first = all.findIndex((m) => m.income > 0 || m.spending > 0);
    if (first < 0) return all;
    return all.slice(Math.max(0, Math.min(first, all.length - 3)));
  }, [report]);
  const hasData = months.some((m) => m.income > 0 || m.spending > 0);

  // Averages leave out this month, which isn't over yet (unless it's all there is)
  const summary = useMemo(() => {
    const complete = months.length > 1 ? months.slice(0, -1) : months;
    const withActivity = complete.filter((m) => m.income > 0 || m.spending > 0);
    const n = withActivity.length || 1;
    const income = withActivity.reduce((s, m) => s + m.income, 0);
    const spending = withActivity.reduce((s, m) => s + m.spending, 0);
    return {
      avgIncome: income / n,
      avgSpending: spending / n,
      saved: income - spending,
      rate: income > 0 ? (income - spending) / income : null,
      months: withActivity.length,
    };
  }, [months]);

  // Until a month is picked, show the latest one with spending (this month may have none yet)
  const focus = months.find((m) => m.month === selected)
    || [...months].reverse().find((m) => m.spending > 0)
    || months[months.length - 1];

  // Each category's average over the other months, to compare the focused month against
  const categoryAverages = useMemo(() => {
    const others = months.filter((m) => m.month !== focus?.month && (m.income > 0 || m.spending > 0));
    const totals = {};
    for (const m of others) {
      for (const [c, amount] of Object.entries(m.spendingByCategory)) totals[c] = (totals[c] || 0) + Number(amount);
    }
    return Object.fromEntries(Object.entries(totals).map(([c, t]) => [c, t / (others.length || 1)]));
  }, [months, focus]);

  const categories = Object.entries(focus?.spendingByCategory || {}).map(([c, a]) => ({ category: c, amount: Number(a) }));
  const maxCategory = categories[0]?.amount || 1;

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Reports</h1>
          <div className="inline-flex rounded-xl border border-gray-200 bg-surface p-1" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button key={r} type="button" onClick={() => { setRange(r); setSelected(null); }} aria-pressed={range === r}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${range === r ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-800'}`}>
                {r} months
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="card text-sm text-gray-600">Couldn't load your reports. Try again in a moment.</div>
        ) : !hasData ? (
          <div className="card text-center py-12">
            <p className="text-sm font-semibold text-gray-900">Nothing to report yet</p>
            <p className="mt-1 text-sm text-gray-500">Connect a bank or import transactions, and your months will show up here.</p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3" aria-label="Summary">
              <Tile label="Average spending" value={`${formatCurrency(summary.avgSpending, false)}/mo`}
                detail={summary.months > 0 ? `Over ${summary.months} full ${summary.months === 1 ? 'month' : 'months'}` : 'This month so far'} />
              <Tile label="Average money in" value={`${formatCurrency(summary.avgIncome, false)}/mo`}
                detail="Pay and other income, not transfers" />
              <Tile label={summary.saved >= 0 ? 'Saved' : 'Overspent'} value={formatCurrency(Math.abs(summary.saved), false)}
                detail={summary.rate !== null && summary.saved >= 0 ? `${Math.round(summary.rate * 100)}% of what came in` : 'Spending was more than what came in'} />
            </section>

            <section className="card" aria-labelledby="cashflow-title">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="cashflow-title" className="text-base font-bold text-gray-900">Money in and out</h2>
                <ul className="flex gap-4 text-sm text-gray-600" aria-label="Legend">
                  <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: INCOME }} aria-hidden />Money in</li>
                  <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: SPENDING }} aria-hidden />Spending</li>
                </ul>
              </div>
              <p className="mt-1 text-sm text-gray-500">Select a month to see where the money went.</p>
              <div className="mt-4 h-72" aria-hidden>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} barGap={2} barCategoryGap="22%"
                    onClick={(e) => e?.activePayload?.[0] && setSelected(e.activePayload[0].payload.month)}>
                    <CartesianGrid vertical={false} stroke="var(--color-gray-200)" />
                    <XAxis dataKey="month" tickFormatter={(k) => format(monthDate(k), months.length > 6 ? 'MMM' : 'MMM yy')}
                      tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }} />
                    <YAxis tickFormatter={formatCurrencyCompact} tickLine={false} axisLine={false} width={56}
                      tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }} />
                    <Tooltip content={<MonthTooltip />} cursor={{ fill: 'var(--color-gray-100)' }} />
                    <Bar dataKey="income" name="Money in" fill={INCOME} radius={[4, 4, 0, 0]} maxBarSize={months.length <= 6 ? 48 : 28} isAnimationActive={false} className="cursor-pointer" />
                    <Bar dataKey="spending" name="Spending" fill={SPENDING} radius={[4, 4, 0, 0]} maxBarSize={months.length <= 6 ? 48 : 28} isAnimationActive={false} className="cursor-pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Choose a month">
                {months.map((m) => (
                  <button key={m.month} type="button" onClick={() => setSelected(m.month)} aria-pressed={focus?.month === m.month}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${focus?.month === m.month ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {format(monthDate(m.month), 'MMM yy')}
                  </button>
                ))}
              </div>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-900">View as table</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left tabular-nums">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="py-1.5 font-medium">Month</th>
                        <th className="py-1.5 font-medium text-right">Money in</th>
                        <th className="py-1.5 font-medium text-right">Spending</th>
                        <th className="py-1.5 font-medium text-right">Saved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {months.map((m) => (
                        <tr key={m.month} className="text-gray-800">
                          <td className="py-1.5">{format(monthDate(m.month), 'MMMM yyyy')}</td>
                          <td className="py-1.5 text-right">{formatCurrency(m.income)}</td>
                          <td className="py-1.5 text-right">{formatCurrency(m.spending)}</td>
                          <td className="py-1.5 text-right">{formatCurrency(m.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>

            {focus && (focus.income > 0 || focus.spending > 0) && (
              <section className="card hidden sm:block" aria-labelledby="flow-title">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="flow-title" className="text-base font-bold text-gray-900">
                    Where {format(monthDate(focus.month), 'MMMM')}'s money went
                  </h2>
                  <p className="text-sm text-gray-500 tabular-nums">
                    {focus.net >= 0
                      ? `${formatCurrency(focus.net, false)} saved`
                      : `${formatCurrency(-focus.net, false)} more out than in`}
                  </p>
                </div>
                <div className="mt-4">
                  <CashFlowSankey month={focus} />
                </div>
              </section>
            )}

            {focus && (
              <section className="card" aria-labelledby="categories-title">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="categories-title" className="text-base font-bold text-gray-900">
                    Spending by category, {format(monthDate(focus.month), 'MMMM')}
                  </h2>
                  <p className="text-sm text-gray-500 tabular-nums">{formatCurrency(focus.spending, false)} total</p>
                </div>
                {categories.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">No spending this month.</p>
                ) : (
                  <ul className="mt-5 space-y-4">
                    {categories.map((r) => {
                      const avg = categoryAverages[r.category];
                      const diff = avg ? (r.amount - avg) / avg : null;
                      return (
                        <li key={r.category} className="flex items-center gap-3">
                          <CategoryIcon category={r.category} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2 text-sm">
                              <span className="font-medium text-gray-800 truncate">{categoryLabel(r.category)}</span>
                              <span className="shrink-0 font-semibold text-gray-900 tabular-nums">{formatCurrency(r.amount, false)}</span>
                            </div>
                            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                              <div className="h-full rounded-full" style={{ width: `${(r.amount / maxCategory) * 100}%`, background: SPENDING }} />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 tabular-nums">
                              {avg
                                ? `${formatCurrency(avg, false)} average${Math.abs(diff) >= 0.1 ? `, ${Math.round(Math.abs(diff) * 100)}% ${diff > 0 ? 'more' : 'less'} this month` : ''}`
                                : 'Nothing in other months'}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
            <p className="text-xs text-gray-500 px-1">
              Transfers between your own accounts, credit card payments, and hidden transactions aren't counted. Split purchases count in each part's category.
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}

import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';
import useCountUp from '../../hooks/useCountUp';

const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const MINT = 'var(--color-hero-mint)';

function SyncButton({ onSync, syncing, className = '' }) {
  return (
    <button
      onClick={onSync}
      disabled={syncing}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/20 hover:bg-white/10 disabled:opacity-60 ${className}`}
      aria-label="Sync accounts"
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden />
      <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
    </button>
  );
}

/**
 * The dashboard's lead, on the brand's deep evergreen: who and when, this month's spending so
 * far against last month at the same point, where the month is heading, and both months as
 * cumulative lines day by day.
 */
export default function MonthPulse({ summary, series, today, lastMonthName, greeting, monthName, onSync, syncing }) {
  const spent = Number(summary?.totalSpending || 0);
  const income = Number(summary?.totalIncome || 0);
  const net = Number(summary?.netCashFlow || 0);
  const shownSpent = useCountUp(spent);

  const todayPoint = series.find((p) => p.day === today);
  const lastAtToday = todayPoint?.lastMonth;
  const difference = lastAtToday == null ? null : spent - lastAtToday;

  // Where the month is heading: this month so far, plus what last month spent from today on.
  // Following last month's shape keeps early bills like rent from inflating the estimate.
  const lastMonthTotal = Math.max(0, ...series.map((p) => p.lastMonth ?? 0));
  const projection = lastAtToday != null && lastMonthTotal > 0 && today < series.length
    ? spent + Math.max(0, lastMonthTotal - lastAtToday)
    : null;

  let verdict;
  if (difference == null || lastAtToday === 0) {
    verdict = <span className="text-white/60">No spending from {lastMonthName} to compare with yet.</span>;
  } else if (Math.abs(difference) < 1) {
    verdict = <span className="text-white/80">Right in line with {lastMonthName} at this point.</span>;
  } else if (difference < 0) {
    verdict = (
      <span className="text-hero-mint">
        {formatCurrency(-difference, false)} less than this point in {lastMonthName}.
      </span>
    );
  } else {
    verdict = (
      <span className="text-hero-rose">
        {formatCurrency(difference, false)} more than this point in {lastMonthName}.
      </span>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-hero text-white" aria-label="This month's spending">
      {/* One soft light source, so the band has depth without decoration */}
      <div
        className="pointer-events-none absolute -top-48 right-[-12%] h-[30rem] w-[40rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(159, 224, 207, 0.16), transparent)' }}
        aria-hidden
      />

      <div className="relative grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/60">{greeting}</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{monthName}</h1>
            </div>
            <SyncButton onSync={onSync} syncing={syncing} className="lg:hidden" />
          </div>

          <p className="mt-8 text-sm font-medium text-white/60">Spent so far</p>
          <p className="mt-1 text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums" aria-label={formatCurrency(spent, false)}>
            {formatCurrency(Math.round(shownSpent), false)}
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed">{verdict}</p>
          {projection != null && (
            <p className="mt-1.5 text-sm text-white/70">
              Heading for about{' '}
              <span className="font-semibold text-white tabular-nums">{formatCurrency(Math.round(projection / 10) * 10, false)}</span>
              {' '}by month end, if the rest goes like {lastMonthName}.
            </p>
          )}

          {/* Pushes the totals to the bottom, always leaving room above them */}
          <div className="min-h-8 flex-1" aria-hidden />
          <dl className="grid grid-cols-2 gap-6 border-t border-white/10 pt-5">
            <div>
              <dt className="text-xs font-medium text-white/60">Money in</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(income, false)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-white/60">Net cash flow</dt>
              <dd className={`mt-1 text-xl font-bold tabular-nums ${net < 0 ? 'text-hero-rose' : 'text-hero-mint'}`}>
                {net > 0 ? '+' : ''}{formatCurrency(net, false)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col px-3 pb-5 sm:px-6 lg:py-8 lg:pl-2 lg:pr-8">
          <div className="mb-4 hidden justify-end lg:flex">
            <SyncButton onSync={onSync} syncing={syncing} />
          </div>
          <div className="mb-2 flex items-center gap-5 px-3 text-xs font-medium text-white/60 lg:px-1">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded" style={{ background: MINT }} aria-hidden /> This month
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 border-t border-dashed border-white/40" aria-hidden /> {lastMonthName}
            </span>
          </div>
          <div className="h-52 sm:h-64 lg:h-auto lg:min-h-64 lg:flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="thisMonthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-hero-mint)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-hero-mint)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.5)' }}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrencyCompact(v)}
                  tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.5)' }}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255, 255, 255, 0.25)' }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-xs shadow-lg">
                        <p className="mb-1 font-semibold text-gray-900">Day {label}</p>
                        {payload.map((p) => p.value != null && (
                          <p key={p.dataKey} className="text-gray-600">
                            {p.dataKey === 'thisMonth' ? 'This month' : lastMonthName}:{' '}
                            <span className="font-semibold text-gray-900">{formatCurrency(p.value, false)}</span>
                          </p>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="lastMonth"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="thisMonth"
                  stroke={MINT}
                  strokeWidth={2.5}
                  fill="url(#thisMonthFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: MINT, stroke: 'var(--color-hero)', strokeWidth: 2 }}
                  connectNulls={false}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

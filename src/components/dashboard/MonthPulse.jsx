import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';

/**
 * The dashboard's lead: this month's spending so far, and how it is running against last
 * month at the same point, as cumulative lines day by day.
 */
export default function MonthPulse({ summary, series, today, lastMonthName }) {
  const spent = Number(summary?.totalSpending || 0);
  const income = Number(summary?.totalIncome || 0);
  const net = Number(summary?.netCashFlow || 0);

  const todayPoint = series.find((p) => p.day === today);
  const lastAtToday = todayPoint?.lastMonth;
  const difference = lastAtToday == null ? null : spent - lastAtToday;

  let verdict;
  if (difference == null || lastAtToday === 0) {
    verdict = <span className="text-gray-500">No spending from {lastMonthName} to compare with yet.</span>;
  } else if (Math.abs(difference) < 1) {
    verdict = <span className="text-gray-600">Right in line with {lastMonthName} at this point.</span>;
  } else if (difference < 0) {
    verdict = (
      <span className="text-green-700">
        {formatCurrency(-difference, false)} less than this point in {lastMonthName}.
      </span>
    );
  } else {
    verdict = (
      <span className="text-red-700">
        {formatCurrency(difference, false)} more than this point in {lastMonthName}.
      </span>
    );
  }

  return (
    <section className="card p-0 overflow-hidden" aria-label="This month's spending">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-8">
          <div>
            <p className="text-sm font-medium text-gray-500">Spent so far</p>
            <p className="mt-2 text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
              {formatCurrency(spent, false)}
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed">{verdict}</p>
          </div>
          <dl className="grid grid-cols-2 gap-6 border-t border-gray-100 pt-5">
            <div>
              <dt className="text-xs font-medium text-gray-500">Money in</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(income, false)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Net cash flow</dt>
              <dd className={`mt-1 text-lg font-bold ${net < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {net > 0 ? '+' : ''}{formatCurrency(net, false)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50/60 border-t lg:border-t-0 lg:border-l border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-5 text-xs font-medium text-gray-500 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-primary-600" aria-hidden /> This month
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-gray-400" aria-hidden /> {lastMonthName}
            </span>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="thisMonthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-600)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-gray-200)" strokeDasharray="0" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={{ fontSize: 12, fill: 'var(--color-gray-400)' }}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrencyCompact(v)}
                  tick={{ fontSize: 12, fill: 'var(--color-gray-400)' }}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-gray-300)' }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-xs shadow-sm">
                        <p className="font-semibold text-gray-900 mb-1">Day {label}</p>
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
                  stroke="var(--color-gray-400)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="thisMonth"
                  stroke="var(--color-primary-600)"
                  strokeWidth={2.5}
                  fill="url(#thisMonthFill)"
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

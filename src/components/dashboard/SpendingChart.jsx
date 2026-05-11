import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';
import { format } from 'date-fns';

const PRIMARY = '#0284c7';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-xl ring-1 ring-gray-900/5 p-3">
      <p className="text-xs text-gray-500 mb-0.5">{format(new Date(point.date), 'MMMM d, yyyy')}</p>
      <p className="text-sm font-semibold text-gray-900">{formatCurrency(point.amount)}</p>
    </div>
  );
};

export default function SpendingChart({ data = {} }) {
  const chartData = Object.entries(data)
    .map(([date, amount]) => ({
      date,
      amount: Math.abs(amount),
      displayDate: format(new Date(date), 'MMM d'),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const midpoint = Math.floor(chartData.length / 2);
  const firstHalfAvg = chartData.slice(0, midpoint).reduce((sum, d) => sum + d.amount, 0) / midpoint || 0;
  const secondHalfAvg = chartData.slice(midpoint).reduce((sum, d) => sum + d.amount, 0) / (chartData.length - midpoint) || 0;
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  const isIncreasing = trendPercentage > 0;

  const total = chartData.reduce((sum, d) => sum + d.amount, 0);
  const average = total / chartData.length || 0;

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Spending Trend</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-gray-400">No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Spending Trend</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Avg {formatCurrency(average, false)}/day · {chartData.length} days tracked
          </p>
        </div>

        {Math.abs(trendPercentage) > 1 && (
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
            isIncreasing ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {isIncreasing
              ? <TrendingUp className="w-3.5 h-3.5" />
              : <TrendingDown className="w-3.5 h-3.5" />
            }
            <span>{Math.abs(trendPercentage).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={(v) => formatCurrencyCompact(v)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: PRIMARY, strokeWidth: 1, strokeDasharray: '4 4' }} />

            <Area
              type="monotone"
              dataKey="amount"
              stroke={PRIMARY}
              strokeWidth={2}
              fill="url(#spendingGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: PRIMARY }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

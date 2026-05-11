import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';
import { TrendingUp } from 'lucide-react';

const PERIODS = [
  { label: '7D', value: 7 },
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1Y', value: 365 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-xl ring-1 ring-gray-900/5 p-3">
      <p className="text-xs text-gray-500 mb-0.5">{format(new Date(label), 'MMMM d, yyyy')}</p>
      <p className="text-sm font-semibold text-gray-900">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function PerformanceChart({ history, selectedPeriod, onPeriodChange }) {
  if (!history || history.length === 0) {
    return (
      <div className="card">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900">Performance</h2>
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No performance data yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Check back after the first snapshot</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = history.map(snapshot => ({
    date: snapshot.date,
    value: parseFloat(snapshot.totalValue) || 0,
  }));

  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const totalChange = lastValue - firstValue;
  const percentChange = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;
  const isPositive = totalChange >= 0;

  const lineColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Performance</h2>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(Math.abs(totalChange))}
            </span>
            <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1">
          {PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
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

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: '4 4' }} />

            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: lineColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

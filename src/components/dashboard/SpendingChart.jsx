// src/components/dashboard/SpendingChart.jsx - ENHANCED VERSION
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';
import { format } from 'date-fns';

export default function SpendingChart({ data = {} }) {
  // Convert data object to array format for chart
  const chartData = Object.entries(data)
    .map(([date, amount]) => ({
      date,
      amount: Math.abs(amount),
      displayDate: format(new Date(date), 'MMM d'),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate trend (compare first half vs second half)
  const midpoint = Math.floor(chartData.length / 2);
  const firstHalfAvg = chartData.slice(0, midpoint).reduce((sum, d) => sum + d.amount, 0) / midpoint || 0;
  const secondHalfAvg = chartData.slice(midpoint).reduce((sum, d) => sum + d.amount, 0) / (chartData.length - midpoint) || 0;
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  const isIncreasing = trendPercentage > 0;

  // Calculate total and average
  const total = chartData.reduce((sum, d) => sum + d.amount, 0);
  const average = total / chartData.length || 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-1">
          {format(new Date(data.date), 'MMMM d, yyyy')}
        </p>
        <p className="text-lg font-bold text-primary-600">
          {formatCurrency(data.amount)}
        </p>
      </div>
    );
  };

  // Format Y-axis
  const formatYAxis = (value) => {
    return formatCurrencyCompact(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Spending Trend</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header with Trend Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Spending Trend</h2>
          <p className="text-sm text-gray-500 mt-1">Daily spending over time</p>
        </div>

        {/* Trend Badge */}
        {Math.abs(trendPercentage) > 1 && (
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            ${isIncreasing 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
            }
          `}>
            {isIncreasing ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trendPercentage).toFixed(0)}%</span>
            <span className="text-xs opacity-75">vs earlier</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Total Spending</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(total, false)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Daily Average</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(average, false)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {/* Grid */}
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f0f0f0"
              vertical={false}
            />

            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#666' }}
              stroke="#999"
              tickLine={false}
            />

            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#666' }}
              stroke="#999"
              tickLine={false}
              width={60}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />

            {/* Area with gradient */}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorAmount)"
              fillOpacity={1}
              dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Daily spending amount</span>
        </div>
        <span>{chartData.length} days tracked</span>
      </div>
    </div>
  );
}
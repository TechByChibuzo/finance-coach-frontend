import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/helpers';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = {
  stock:       '#0284c7',
  etf:         '#10b981',
  bond:        '#f59e0b',
  cash:        '#6b7280',
  crypto:      '#8b5cf6',
  mutual_fund: '#ec4899',
  other:       '#64748b',
};

const TYPE_LABELS = {
  stock:       'Stocks',
  etf:         'ETFs',
  bond:        'Bonds',
  cash:        'Cash',
  crypto:      'Crypto',
  mutual_fund: 'Mutual Funds',
  other:       'Other',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-xl ring-1 ring-gray-900/5 p-3">
      <p className="text-xs font-semibold text-gray-900 mb-0.5">{data.name}</p>
      <p className="text-xs text-gray-500">
        {formatCurrency(data.value)} · {formatPercentage(data.percentage, 1)}
      </p>
    </div>
  );
};

function EmptyAllocation() {
  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Asset Allocation</h2>
      </div>
      <div className="h-56 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <PieChartIcon className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">No allocation data available</p>
        </div>
      </div>
    </div>
  );
}

export default function AllocationChart({ allocation }) {
  if (!allocation || Object.keys(allocation).length === 0) return <EmptyAllocation />;

  const data = Object.entries(allocation)
    .map(([type, value]) => ({
      name: TYPE_LABELS[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1),
      type: type.toLowerCase(),
      value: parseFloat(value) || 0,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <EmptyAllocation />;

  const chartData = data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
    color: COLORS[item.type] || COLORS.other,
  }));

  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Asset Allocation</h2>
        <p className="text-xs text-gray-400 mt-0.5">{chartData.length} asset type{chartData.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="h-56 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={2}
              dataKey="value"
              label={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.type}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="relative -mt-56 h-56 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Total value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(total, false)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-gray-100 pt-4">
        {chartData.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{item.name}</span>
                <span className="text-xs font-semibold text-gray-900 ml-2 shrink-0">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 w-8 text-right shrink-0">
              {formatPercentage(item.percentage, 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

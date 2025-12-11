// src/components/dashboard/CategoryBreakdown.jsx - DONUT CHART VERSION
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryIconSimple } from '../common/CategoryIcon';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

// Map backend category names to user-friendly names
const CATEGORY_NAME_MAP = {
  'FOOD_AND_DRINK': 'Food & Dining',
  'TRANSPORTATION': 'Transportation',
  'GENERAL_MERCHANDISE': 'Shopping',
  'ENTERTAINMENT': 'Entertainment',
  'TRAVEL': 'Travel',
  'PERSONAL_CARE': 'Personal Care',
  'RENT_AND_UTILITIES': 'Bills & Utilities',
  'HEALTHCARE': 'Healthcare',
  'HOME_IMPROVEMENT': 'Home',
  'TRANSFER_IN': 'Transfer In',
  'TRANSFER_OUT': 'Transfer Out',
  'INCOME': 'Income',
};

// Color palette for chart
const COLORS = {
  'Food & Dining': '#f97316',      // orange-500
  'Transportation': '#3b82f6',     // blue-500
  'Shopping': '#a855f7',           // purple-500
  'Entertainment': '#ec4899',      // pink-500
  'Travel': '#06b6d4',             // cyan-500
  'Personal Care': '#6366f1',      // indigo-500
  'Bills & Utilities': '#eab308',  // yellow-500
  'Healthcare': '#ef4444',         // red-500
  'Home': '#10b981',               // emerald-500
  'Transfer In': '#22c55e',        // green-500
  'Transfer Out': '#8b5cf6',       // violet-500
  'Income': '#84cc16',             // lime-500
  'Other': '#6b7280',              // gray-500
};

export default function CategoryBreakdown({ data = {} }) {
  // Process data
  const categories = Object.entries(data)
    .map(([category, amount]) => ({
      category: CATEGORY_NAME_MAP[category] || category,
      originalCategory: category,
      amount: Math.abs(amount),
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Calculate total
  const total = categories.reduce((sum, item) => sum + item.amount, 0);

  // Add percentage to each category
  const chartData = categories.map(item => ({
    ...item,
    percentage: (item.amount / total) * 100,
    color: COLORS[item.category] || COLORS['Other'],
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-1">{data.category}</p>
        <p className="text-sm text-gray-600">
          {formatCurrency(data.amount)} ({formatPercentage(data.percentage, 0)})
        </p>
      </div>
    );
  };

  // Custom center label
  const CenterLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-gray-500 text-sm"
        >
          Total Spent
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-gray-900 text-2xl font-bold"
        >
          {formatCurrency(total, false)}
        </text>
        <text
          x={cx}
          y={cy + 35}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-gray-500 text-xs"
        >
          This month
        </text>
      </g>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📊</span>
          <p className="text-gray-500">No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>

      {/* Donut Chart */}
      <div className="h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="amount"
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text content={<CenterLabel />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label Overlay (since Recharts center label can be tricky) */}
        <div className="relative -mt-72 h-72 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 my-1">
              {formatCurrency(total, false)}
            </p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        {chartData.map((item, index) => (
          <div
            key={item.category}
            className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Color dot matching chart */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />

              {/* Category icon */}
              <CategoryIconSimple 
                category={item.originalCategory} 
                size="sm"
              />

              {/* Category name */}
              <span className="text-sm font-medium text-gray-900">
                {item.category}
              </span>
            </div>

            {/* Amount and percentage */}
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {formatPercentage(item.percentage, 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
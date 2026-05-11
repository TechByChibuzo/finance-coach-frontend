import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryIconSimple } from '../common/CategoryIcon';
import { BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const CATEGORY_NAME_MAP = {
  'FOOD_AND_DRINK':       'Food & Dining',
  'LOAN_PAYMENTS':        'Loans',
  'TRANSPORTATION':       'Transportation',
  'GENERAL_MERCHANDISE':  'Shopping',
  'ENTERTAINMENT':        'Entertainment',
  'TRAVEL':               'Travel',
  'PERSONAL_CARE':        'Personal Care',
  'RENT_AND_UTILITIES':   'Bills & Utilities',
  'HEALTHCARE':           'Healthcare',
  'HOME_IMPROVEMENT':     'Home',
  'TRANSFER_IN':          'Transfer In',
  'TRANSFER_OUT':         'Transfer Out',
  'INCOME':               'Income',
};

const COLORS = {
  'Food & Dining':   '#f97316',
  'Transportation':  '#0ea5e9',
  'Shopping':        '#a855f7',
  'Entertainment':   '#ec4899',
  'Travel':          '#06b6d4',
  'Personal Care':   '#6366f1',
  'Bills & Utilities': '#eab308',
  'Healthcare':      '#ef4444',
  'Home':            '#10b981',
  'Transfer In':     '#22c55e',
  'Transfer Out':    '#8b5cf6',
  'Income':          '#84cc16',
  'Other':           '#94a3b8',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-xl ring-1 ring-gray-900/5 p-3">
      <p className="text-xs font-semibold text-gray-900 mb-0.5">{item.category}</p>
      <p className="text-xs text-gray-500">
        {formatCurrency(item.amount)} · {formatPercentage(item.percentage, 0)}
      </p>
    </div>
  );
};

export default function CategoryBreakdown({ data = {} }) {
  const categories = Object.entries(data)
    .map(([category, amount]) => ({
      category: CATEGORY_NAME_MAP[category] || category,
      originalCategory: category,
      amount: Math.abs(amount),
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const total = categories.reduce((sum, item) => sum + item.amount, 0);

  const chartData = categories.map(item => ({
    ...item,
    percentage: (item.amount / total) * 100,
    color: COLORS[item.category] || COLORS['Other'],
  }));

  if (categories.length === 0) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Spending by Category</h2>
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Spending by Category</h2>
        <p className="text-xs text-gray-400 mt-0.5">{categories.length} categories this month</p>
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
              dataKey="amount"
              label={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>

        <div className="relative -mt-56 h-56 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Total spent</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(total, false)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-gray-100 pt-4">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <CategoryIconSimple category={item.originalCategory} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 truncate">{item.category}</span>
                <span className="text-xs font-semibold text-gray-900 ml-2 shrink-0">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 w-8 text-right shrink-0">{formatPercentage(item.percentage, 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

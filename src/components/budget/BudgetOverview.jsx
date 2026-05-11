import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import BudgetProgress from './BudgetProgress';

const statusConfig = {
  on_track: {
    icon: TrendingUp,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    label: 'On track',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-500',
    label: 'Warning',
  },
  exceeded: {
    icon: TrendingDown,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
    label: 'Over budget',
  },
};

export default function BudgetOverview({ summary }) {
  if (!summary) return null;

  const { totalBudget, totalSpent, totalRemaining, percentageSpent, status, exceededCount, alertCount } = summary;

  const current = statusConfig[status] || statusConfig.on_track;
  const StatusIcon = current.icon;

  const statusMessage =
    status === 'exceeded'
      ? `${exceededCount} ${exceededCount === 1 ? 'category' : 'categories'} over budget`
      : status === 'warning'
      ? `${alertCount} ${alertCount === 1 ? 'category' : 'categories'} near limit`
      : 'Great job! You\'re on track this month';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Budget Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">{statusMessage}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${current.bgColor} ${current.textColor}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${current.iconColor}`} />
          <span>{current.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-1">Budgeted</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Spent</p>
          <p className={`text-2xl font-bold ${
            percentageSpent > 100 ? 'text-red-600' :
            percentageSpent > 80 ? 'text-amber-600' :
            'text-emerald-600'
          }`}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Remaining</p>
          <p className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {totalRemaining < 0 ? '-' : ''}{formatCurrency(Math.abs(totalRemaining))}
          </p>
        </div>
      </div>

      <BudgetProgress percentage={percentageSpent} size="lg" />
    </div>
  );
}

// src/components/budget/BudgetOverview.jsx
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import BudgetProgress from './BudgetProgress';

const BudgetOverview = ({ summary }) => {
  if (!summary) return null;

  const { totalBudget, totalSpent, totalRemaining, percentageSpent, status, exceededCount, alertCount } = summary;

  // Status configuration
  const statusConfig = {
    on_track: {
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-500',
      message: 'On track - Great job!',
    },
    warning: {
      icon: AlertCircle,
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-500',
      message: `${alertCount} ${alertCount === 1 ? 'category' : 'categories'} near limit`,
    },
    exceeded: {
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
      message: `${exceededCount} ${exceededCount === 1 ? 'category' : 'categories'} over budget`,
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.on_track;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${currentStatus.bgColor}`}>
          <StatusIcon className={`w-4 h-4 ${currentStatus.iconColor}`} />
          <span className={`text-sm font-medium ${currentStatus.textColor}`}>
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {/* Total Budget */}
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-600 mb-1">Budgeted</p>
          <p className="text-3xl font-bold text-gray-900">
            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Spent */}
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-600 mb-1">Spent</p>
          <p className={`text-3xl font-bold ${
            percentageSpent > 100 ? 'text-red-600' : 
            percentageSpent > 80 ? 'text-amber-600' : 
            'text-emerald-600'
          }`}>
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Remaining */}
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-600 mb-1">Remaining</p>
          <p className={`text-3xl font-bold ${
            totalRemaining < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {totalRemaining < 0 ? '-' : ''}${Math.abs(totalRemaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <BudgetProgress percentage={percentageSpent} size="lg" />
      </div>

      {/* Status Message */}
      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${currentStatus.bgColor}`}>
        <StatusIcon className={`w-5 h-5 ${currentStatus.iconColor}`} />
        <span className={`text-sm font-medium ${currentStatus.textColor}`}>
          {currentStatus.message}
        </span>
      </div>
    </div>
  );
};

export default BudgetOverview;
import { useCurrentBudgets } from '../../hooks/useBudgets';
import { Link } from 'react-router-dom';
import { PiggyBank, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Skeleton from '../common/Skeleton';
import { formatCurrency } from '../../utils/helpers';

export default function BudgetSummaryWidget() {
  const { data: budgetData, isLoading, error } = useCurrentBudgets();

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  const hasBudgets = budgetData?.budgets && budgetData.budgets.length > 0;

  if (!hasBudgets) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary-600" />
            Budget Tracking
          </h2>
        </div>
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-3">
            <PiggyBank className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Start tracking your spending with budgets</p>
          <Link to="/budget" className="btn-primary inline-flex items-center gap-2">
            <span>Create Budget</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (budgetData.status === 'exceeded') {
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        iconColor: 'text-red-500',
        borderColor: 'border-red-200',
        label: 'Over Budget',
      };
    } else if (budgetData.status === 'warning') {
      return {
        icon: TrendingUp,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-500',
        borderColor: 'border-amber-200',
        label: 'Watch Spending',
      };
    } else {
      return {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        iconColor: 'text-emerald-500',
        borderColor: 'border-emerald-200',
        label: 'On Track',
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const topCategories = [...budgetData.budgets]
    .sort((a, b) => {
      if (a.isExceeded && !b.isExceeded) return -1;
      if (!a.isExceeded && b.isExceeded) return 1;
      return b.percentageSpent - a.percentageSpent;
    })
    .slice(0, 3);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-primary-600" />
          Budget Tracking
        </h2>
        <Link
          to="/budget"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className={`rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor} p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
            <div>
              <p className={`text-sm font-semibold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {budgetData.budgets.length} {budgetData.budgets.length === 1 ? 'budget' : 'budgets'} active
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {budgetData.percentageSpent.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400">spent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Budgeted</p>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(budgetData.totalBudget)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Spent</p>
          <p className={`text-base font-semibold ${
            budgetData.percentageSpent > 100 ? 'text-red-600' :
            budgetData.percentageSpent > 80 ? 'text-amber-600' :
            'text-emerald-600'
          }`}>
            {formatCurrency(budgetData.totalSpent)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Remaining</p>
          <p className={`text-base font-semibold ${budgetData.totalRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(Math.abs(budgetData.totalRemaining))}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Top Categories
        </p>
        {topCategories.map((budget) => (
          <div key={budget.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                <span className={`text-sm font-semibold ${
                  budget.isExceeded ? 'text-red-600' :
                  budget.shouldAlert ? 'text-amber-600' :
                  'text-gray-600'
                }`}>
                  {budget.percentageSpent.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    budget.isExceeded ? 'bg-red-500' :
                    budget.shouldAlert ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentageSpent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/budget"
        className="block mt-4 text-center py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
      >
        Manage Budgets
      </Link>
    </div>
  );
}

import { MoreVertical, Edit2, Trash2, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';
import CategoryIcon from '../common/CategoryIcon';
import BudgetProgress from './BudgetProgress';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  // With rollover, last month's leftover (or overspending) is part of what can be spent
  const available = budget.available ?? budget.amount;
  const remaining = available - budget.spent;
  const carried = Number(budget.carriedOver || 0);
  const isExceeded = budget.isExceeded;
  const isWarning = budget.shouldAlert && !isExceeded;

  return (
    <div className="card relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <CategoryIcon category={budget.category} size="md" />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">{budget.category}</h3>
            {budget.notes && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{budget.notes}</p>
            )}
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={`Options for ${budget.category}`}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-surface rounded-xl shadow-xl ring-1 ring-gray-900/5 z-20">
                <button
                  onClick={() => { onEdit(budget); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(budget.id); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">{formatCurrency(budget.spent, false)}</span>
          <span className="text-sm text-gray-500">of {formatCurrency(available, false)}</span>
        </div>
        {budget.rollover && carried !== 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(budget.amount, false)} budget {carried > 0 ? '+' : '−'} {formatCurrency(Math.abs(carried), false)}{' '}
            {carried > 0 ? 'left from last month' : 'overspent last month'}
          </p>
        )}
      </div>

      <div className="mb-4">
        <BudgetProgress percentage={budget.percentageSpent} size="md" />
        <p className="text-xs text-gray-500 mt-1.5">{formatPercentage(budget.percentageSpent, 0)} spent</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          {isExceeded ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-xs font-medium text-red-600">
                {formatCurrency(Math.abs(remaining), false)} over
              </span>
            </>
          ) : isWarning ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-medium text-amber-600">
                {formatCurrency(remaining, false)} left
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="text-xs font-medium text-primary-600">
                {formatCurrency(remaining, false)} left
              </span>
            </>
          )}
        </div>

        {budget.alertThreshold && budget.alertThreshold !== 80 && (
          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            Alert at {budget.alertThreshold}%
          </div>
        )}
      </div>

    </div>
  );
}

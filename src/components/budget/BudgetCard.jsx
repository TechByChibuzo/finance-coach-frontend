import { MoreVertical, Edit2, Trash2, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';
import { CategoryIconSimple } from '../common/CategoryIcon';
import BudgetProgress from './BudgetProgress';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const remaining = budget.amount - budget.spent;
  const isExceeded = budget.isExceeded;
  const isWarning = budget.shouldAlert && !isExceeded;

  const borderColor = isExceeded ? 'border-red-200' : isWarning ? 'border-amber-200' : 'border-emerald-200';

  return (
    <div className={`card relative border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <CategoryIconSimple category={budget.category} size="lg" />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{budget.category}</h3>
            {budget.notes && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{budget.notes}</p>
            )}
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl ring-1 ring-gray-900/5 z-20">
                <button
                  onClick={() => { onEdit(budget); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Budget
                </button>
                <button
                  onClick={() => { onDelete(budget.id); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Budget
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(budget.spent)}</span>
          <span className="text-sm text-gray-400">/ {formatCurrency(budget.amount)}</span>
        </div>
      </div>

      <div className="mb-4">
        <BudgetProgress percentage={budget.percentageSpent} size="md" />
        <p className="text-xs text-gray-400 mt-1.5">{formatPercentage(budget.percentageSpent)} spent</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          {isExceeded ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-xs font-medium text-red-600">
                {formatCurrency(Math.abs(remaining))} over budget
              </span>
            </>
          ) : isWarning ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-medium text-amber-600">
                {formatCurrency(remaining)} remaining
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-medium text-emerald-600">
                {formatCurrency(remaining)} remaining
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

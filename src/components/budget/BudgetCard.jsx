// src/components/budget/BudgetCard.jsx - WITH PROFESSIONAL ICONS
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';
import { CategoryIconSimple } from '../common/CategoryIcon';
import BudgetProgress from './BudgetProgress';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const remaining = budget.amount - budget.spent;
  const isExceeded = budget.isExceeded;
  const isWarning = budget.shouldAlert && !isExceeded;

  // Border color based on status
  const borderColor = isExceeded
    ? 'border-red-200'
    : isWarning
    ? 'border-amber-200'
    : 'border-emerald-200';

  return (
    <div
      className={`
        card 
        relative 
        border-l-4 
        ${borderColor}
        hover:-translate-y-1 
        hover:shadow-lg 
        transition-all 
        duration-300
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* PROFESSIONAL ICON INSTEAD OF EMOJI */}
          <CategoryIconSimple category={budget.category} size="lg" />
          
          <div>
            <h3 className="text-lg font-bold text-gray-900">{budget.category}</h3>
            {budget.notes && (
              <p className="text-xs text-gray-500 mt-0.5">{budget.notes}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 fade-in">
                <button
                  onClick={() => {
                    onEdit(budget);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Budget
                </button>
                <button
                  onClick={() => {
                    onDelete(budget.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Budget
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(budget.spent)}
          </span>
          <span className="text-lg text-gray-500">
            / {formatCurrency(budget.amount)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <BudgetProgress percentage={budget.percentageSpent} size="md" />
        <div className="mt-2 text-sm text-gray-600">
          {formatPercentage(budget.percentageSpent)} spent
        </div>
      </div>

      {/* Status & Remaining */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {isExceeded ? (
            <>
              <span className="text-red-500">⚠️</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(Math.abs(remaining))} over budget
              </span>
            </>
          ) : isWarning ? (
            <>
              <span className="text-amber-500">⚡</span>
              <span className="text-sm font-medium text-amber-600">
                {formatCurrency(remaining)} remaining
              </span>
            </>
          ) : (
            <>
              <span className="text-emerald-500">✓</span>
              <span className="text-sm font-medium text-emerald-600">
                {formatCurrency(remaining)} remaining
              </span>
            </>
          )}
        </div>

        {/* Alert Threshold Badge */}
        {budget.alertThreshold && budget.alertThreshold !== 80 && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Alert at {budget.alertThreshold}%
          </div>
        )}
      </div>

      {/* Last Updated */}
      {budget.updatedAt && (
        <div className="text-xs text-gray-400 mt-3 text-center">
          Updated {formatRelativeTime(budget.updatedAt)}
        </div>
      )}
    </div>
  );
}

// Helper for relative time
function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'less than an hour ago';
  if (hours < 24) return `about ${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `about ${days} day${days > 1 ? 's' : ''} ago`;
}
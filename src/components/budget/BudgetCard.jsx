// src/components/budget/BudgetCard.jsx - POLISHED VERSION
import { MoreVertical, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import BudgetProgress from './BudgetProgress';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency, formatPercentage } from '../../utils/helpers';


export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  // Determine status and styling
  const getStatus = () => {
    if (budget.isExceeded) {
      return {
        icon: AlertCircle,
        color: 'red',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        iconColor: 'text-red-500',
        message: `${formatCurrency(Math.abs(budget.remaining))} over budget`,
      };
    } else if (budget.shouldAlert) {
      return {
        icon: AlertTriangle,
        color: 'amber',
        borderColor: 'border-amber-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-500',
        message: `${formatCurrency(budget.remaining)} remaining`,
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'emerald',
        borderColor: 'border-emerald-500',
        bgColor: 'bg-white',
        textColor: 'text-emerald-700',
        iconColor: 'text-emerald-500',
        message: `${formatCurrency(budget.remaining)} remaining`,
      };
    }
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Get category emoji
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Food & Dining': '🍔',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Travel': '✈️',
      'Personal Care': '💇',
      'Bills & Utilities': '💡',
      'Healthcare': '⚕️',
      'Home': '🏠',
      'Other': '📦',
    };
    return emojiMap[category] || '📊';
  };

  return (
    <div
      className={`
        card
        border-l-4 ${status.borderColor}
        ${budget.isExceeded ? 'animate-pulse-once' : ''}
        ${status.color === 'amber' || status.color === 'red' ? status.bgColor : ''}
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:-translate-y-1
        cursor-pointer
        relative
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl transition-transform duration-200 hover:scale-110">
            {getCategoryEmoji(budget.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
            {budget.notes && (
              <p className="text-sm text-gray-500 mt-0.5">{budget.notes}</p>
            )}
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors icon-hover"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px] fade-in">
                <button
                  onClick={() => {
                    onEdit(budget);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(budget.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 transition-colors">
            {formatCurrency(budget.spent)}
          </span>
          <span className="text-lg text-gray-500">/ {formatCurrency(budget.amount)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <BudgetProgress percentage={budget.percentageSpent} size="md" />
        <div className="mt-2 text-sm text-gray-600">
          {formatPercentage(budget.percentageSpent)} spent
        </div>
      </div>

      {/* Status Message */}
      <div className={`flex items-center gap-2 ${status.textColor} transition-colors`}>
        <StatusIcon className={`w-4 h-4 ${status.iconColor}`} />
        <span className="text-sm font-medium">{status.message}</span>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Updated {formatDistanceToNow(new Date(budget.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
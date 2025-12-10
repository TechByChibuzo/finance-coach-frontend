// src/components/budget/BudgetCard.jsx
import { MoreVertical, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import BudgetProgress from './BudgetProgress';
import { formatDistanceToNow } from 'date-fns';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
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
        message: `$${Math.abs(budget.remaining).toFixed(2)} over budget`,
      };
    } else if (budget.shouldAlert) {
      return {
        icon: AlertTriangle,
        color: 'amber',
        borderColor: 'border-amber-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-500',
        message: `$${budget.remaining.toFixed(2)} remaining`,
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'emerald',
        borderColor: 'border-emerald-500',
        bgColor: 'bg-white',
        textColor: 'text-emerald-700',
        iconColor: 'text-emerald-500',
        message: `$${budget.remaining.toFixed(2)} remaining`,
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
      className={`bg-white rounded-xl border-l-4 ${status.borderColor} ${
        budget.isExceeded ? 'animate-pulse-once' : ''
      } p-6 shadow-sm hover:shadow-md transition-all duration-200 relative ${
        status.color === 'amber' || status.color === 'red' ? status.bgColor : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getCategoryEmoji(budget.category)}</span>
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
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
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
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            ${budget.spent.toFixed(2)}
          </span>
          <span className="text-lg text-gray-500">/ ${budget.amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <BudgetProgress percentage={budget.percentageSpent} size="md" />
        <div className="mt-2 text-sm text-gray-600">
          {budget.percentageSpent.toFixed(1)}% spent
        </div>
      </div>

      {/* Status Message */}
      <div className={`flex items-center gap-2 ${status.textColor}`}>
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
};

export default BudgetCard;

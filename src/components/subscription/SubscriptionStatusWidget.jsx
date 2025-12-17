// src/components/subscription/SubscriptionStatusWidget.jsx
import { Crown, Sparkles, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentSubscription } from '../../hooks/useSubscription';
import Skeleton from '../common/Skeleton';
import { formatCurrency } from '../../utils/helpers';
import { format } from 'date-fns';

export default function SubscriptionStatusWidget() {
  const { data: subscription, isLoading, error } = useCurrentSubscription();

  if (isLoading) {
    return (
      <div className="card">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return null;
  }

  const { planName, planDisplayName, status, endDate, billingCycle } = subscription;

  // Plan configurations
  const planConfig = {
    FREE: {
      icon: Sparkles,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-900',
    },
    PREMIUM: {
      icon: Zap,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
    },
    PRO: {
      icon: Crown,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900',
    },
  };

  const config = planConfig[planName] || planConfig.FREE;
  const Icon = config.icon;

  // Status configurations
  const statusConfig = {
    ACTIVE: { text: 'Active', color: 'green' },
    CANCELLED: { text: 'Cancelled', color: 'red' },
    PAST_DUE: { text: 'Past Due', color: 'yellow' },
    TRIAL: { text: 'Trial', color: 'blue' },
  };

  const currentStatus = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <div className={`card border-l-4 ${config.borderColor} ${config.bgColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.iconColor} bg-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${config.textColor}`}>
              {planDisplayName}
            </h3>
            <p className="text-sm text-gray-600">Subscription Plan</p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${currentStatus.color === 'green' && 'bg-green-100 text-green-700'}
          ${currentStatus.color === 'red' && 'bg-red-100 text-red-700'}
          ${currentStatus.color === 'yellow' && 'bg-yellow-100 text-yellow-700'}
          ${currentStatus.color === 'blue' && 'bg-blue-100 text-blue-700'}
        `}>
          {currentStatus.text}
        </span>
      </div>

      {/* Details */}
      {planName !== 'FREE' && endDate && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Billing Cycle</span>
            <span className="font-medium text-gray-900 capitalize">
              {billingCycle?.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {status === 'CANCELLED' ? 'Ends On' : 'Next Billing'}
            </span>
            <span className="font-medium text-gray-900">
              {format(new Date(endDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      )}

      {/* Cancelled Warning */}
      {status === 'CANCELLED' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-1">Subscription Cancelled</p>
            <p>Your access will end on {format(new Date(endDate), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      )}

      {/* CTA Button */}
      {planName === 'FREE' ? (
        <Link
          to="/pricing"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-sm hover:shadow-md"
        >
          <span>Upgrade to Premium</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : planName === 'PREMIUM' ? (
        <Link
          to="/pricing"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade to Pro</span>
        </Link>
      ) : (
        <Link
          to="/settings/billing"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
        >
          <span>Manage Subscription</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* Feature List (for Free users) */}
      {planName === 'FREE' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Unlock with Premium:</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Unlimited budgets</li>
            <li>• Advanced AI insights</li>
            <li>• Priority support</li>
          </ul>
        </div>
      )}
    </div>
  );
}
// src/components/subscription/FeatureGate.jsx
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentSubscription } from '../../hooks/useSubscription';

/**
 * FeatureGate - Wraps content and shows upgrade prompt if user doesn't have access
 * 
 * Usage:
 * <FeatureGate feature="UNLIMITED_BUDGETS" requiredPlan="PREMIUM">
 *   <BudgetList />
 * </FeatureGate>
 */
export default function FeatureGate({ 
  children, 
  feature,
  requiredPlan = 'PREMIUM',
  fallback = null 
}) {
  const { data: subscription, isLoading } = useCurrentSubscription();

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Check if user has required plan
  const hasAccess = checkAccess(subscription?.planName, requiredPlan);

  if (hasAccess) {
    return children;
  }

  // Show upgrade prompt
  return fallback || <DefaultUpgradePrompt feature={feature} requiredPlan={requiredPlan} />;
}

/**
 * Default upgrade prompt when access is denied
 */
function DefaultUpgradePrompt({ feature, requiredPlan }) {
  const featureConfig = {
    UNLIMITED_BUDGETS: {
      title: 'Unlimited Budgets',
      description: 'Create unlimited budgets to track every category of spending.',
      icon: '📊',
    },
    ADVANCED_AI: {
      title: 'Advanced AI Insights',
      description: 'Get deep financial insights powered by advanced AI analysis.',
      icon: '🤖',
    },
    PRIORITY_SUPPORT: {
      title: 'Priority Support',
      description: 'Get help faster with priority customer support.',
      icon: '⚡',
    },
    EXPORT_REPORTS: {
      title: 'Export Reports',
      description: 'Export your financial data and reports to CSV and PDF.',
      icon: '📄',
    },
    FAMILY_SHARING: {
      title: 'Family Sharing',
      description: 'Share your subscription with up to 5 family members.',
      icon: '👨‍👩‍👧‍👦',
    },
  };

  const config = featureConfig[feature] || {
    title: 'Premium Feature',
    description: 'This feature requires a premium subscription.',
    icon: '⭐',
  };

  return (
    <div className="card bg-linear-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="text-center py-12">
        {/* Lock Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <Lock className="w-10 h-10 text-blue-600" />
        </div>

        {/* Feature Info */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            {config.icon} {config.title}
          </h3>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {config.description}
          </p>
        </div>

        {/* Upgrade CTA */}
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
        >
          <Crown className="w-6 h-6" />
          <span>Upgrade to {requiredPlan}</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Features List */}
        <div className="mt-8 pt-8 border-t border-blue-200">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            What you'll get with {requiredPlan}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
            {getPlanFeatures(requiredPlan).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-600">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Check if user has access based on plan hierarchy
 * FREE < PREMIUM < PRO
 */
function checkAccess(userPlan, requiredPlan) {
  const planHierarchy = {
    FREE: 0,
    PREMIUM: 1,
    PRO: 2,
  };

  const userLevel = planHierarchy[userPlan] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 1;

  return userLevel >= requiredLevel;
}

/**
 * Get feature list for a plan
 */
function getPlanFeatures(plan) {
  const features = {
    PREMIUM: [
      'Unlimited budgets',
      'Advanced AI insights',
      'Export reports',
      'Priority support',
    ],
    PRO: [
      'Everything in Premium',
      'Family sharing (5 members)',
      'Custom categories',
      'White-label reports',
    ],
  };

  return features[plan] || features.PREMIUM;
}
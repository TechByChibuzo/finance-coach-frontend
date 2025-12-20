import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Loader } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useSubscriptionPlans, useCurrentSubscription, useCreateCheckout } from '../hooks/useSubscription';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  
  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentSubscription();
  const createCheckout = useCreateCheckout();

  const handleUpgrade = (planId) => {
    createCheckout.mutate({ planId, billingCycle });
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading plans..." />
      </Layout>
    );
  }

  if (plansError) {
    return (
      <Layout>
        <ErrorMessage message="Failed to load subscription plans" type="error" />
      </Layout>
    );
  }

  const freePlan = plans?.find(p => p.name === 'FREE');
  const premiumPlan = plans?.find(p => p.name === 'PREMIUM');
  const proPlan = plans?.find(p => p.name === 'PRO');

  const currentPlanName = currentSubscription?.planName || 'FREE';
  const isYearly = billingCycle === 'YEARLY';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 py-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unlock powerful features to take control of your finances
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isYearly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                isYearly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - NO ANIMATION */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* FREE PLAN */}
          <div>
            {freePlan && (
              <PricingCard
                name="Free"
                displayName={freePlan.displayName}
                description={freePlan.description}
                price={0}
                icon={Sparkles}
                iconColor="text-gray-600"
                iconBg="bg-gray-100"
                features={parseFeatures(freePlan.features)}
                limits={parseLimits(freePlan.limits)}
                isCurrentPlan={currentPlanName === 'FREE'}
                onSelect={() => {}}
                ctaText="Current Plan"
                ctaDisabled={true}
              />
            )}
          </div>

          {/* PREMIUM PLAN */}
          <div>
            {premiumPlan && (
              <PricingCard
                name="Premium"
                displayName={premiumPlan.displayName}
                description={premiumPlan.description}
                price={isYearly ? premiumPlan.priceYearly : premiumPlan.priceMonthly}
                billingCycle={isYearly ? 'year' : 'month'}
                icon={Zap}
                iconColor="text-primary-600"
                iconBg="bg-primary-100"
                features={parseFeatures(premiumPlan.features)}
                limits={parseLimits(premiumPlan.limits)}
                isCurrentPlan={currentPlanName === 'PREMIUM'}
                isPopular={true}
                onSelect={() => handleUpgrade(premiumPlan.id)}
                ctaText={
                  currentPlanName === 'PREMIUM' ? 'Current Plan' :     // If on Premium
                  currentPlanName === 'PRO' ? 'Downgrade to Premium' : // If on Pro
                  'Upgrade to Premium'                                  // If on Free
                }
                loading={createCheckout.isPending}
              />
            )}
          </div>

          {/* PRO PLAN */}
          <div>
            {proPlan && (
              <PricingCard
                name="Pro"
                displayName={proPlan.displayName}
                description={proPlan.description}
                price={isYearly ? proPlan.priceYearly : proPlan.priceMonthly}
                billingCycle={isYearly ? 'year' : 'month'}
                icon={Crown}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
                features={parseFeatures(proPlan.features)}
                limits={parseLimits(proPlan.limits)}
                isCurrentPlan={currentPlanName === 'PRO'}
                onSelect={() => handleUpgrade(proPlan.id)}
                ctaText={currentPlanName === 'PRO' ? 'Current Plan' : 'Upgrade to Pro'}
                ctaDisabled={currentPlanName === 'PRO'}
                loading={createCheckout.isPending}
              />
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time from your settings. Your access continues until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express."
            />
            <FAQItem
              question="Can I switch plans?"
              answer="Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. We use bank-level encryption and never store your bank credentials. All data is encrypted in transit and at rest."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  displayName,
  description,
  price,
  billingCycle,
  icon: Icon,
  iconColor,
  iconBg,
  features,
  limits,
  isCurrentPlan,
  isPopular,
  onSelect,
  ctaText,
  ctaDisabled,
  loading,
}) {
  return (
    <div
      className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isPopular ? 'ring-2 ring-primary-600 scale-105' : ''
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            ⭐ Most Popular
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4 transition-transform hover:scale-110`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>

      {/* Name & Description */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-gray-900">${price}</span>
          {billingCycle && (
            <span className="text-gray-600 ml-2">/{billingCycle}</span>
          )}
        </div>
        {name === 'Free' && (
          <p className="text-sm text-gray-500 mt-1">Forever free</p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        disabled={ctaDisabled || loading}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 mb-6 transform hover:-translate-y-1 hover:shadow-lg ${
          isPopular
            ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300'
            : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300'
        } disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            Processing...
          </span>
        ) : (
          ctaText
        )}
      </button>

      {/* Features */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">Features:</p>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Limits */}
      {limits && limits.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-3">Limits:</p>
          {limits.map((limit, index) => (
            <div key={index} className="flex items-start gap-2 mb-2">
              <span className="text-sm text-gray-600">{limit}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            Current Plan
          </span>
        </div>
      )}
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className="text-gray-400 text-xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function parseFeatures(featuresJson) {
  try {
    const features = JSON.parse(featuresJson);
    return Array.isArray(features) ? features : [];
  } catch {
    return [];
  }
}

function parseLimits(limitsJson) {
  try {
    const limits = JSON.parse(limitsJson);
    if (!limits || Object.keys(limits).length === 0) return [];
    
    return Object.entries(limits).map(([key, value]) => {
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${formattedKey}: ${value}`;
    });
  } catch {
    return [];
  }
}
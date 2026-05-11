import { useState } from 'react';
import { Check, Star, Sparkles, Zap, Crown, Loader, ChevronDown } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useSubscriptionPlans, useCurrentSubscription, useCreateCheckout } from '../hooks/useSubscription';
import Skeleton from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';

function PricingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-12 w-40" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="space-y-3 pt-2">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');

  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentSubscription();
  const createCheckout = useCreateCheckout();

  const handleUpgrade = (planId) => {
    createCheckout.mutate({ planId, billingCycle });
  };

  const isLoading = plansLoading || subscriptionLoading;
  const isYearly = billingCycle === 'YEARLY';

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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-base text-gray-500 mb-8">
            Unlock powerful features to take control of your finances
          </p>

          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-6">
          {isLoading ? (
            <>
              <PricingCardSkeleton />
              <PricingCardSkeleton />
              <PricingCardSkeleton />
            </>
          ) : (
            <>
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
                    currentPlanName === 'PREMIUM' ? 'Current Plan' :
                    currentPlanName === 'PRO' ? 'Downgrade to Premium' :
                    'Upgrade to Premium'
                  }
                  loading={createCheckout.isPending}
                />
              )}
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
            </>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
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
    <div className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${
      isPopular ? 'ring-2 ring-primary-600 scale-105' : ''
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            Most Popular
          </span>
        </div>
      )}

      <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          {billingCycle && (
            <span className="text-sm text-gray-400">/{billingCycle}</span>
          )}
        </div>
        {name === 'Free' && (
          <p className="text-xs text-gray-400 mt-1">Forever free</p>
        )}
      </div>

      <button
        onClick={onSelect}
        disabled={ctaDisabled || loading}
        className={`w-full py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors mb-6 ${
          isPopular
            ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300'
            : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : (
          ctaText
        )}
      </button>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Features</p>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      {limits && limits.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Limits</p>
          {limits.map((limit, index) => (
            <p key={index} className="text-sm text-gray-500 mb-1.5">{limit}</p>
          ))}
        </div>
      )}

      {isCurrentPlan && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
            <Check className="w-3.5 h-3.5" />
            Current Plan
          </span>
        </div>
      )}
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{question}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 border-t border-gray-50">
          <p className="text-sm text-gray-500 pt-3">{answer}</p>
        </div>
      )}
    </div>
  );
}

function parseFeatures(featuresJson) {
  if (Array.isArray(featuresJson)) return featuresJson;
  try {
    const features = JSON.parse(featuresJson);
    return Array.isArray(features) ? features : [];
  } catch {
    return [];
  }
}

function parseLimits(limitsJson) {
  if (limitsJson && typeof limitsJson === 'object' && !Array.isArray(limitsJson)) {
    return Object.entries(limitsJson).map(([key, value]) => {
      const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `${formattedKey}: ${value}`;
    });
  }
  try {
    const limits = JSON.parse(limitsJson);
    if (!limits || Object.keys(limits).length === 0) return [];
    return Object.entries(limits).map(([key, value]) => {
      const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `${formattedKey}: ${value}`;
    });
  } catch {
    return [];
  }
}

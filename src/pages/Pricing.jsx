import { useState } from 'react';
import { Check, Star, Sparkles, Zap, Crown, Loader, ChevronDown } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useSubscriptionPlans, useCurrentSubscription, useCreateCheckout } from '../hooks/useSubscription';
import Skeleton from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';

function PricingCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl shadow-xl p-8 space-y-4">
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

// What each plan includes, matching the limits the backend enforces (SubscriptionService#getFeatureLimit)
const PLAN_COPY = {
  FREE: {
    description: 'Track spending and try the coach.',
    features: ['1 linked bank', '3 budgets a month', '5 coach questions a month', 'Spending insights and net worth'],
  },
  PREMIUM: {
    description: 'Everything most people need, without limits on budgets or coaching.',
    features: ['Up to 5 linked banks', 'Unlimited budgets', 'Unlimited coach questions', 'Export transactions to CSV'],
  },
  PRO: {
    description: 'For households with accounts at many banks.',
    features: ['Unlimited linked banks', 'Everything in Premium'],
  },
};

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
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Plans
          </h1>
          <p className="text-base text-gray-500 mb-8">
            Start free. Upgrade when you want more banks, budgets or coaching.
          </p>

          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? 'bg-surface text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly ? 'bg-surface text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
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
                  description={PLAN_COPY.FREE.description}
                  price={0}
                  icon={Sparkles}
                  iconColor="text-gray-600"
                  iconBg="bg-gray-100"
                  features={PLAN_COPY.FREE.features}
                  limits={parseLimits(freePlan.limits)}
                  isCurrentPlan={currentPlanName === 'FREE'}
                  onSelect={() => {}}
                  ctaText="Current plan"
                  ctaDisabled={true}
                />
              )}
              {premiumPlan && (
                <PricingCard
                  name="Premium"
                  displayName={premiumPlan.displayName}
                  description={PLAN_COPY.PREMIUM.description}
                  price={isYearly ? premiumPlan.priceYearly : premiumPlan.priceMonthly}
                  billingCycle={isYearly ? 'year' : 'month'}
                  icon={Zap}
                  iconColor="text-primary-600"
                  iconBg="bg-primary-100"
                  features={PLAN_COPY.PREMIUM.features}
                  limits={parseLimits(premiumPlan.limits)}
                  isCurrentPlan={currentPlanName === 'PREMIUM'}
                  isPopular={true}
                  onSelect={() => handleUpgrade(premiumPlan.id)}
                  ctaText={
                    currentPlanName === 'PREMIUM' ? 'Current plan' :
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
                  description={PLAN_COPY.PRO.description}
                  price={isYearly ? proPlan.priceYearly : proPlan.priceMonthly}
                  billingCycle={isYearly ? 'year' : 'month'}
                  icon={Crown}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  features={PLAN_COPY.PRO.features}
                  limits={parseLimits(proPlan.limits)}
                  isCurrentPlan={currentPlanName === 'PRO'}
                  onSelect={() => handleUpgrade(proPlan.id)}
                  ctaText={currentPlanName === 'PRO' ? 'Current plan' : 'Upgrade to Pro'}
                  ctaDisabled={currentPlanName === 'PRO'}
                  loading={createCheckout.isPending}
                />
              )}
            </>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 text-center mb-8">Questions</h2>
          <div className="space-y-3">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, from Settings > Billing. You keep your plan's features until the end of the billing period, and you won't be charged again."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express."
            />
            <FAQItem
              question="Can I switch plans?"
              answer="Yes. Upgrading takes effect as soon as payment goes through, and your previous plan is cancelled. To go back to Free, cancel your plan; you keep its features until the end of the billing period."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Banks connect through Plaid, so Finance Coach never sees your bank password. Bank access tokens are encrypted, data is encrypted in transit and at rest, and you can delete your account and all of its data from Settings at any time."
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
  isPopular,
  onSelect,
  ctaText,
  ctaDisabled,
  loading,
}) {
  return (
    <div className={`relative bg-surface rounded-2xl p-8 ${
      isPopular ? 'ring-2 ring-primary-600 shadow-lg' : 'border border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            Most popular
          </span>
        </div>
      )}

      <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">{displayName.replace(/\s+plan$/i, '')}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-gray-900 tabular-nums">${price}</span>
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
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-surface text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Opening checkout…
          </span>
        ) : (
          ctaText
        )}
      </button>

      <div className="space-y-2.5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
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

    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-surface rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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

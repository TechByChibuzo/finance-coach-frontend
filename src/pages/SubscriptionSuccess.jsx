import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, Crown, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { subscriptionAPI } from '../services/api';

const MAX_CHECKS = 15; // ~30 seconds at one check every 2 seconds

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Stripe confirms the payment to the backend by webhook, which can arrive a few seconds
  // after this page loads: keep checking until the new plan shows up
  const { data: subscription } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => (await subscriptionAPI.getCurrentSubscription()).data,
    staleTime: 0,
    refetchInterval: (query) =>
      (query.state.data?.planName ?? 'FREE') === 'FREE' && query.state.dataUpdateCount < MAX_CHECKS
        ? 2000
        : false,
  });

  const planName = subscription?.planName;
  const activated = planName && planName !== 'FREE';
  const [gaveUp, setGaveUp] = useState(false);
  const planLabel = activated ? planName.charAt(0) + planName.slice(1).toLowerCase() : 'Premium';

  useEffect(() => {
    if (activated) return;
    const timeout = setTimeout(() => setGaveUp(true), MAX_CHECKS * 2000);
    return () => clearTimeout(timeout);
  }, [activated]);

  useEffect(() => {
    if (!activated) return;

    // Countdown timer, once the plan is active
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activated, navigate]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-surface rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {activated ? `Welcome to ${planLabel}!` : 'Payment received'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {activated
                ? 'Your subscription has been activated successfully'
                : gaveUp
                  ? 'Your plan is still being activated. It will update within a few minutes; you can continue in the meantime.'
                  : 'Activating your subscription...'}
            </p>

            {/* Features Unlocked */}
            <div className="bg-linear-to-br from-primary-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">
                  {planLabel} Features Unlocked:
                </h3>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span>Unlimited budgets</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span>Advanced AI insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span>Export reports</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>

            {/* Redirect Message */}
            {(activated || !gaveUp) && (
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                <Loader className="w-4 h-4 animate-spin" />
                <p className="text-sm">
                  {activated ? `Redirecting to dashboard in ${countdown} seconds...` : 'Confirming your payment...'}
                </p>
              </div>
            )}

            {/* Manual Navigation */}
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full"
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, Crown, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useQueryClient } from '@tanstack/react-query';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Invalidate subscription queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
    queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });

    // Countdown timer
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
  }, [navigate, queryClient]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Premium! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your subscription has been activated successfully
            </p>

            {/* Features Unlocked */}
            <div className="bg-linear-to-br from-primary-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">
                  Premium Features Unlocked:
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

            {/* Session ID (for debugging) */}
            {sessionId && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Session ID:</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {sessionId}
                </p>
              </div>
            )}

            {/* Redirect Message */}
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <Loader className="w-4 h-4 animate-spin" />
              <p className="text-sm">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            </div>

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
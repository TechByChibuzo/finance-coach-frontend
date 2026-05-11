import { useState } from 'react';
import { CreditCard, AlertCircle, Crown, Calendar, DollarSign, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCurrentSubscription, useCancelSubscription } from '../hooks/useSubscription';
import Skeleton from '../components/common/Skeleton';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/helpers';

const PLAN_CONFIG = {
  PRO:     { Icon: Crown,      bg: 'bg-purple-100', color: 'text-purple-600' },
  PREMIUM: { Icon: Zap,        bg: 'bg-primary-100', color: 'text-primary-600' },
  FREE:    { Icon: CreditCard, bg: 'bg-gray-100',   color: 'text-gray-500' },
};

export default function BillingSettings() {
  const { data: subscription, isLoading } = useCurrentSubscription();
  const cancelSubscription = useCancelSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="card space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  const { planName, planDisplayName, status, startDate, endDate, billingCycle } = subscription || {};
  const planConfig = PLAN_CONFIG[planName] || PLAN_CONFIG.FREE;
  const { Icon: PlanIcon } = planConfig;

  const handleCancelSubscription = () => {
    cancelSubscription.mutate();
    setShowCancelModal(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your subscription and payment details</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">Current Plan</h2>
            {status === 'ACTIVE' && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                Active
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${planConfig.bg}`}>
                  <PlanIcon className={`w-5 h-5 ${planConfig.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{planDisplayName}</h3>
                  {planName !== 'FREE' && billingCycle && (
                    <p className="text-xs text-gray-400">
                      {billingCycle === 'MONTHLY' ? 'Billed monthly' : 'Billed yearly'}
                    </p>
                  )}
                </div>
              </div>
              {planName !== 'FREE' && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(billingCycle === 'MONTHLY' ? 9.99 : 99.99)}
                  </p>
                  <p className="text-xs text-gray-400">
                    per {billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </p>
                </div>
              )}
            </div>

            {planName !== 'FREE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Started</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {startDate ? format(new Date(startDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                  <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">
                      {status === 'CANCELLED' ? 'Ends' : 'Next Billing'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'CANCELLED' && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold mb-0.5">Subscription Cancelled</p>
                  <p className="text-xs text-red-500">
                    You'll lose access to {planDisplayName} features on{' '}
                    {endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'your billing date'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {planName === 'FREE' ? (
                <Link to="/pricing" className="flex-1 btn-primary text-center">
                  Upgrade Plan
                </Link>
              ) : planName === 'PREMIUM' ? (
                <>
                  <Link to="/pricing" className="flex-1 btn-secondary text-center">
                    Upgrade to Pro
                  </Link>
                  {status !== 'CANCELLED' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex-1 btn-secondary text-red-600 hover:bg-red-50 text-center"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </>
              ) : (
                status !== 'CANCELLED' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 btn-secondary text-red-600 hover:bg-red-50 text-center"
                  >
                    Cancel Subscription
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="p-4 border border-gray-100 rounded-xl text-center py-8">
            <p className="text-sm text-gray-400">Payment methods are managed securely through Stripe.</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Billing History</h2>
          <div className="p-4 border border-gray-100 rounded-xl text-center py-8">
            <p className="text-sm text-gray-400">No billing history available yet.</p>
          </div>
        </div>

        {showCancelModal && (
          <CancelSubscriptionModal
            planName={planDisplayName}
            onCancel={handleCancelSubscription}
            onClose={() => setShowCancelModal(false)}
            loading={cancelSubscription.isPending}
          />
        )}
      </div>
    </Layout>
  );
}

function CancelSubscriptionModal({ planName, onCancel, onClose, loading }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Cancel {planName}?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            You'll lose access to all premium features at the end of your billing period.
            You can always re-subscribe later.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="flex-1 btn-secondary">
              Keep Subscription
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

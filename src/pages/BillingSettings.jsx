// src/pages/BillingSettings.jsx
import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Crown, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCurrentSubscription, useCancelSubscription } from '../hooks/useSubscription';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/helpers';

export default function BillingSettings() {
  const { data: subscription, isLoading } = useCurrentSubscription();
  const cancelSubscription = useCancelSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading billing information..." />
      </Layout>
    );
  }

  const { planName, planDisplayName, status, startDate, endDate, billingCycle } = subscription || {};

  const handleCancelSubscription = () => {
    cancelSubscription.mutate();
    setShowCancelModal(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and payment details</p>
        </div>

        {/* Current Plan Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
            {status === 'ACTIVE' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Plan Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  planName === 'PRO' ? 'bg-purple-100' :
                  planName === 'PREMIUM' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {planName === 'PRO' ? <Crown className="w-6 h-6 text-purple-600" /> :
                   planName === 'PREMIUM' ? <CreditCard className="w-6 h-6 text-blue-600" /> :
                   <CreditCard className="w-6 h-6 text-gray-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{planDisplayName}</h3>
                  {planName !== 'FREE' && billingCycle && (
                    <p className="text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600">
                    per {billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </p>
                </div>
              )}
            </div>

            {/* Subscription Details */}
            {planName !== 'FREE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Started</p>
                    <p className="font-semibold text-gray-900">
                      {startDate ? format(new Date(startDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {status === 'CANCELLED' ? 'Ends' : 'Next Billing'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Warning */}
            {status === 'CANCELLED' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold mb-1">Subscription Cancelled</p>
                  <p>
                    You'll lose access to {planDisplayName} features on{' '}
                    {endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'your billing date'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {planName === 'FREE' ? (
                <Link
                  to="/pricing"
                  className="flex-1 btn-primary text-center"
                >
                  Upgrade Plan
                </Link>
              ) : planName === 'PREMIUM' ? (
                <>
                  <Link
                    to="/pricing"
                    className="flex-1 btn-secondary text-center"
                  >
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

        {/* Payment Method */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-center py-8">
              Payment methods are managed securely through Stripe.
            </p>
          </div>
        </div>

        {/* Billing History */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-center py-8">
              No billing history available yet.
            </p>
          </div>
        </div>

        {/* Cancel Modal */}
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

// Cancel Subscription Modal
function CancelSubscriptionModal({ planName, onCancel, onClose, loading }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            {/* Warning Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Cancel {planName}?
            </h3>
            <p className="text-gray-600 mb-6">
              You'll lose access to all premium features at the end of your billing period.
              You can always re-subscribe later.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Keep Subscription
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
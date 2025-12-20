import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Cancel Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Cancel Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-yellow-600" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Subscription Cancelled
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              No worries! You can upgrade anytime.
            </p>

            {/* Benefits Reminder */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                You missed out on:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Unlimited budgets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Advanced AI insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
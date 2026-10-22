import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import PlaidLink from '../components/plaid/PlaidLink';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Landmark, CreditCard, Home, TrendingUp, Wallet, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, plaidAPI, userAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import Skeleton from '../components/common/Skeleton';

const ACCOUNT_ICONS = {
  depository: { Icon: Landmark,   bg: 'bg-blue-50',    color: 'text-blue-600' },
  credit:     { Icon: CreditCard, bg: 'bg-red-50',     color: 'text-red-500' },
  loan:       { Icon: Home,       bg: 'bg-amber-50',   color: 'text-amber-600' },
  investment: { Icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
};

const TABS = [
  { id: 'profile',       name: 'Profile' },
  { id: 'banks',         name: 'Bank accounts' },
  { id: 'billing',       name: 'Billing' },
  { id: 'security',      name: 'Security' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [resetLinkState, setResetLinkState] = useState('idle'); // idle | sending | sent

  // Changing the password goes through the emailed reset link: it proves access to the
  // account's email, and the backend signs out every other session once it's used
  const sendPasswordResetLink = async () => {
    setResetLinkState('sending');
    try {
      await authAPI.forgotPassword(user.email);
      setResetLinkState('sent');
    } catch (error) {
      setResetLinkState('idle');
      toast.error(error.response?.status === 429
        ? 'Too many reset requests. Wait a while, then try again.'
        : "Couldn't send the link. Try again in a moment.");
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await userAPI.deleteAccount();
      logout();
      toast.success('Your account and data have been deleted');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete your account. Please try again.');
      setDeleting(false);
    }
  };

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await plaidAPI.getAccounts();
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Settings</h1>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6 sm:gap-8 overflow-x-auto" aria-label="Settings sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'banks') loadAccounts();
                }}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`py-3.5 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="card">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <button onClick={logout} className="btn-secondary mt-2">
                Sign Out
              </button>
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Connected Bank Accounts</h2>
                <PlaidLink onSuccess={loadAccounts} />
              </div>

              {loadingAccounts ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account) => {
                    const typeKey = account.accountType?.toLowerCase();
                    const iconConfig = ACCOUNT_ICONS[typeKey] || { Icon: Wallet, bg: 'bg-gray-100', color: 'text-gray-500' };
                    const { Icon } = iconConfig;
                    return (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${iconConfig.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{account.accountName}</p>
                            <p className="text-xs text-gray-400">{account.institutionName}</p>
                            <p className="text-xs text-gray-400 capitalize">{account.accountType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(account.currentBalance)}
                          </p>
                          {account.availableBalance !== null && (
                            <p className="text-xs text-gray-400">
                              Avail: {formatCurrency(account.availableBalance)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">No bank accounts connected yet</p>
                  <p className="text-xs text-gray-400">
                    Connect your bank account to start tracking your finances
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Subscription & Billing</h2>
              <p className="text-sm text-gray-500">
                Manage your subscription, payment method, and billing history
              </p>
              <Link to="/settings/billing" className="btn-primary inline-flex items-center gap-2">
                <span>Manage Billing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="divide-y divide-gray-100">
              <section className="pb-6" aria-labelledby="password-heading">
                <h2 id="password-heading" className="text-base font-bold text-gray-900">Password</h2>
                <p className="mt-1 text-sm text-gray-600 max-w-xl">
                  We'll email a link to <span className="font-semibold text-gray-900">{user?.email}</span> where
                  you can choose a new password. Once it's changed, you're signed out on all your devices, this one included.
                </p>
                {resetLinkState === 'sent' ? (
                  <p role="status" className="mt-4 text-sm font-medium text-green-700">
                    Link sent. It works once and expires in an hour.
                  </p>
                ) : (
                  <button
                    onClick={sendPasswordResetLink}
                    disabled={resetLinkState === 'sending'}
                    className="btn-secondary mt-4 text-sm"
                  >
                    {resetLinkState === 'sending' ? 'Sending…' : 'Email me a reset link'}
                  </button>
                )}
              </section>

              <section className="pt-6" aria-labelledby="delete-heading">
                <h2 id="delete-heading" className="text-base font-bold text-red-700">Delete account</h2>
                <p className="mt-1 text-sm text-gray-600 max-w-xl">
                  Permanently deletes your account. Any subscription is cancelled, your banks are disconnected,
                  and all of your transactions, budgets and coach history are erased. This can't be undone.
                </p>
                <label htmlFor="delete-confirm" className="mt-4 block text-sm text-gray-600">
                  Type <span className="font-semibold text-gray-900">DELETE</span> to confirm
                </label>
                <div className="mt-1.5 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    id="delete-confirm"
                    type="text"
                    autoComplete="off"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="block w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                  <button
                    onClick={deleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || deleting}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting…' : 'Delete my account'}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

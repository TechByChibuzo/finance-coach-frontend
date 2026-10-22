import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import PlaidLink from '../components/plaid/PlaidLink';
import ReconnectBank from '../components/plaid/ReconnectBank';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Landmark, CreditCard, Home, TrendingUp, Wallet, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, plaidAPI, userAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import Skeleton from '../components/common/Skeleton';
import BankLogo from '../components/common/BankLogo';
import CategoryRules from '../components/settings/CategoryRules';
import WeeklyEmailToggle from '../components/settings/WeeklyEmailToggle';
import { getThemePreference, setThemePreference } from '../utils/theme';
import Illustration from '../components/common/Illustration';

const ACCOUNT_ICONS = {
  depository: { Icon: Landmark,   bg: 'bg-blue-50',    color: 'text-blue-600' },
  credit:     { Icon: CreditCard, bg: 'bg-red-50',     color: 'text-red-500' },
  loan:       { Icon: Home,       bg: 'bg-amber-50',   color: 'text-amber-600' },
  investment: { Icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
};

const TABS = [
  { id: 'profile',       name: 'Profile' },
  { id: 'banks',         name: 'Bank accounts' },
  { id: 'categories',    name: 'Categories' },
  { id: 'billing',       name: 'Billing' },
  { id: 'security',      name: 'Security' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  // The tab lives in the URL (/settings?tab=banks) so links can open it and refresh keeps it
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'profile';
  const setActiveTab = (id) => setSearchParams(id === 'profile' ? {} : { tab: id }, { replace: true });
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [resetLinkState, setResetLinkState] = useState('idle'); // idle | sending | sent
  const [theme, setTheme] = useState(getThemePreference);

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

  const disconnect = async (account) => {
    const sameBank = accounts.filter((a) => a.institutionName === account.institutionName).length;
    const ok = window.confirm(
      `Disconnect ${account.accountName}${account.institutionName ? ` (${account.institutionName})` : ''}?\n\n`
      + "It stops syncing. Transactions already imported stay in Finance Coach."
      + (sameBank <= 1 ? ' This is the last account from this bank, so the bank connection is removed too.' : ''));
    if (!ok) return;
    try {
      await plaidAPI.disconnect(account.id);
      toast.success(`${account.accountName} disconnected`);
      loadAccounts();
    } catch {
      toast.error("Couldn't disconnect the account. Try again.");
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
  useEffect(() => {
    if (activeTab === 'banks') loadAccounts();
  }, [activeTab]);


  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Settings</h1>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6 sm:gap-8 overflow-x-auto" aria-label="Settings sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
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
              <h2 className="text-base font-bold text-gray-900">Profile</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-base font-semibold text-white" aria-hidden>
                  {(user?.fullName || user?.email || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">{user?.fullName}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <fieldset className="pt-2">
                <legend className="text-sm font-medium text-gray-600 mb-1.5">Appearance</legend>
                <div className="inline-flex rounded-xl border border-gray-200 p-1">
                  {[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([value, label]) => (
                    <label key={value}
                      className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-semibold ${theme === value ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-800'}`}>
                      <input type="radio" name="theme" value={value} checked={theme === value} className="sr-only"
                        onChange={() => { setTheme(value); setThemePreference(value); }} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="pt-2">
                <legend className="text-sm font-medium text-gray-600 mb-1.5">Email</legend>
                <WeeklyEmailToggle />
              </fieldset>
              <button onClick={logout} className="btn-secondary mt-2">
                Sign out
              </button>
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Connected accounts</h2>
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
                          <BankLogo
                            logo={account.institutionLogo}
                            color={account.institutionColor}
                            name={account.institutionName}
                            fallback={(
                              <div className={`w-10 h-10 ${iconConfig.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                              </div>
                            )}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{account.accountName}</p>
                            <p className="text-xs text-gray-400">{account.institutionName}</p>
                            <p className="text-xs text-gray-400">
                              <span className="capitalize">{account.accountType}</span>
                              {account.mask && <span className="tabular-nums"> ••{account.mask}</span>}
                            </p>
                            {account.needsReconnect && (
                              <div className="mt-2 flex items-center gap-3">
                                <span className="text-xs font-semibold text-amber-600">Sign-in needed</span>
                                <ReconnectBank
                                  itemId={account.itemId}
                                  institutionName={account.institutionName}
                                  onDone={loadAccounts}
                                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(account.currentBalance)}
                          </p>
                          <button
                            onClick={() => disconnect(account)}
                            className="mt-1 text-xs font-semibold text-gray-500 hover:text-red-600"
                            aria-label={`Disconnect ${account.accountName}`}
                          >
                            Disconnect
                          </button>
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
                  <Illustration name="banks" className="mx-auto mb-4 h-28 w-40" />
                  <p className="text-base font-semibold text-gray-900 mb-1">No banks connected yet</p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Connect a bank and your accounts and transactions come in on their own.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && <CategoryRules />}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Plan and billing</h2>
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

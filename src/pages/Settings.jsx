import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import PlaidLink from '../components/plaid/PlaidLink';
import { plaidAPI } from '../services/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'banks', name: 'Bank Accounts' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'security', name: 'Security' },
  ];

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

  const handleBankConnected = () => {
    loadAccounts();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'banks') loadAccounts();
                }}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary mt-4"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Connected Bank Accounts</h2>
                <PlaidLink onSuccess={handleBankConnected} />
              </div>

              {loadingAccounts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-sky-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🏦</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {account.name || 'Bank Account'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {account.officialName || account.subtype || 'Account'}
                          </p>
                          <p className="text-xs text-gray-400">
                            ****{account.mask || '0000'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${(account.balances?.current || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {account.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🏦</span>
                  <p className="text-gray-500 mb-4">No bank accounts connected yet</p>
                  <p className="text-sm text-gray-400">
                    Connect your bank account to start tracking your finances
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
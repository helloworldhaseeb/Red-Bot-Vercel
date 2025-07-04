'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { apiService, Account } from '@/lib/api';
import { 
  Plus, 
  Trash2, 
  Users, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountWithStatus extends Account {
  status: boolean;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [newAccount, setNewAccount] = useState<Account>({
    client_id: '',
    client_secret: '',
    username: '',
    password: '',
    api_key: ''
  });

  const fetchAccounts = async () => {
    try {
      const response = await apiService.getAccounts();
      setAccounts(response.accounts.map((acc: Account, index: number) => ({
        ...acc,
        status: response.status[index] || false
      })));
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      await apiService.addAccount(newAccount);
      toast.success('Account added successfully');
      setShowAddForm(false);
      setNewAccount({
        client_id: '',
        client_secret: '',
        username: '',
        password: '',
        api_key: ''
      });
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to add account:', error);
      toast.error('Failed to add account');
    }
  };

  const handleRemoveAccount = async (username: string) => {
    if (!confirm(`Are you sure you want to remove account "${username}"?`)) {
      return;
    }

    try {
      await apiService.removeAccount(username);
      toast.success('Account removed successfully');
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to remove account:', error);
      toast.error('Failed to remove account');
    }
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your Reddit accounts and API keys
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Account</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client ID</label>
                  <input
                    type="text"
                    value={newAccount.client_id}
                    onChange={(e) => setNewAccount({ ...newAccount, client_id: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Your Reddit app client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                  <input
                    type="password"
                    value={newAccount.client_secret}
                    onChange={(e) => setNewAccount({ ...newAccount, client_secret: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Your Reddit app client secret"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Your Reddit username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Your Reddit password"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Gemini API Key</label>
                  <input
                    type="password"
                    value={newAccount.api_key}
                    onChange={(e) => setNewAccount({ ...newAccount, api_key: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Your Gemini API key"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAccount}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Reddit Accounts ({accounts.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No accounts configured</p>
                <p className="text-sm">Add your first Reddit account to get started</p>
              </div>
            ) : (
              accounts.map((account, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {account.status ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {account.username}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Status: {account.status ? 'Authenticated' : 'Authentication Failed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePasswordVisibility(account.username)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[account.username] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveAccount(account.username)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {showPasswords[account.username] && (
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Client ID</label>
                        <p className="text-sm text-gray-900 font-mono">{account.client_id}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Username</label>
                        <p className="text-sm text-gray-900">{account.username}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Password</label>
                        <p className="text-sm text-gray-900 font-mono">••••••••</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">API Key</label>
                        <p className="text-sm text-gray-900 font-mono">
                          {account.api_key ? `${account.api_key.substring(0, 8)}...` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                How to get Reddit API credentials
              </p>
              <ul className="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Go to <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="underline">Reddit App Preferences</a></li>
                <li>Click &quot;Create App&quot; or &quot;Create Another App&quot;</li>
                <li>Select &quot;script&quot; as the app type</li>
                <li>Use &quot;http://localhost:8080&quot; as the redirect URI</li>
                <li>Copy the Client ID and Client Secret</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
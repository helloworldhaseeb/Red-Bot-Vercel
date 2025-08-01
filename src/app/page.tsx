'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useMonitoring } from '@/lib/hooks';
import { 
  Activity, 
  MessageSquare, 
  AlertTriangle, 
  Clock,
  Play,
  Square,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const {
    stats,
    config,
    loading,
    // refreshing,
    cooldownActive,
    cooldownTime,
    configLoading,
    initialize,
    // refreshStats,
    startMonitoring,
    stopMonitoring,
    updateConfig,
  } = useMonitoring();

  const handleStartMonitoring = async () => {
    const result = await startMonitoring();
    if (result.success) {
      toast.success('Monitoring started');
    } else {
      toast.error(result.error || 'Failed to start monitoring');
    }
  };

  const handleStopMonitoring = async () => {
    const result = await stopMonitoring();
    if (result.success) {
      toast.success('Monitoring stopped');
    } else {
      toast.error(result.error || 'Failed to stop monitoring');
    }
  };

  // const handleRefreshStats = async () => {
  //   const result = await refreshStats();
  //   if (!result.success) {
  //     toast.error(result.error || 'Failed to refresh stats');
  //   }
  // };

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
        </div>
      </Layout>
    );
  }

  const isActive = stats?.status === 'active';
  const isStarting = stats?.status === 'starting';
  const isStopping = stats?.status === 'stopping';
  
  const getStatusDisplay = () => {
    switch (stats?.status) {
      case 'active':
        return { text: 'Active', color: 'bg-green-400', textColor: 'text-green-600' };
      case 'starting':
        return { text: 'Starting...', color: 'bg-yellow-400', textColor: 'text-yellow-600' };
      case 'stopping':
        return { text: 'Stopping...', color: 'bg-orange-400', textColor: 'text-orange-600' };
      case 'error':
        return { text: 'Error', color: 'bg-red-400', textColor: 'text-red-600' };
      case 'idle':
      default:
        return { text: 'Idle', color: 'bg-gray-400', textColor: 'text-gray-600' };
    }
  };
  
  const statusDisplay = getStatusDisplay();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard & Monitoring</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor your Reddit bot activity and configure monitoring settings
            </p>
          </div>
          {/* <button
            onClick={handleRefreshStats}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button> */}
        </div>

        {/* Status Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-3 w-3 rounded-full ${statusDisplay.color}`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${statusDisplay.textColor}`}>
                    Status: {statusDisplay.text}
                  </p>
                  {stats?.subreddit && (
                    <p className="text-sm text-gray-500">
                      Monitoring: r/{stats.subreddit} ({stats.test_mode ? 'Test Mode' : 'Live Mode'})
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                {(isActive || isStarting) ? (
                  <button
                    onClick={handleStopMonitoring}
                    disabled={configLoading || cooldownActive || isStarting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {cooldownActive ? (
                      <Clock className="h-4 w-4 mr-2 animate-pulse" />
                    ) : isStarting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    {cooldownActive ? `Wait ${cooldownTime}s` : isStarting ? 'Starting...' : 'Stop'}
                  </button>
                ) : (
                  <button
                    onClick={handleStartMonitoring}
                    disabled={configLoading || cooldownActive || isStopping}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {cooldownActive ? (
                      <Clock className="h-4 w-4 mr-2 animate-pulse" />
                    ) : isStopping ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {cooldownActive ? `Wait ${cooldownTime}s` : isStopping ? 'Stopping...' : 'Start'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Posts Checked
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.posts_checked || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Comments Checked
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.comments_checked || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      AI Replies
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.ai_replies || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Errors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.errors || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rate Limited
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.rate_limited || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Mode
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.test_mode ? 'Test Mode' : 'Live Mode'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Monitoring Configuration
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Subreddit */}
            <div>
              <label htmlFor="subreddit" className="block text-sm font-medium text-gray-700 mb-2">
                Subreddit
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="subreddit"
                  value={config.subreddit}
                  onChange={(e) => updateConfig({ subreddit: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white shadow-sm"
                  placeholder="e.g., AskReddit"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the subreddit name without the &quot;r/&quot; prefix
              </p>
            </div>

            {/* Filter Prompt */}
            <div>
              <label htmlFor="topic_filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter Prompt
              </label>
              <div className="relative">
                <textarea
                  id="topic_filter"
                  rows={3}
                  value={config.topic_filter}
                  onChange={(e) => updateConfig({ topic_filter: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white shadow-sm resize-none"
                  placeholder="Enter topics to monitor, separated by commas"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Keywords and topics the bot should look for in posts and comments
              </p>
            </div>

            {/* Check Interval */}
            <div>
              <label htmlFor="check_interval" className="block text-sm font-medium text-gray-700 mb-2">
                Check Interval (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="check_interval"
                  min="1"
                  max="60"
                  value={config.check_interval}
                  onChange={(e) => updateConfig({ check_interval: parseInt(e.target.value) || 2 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white shadow-sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                How often to check for new posts and comments (1-60 minutes)
              </p>
            </div>

            {/* Test Mode */}
            <div className="flex items-center">
              <input
                id="test_mode"
                type="checkbox"
                checked={config.test_mode}
                onChange={(e) => updateConfig({ test_mode: e.target.checked })}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="test_mode" className="ml-2 block text-sm text-gray-900">
                Test Mode
              </label>
            </div>
            <div className="ml-6">
              <p className="text-sm text-gray-500">
                When enabled, the bot will simulate replies without actually posting to Reddit
              </p>
            </div>
          </div>
        </div>

        {/* Preset Configurations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Preset Configurations</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => updateConfig({
                  subreddit: 'AskReddit',
                  topic_filter: 'Achilles tendon injuries, rupture, recovery, medical advice, pain, surgery',
                  check_interval: 2,
                  test_mode: true,
                })}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Medical Advice</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Monitor for Achilles tendon and medical advice topics
                </p>
              </button>

              <button
                onClick={() => updateConfig({
                  subreddit: 'AskReddit',
                  topic_filter: 'general advice, help, questions, support',
                  check_interval: 5,
                  test_mode: true,
                })}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">General Help</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Monitor for general advice and help requests
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Important Notes
              </p>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>Always test in Test Mode before switching to Live Mode</li>
                <li>Ensure your Reddit accounts are properly configured</li>
                <li>Respect Reddit&apos;s rate limits and community guidelines</li>
                <li>Monitor the logs to ensure proper operation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

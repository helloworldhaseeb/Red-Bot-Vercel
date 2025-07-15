'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { apiService, CsvLogEntry } from '@/lib/api';
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [csvLogs, setCsvLogs] = useState<CsvLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'csv'>('live');
  const [selectedLog, setSelectedLog] = useState<CsvLogEntry | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  const handleTabChange = (tab: 'live' | 'csv') => {
    setActiveTab(tab);
    if (tab === 'csv') {
      fetchCsvLogs();
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await apiService.getLogs(100);
      if (response.logs && response.logs.length > 0) {
        setLogs(response.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCsvLogs = async () => {
    try {
      const response = await apiService.getAnalysisLogJson();
      if (response.logs && response.logs.length > 0) {
        setCsvLogs(response.logs);
      } else {
        setCsvLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch CSV logs:', error);
      toast.error('Failed to fetch CSV logs');
      setCsvLogs([]);
    }
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    if (activeTab === 'live') {
      await fetchLogs();
    } else {
      await fetchCsvLogs();
    }
    setRefreshing(false);
  };

  const clearLogs = async () => {
    try {
      await apiService.clearLogs();
      toast.success('Logs cleared successfully');
      setLogs([]);
      await fetchLogs();
    } catch (error) {
      console.error('Failed to clear logs:', error);
      toast.error('Failed to clear logs');
    }
  };

  const downloadAnalysisLog = async () => {
    try {
      const blob = await apiService.downloadAnalysisLog();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai_analysis_log.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Analysis log downloaded');
    } catch (error) {
      console.error('Failed to download analysis log:', error);
      toast.error('Failed to download analysis log');
    }
  };

  const getLogIcon = (log: string) => {
    if (log.includes('ERROR')) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (log.includes('SUCCESS')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (log.includes('WARNING')) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const getLogLevel = (log: string) => {
    if (log.includes('ERROR')) return 'error';
    if (log.includes('SUCCESS')) return 'success';
    if (log.includes('WARNING')) return 'warning';
    if (log.includes('INFO')) return 'info';
    return 'default';
  };

  useEffect(() => {
    fetchLogs();
    fetchCsvLogs();
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        fetchLogs();
      }
    }, 60000); // Refresh live logs every 60 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
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
            <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor real-time logs and download analysis data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshLogs}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={downloadAnalysisLog}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </button>
            <button
              onClick={clearLogs}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('live')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'live'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Live Logs ({logs.length})
              </button>
              <button
                onClick={() => handleTabChange('csv')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'csv'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="h-4 w-4 inline mr-2" />
                Analysis Logs ({csvLogs.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'live' ? (
              // Live Logs Tab
              <div>
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No live logs available</p>
                    <p className="text-sm">Logs will appear here when monitoring is active</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {logs.map((log, index) => {
                      const level = getLogLevel(log);
                      return (
                        <div
                          key={index}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            level === 'error' ? 'bg-red-50' :
                            level === 'success' ? 'bg-green-50' :
                            level === 'warning' ? 'bg-yellow-50' :
                            level === 'info' ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {getLogIcon(log)}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-mono ${
                                level === 'error' ? 'text-red-800' :
                                level === 'success' ? 'text-green-800' :
                                level === 'warning' ? 'text-yellow-800' :
                                level === 'info' ? 'text-blue-800' : 'text-gray-900'
                              }`}>
                                {log}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // CSV Logs Tab
              <div>
                {csvLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Database className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No analysis logs available</p>
                    <p className="text-sm">Analysis logs will appear here when AI processing occurs</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mode
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Decision
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Content Preview
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.timestamp}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                log.mode === 'LIVE_MODE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {log.mode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                log.ai_decision?.includes('YES') 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {log.ai_decision}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <button
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowLogModal(true);
                                }}
                                className="text-left hover:text-red-600 transition-colors"
                              >
                                <div className="max-w-xs truncate" title={log.original_content}>
                                  {log.original_content?.substring(0, 100)}...
                                </div>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Log Level Legend */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Log Levels</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Success</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">Info</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700">Error</span>
              </div>
            </div>
          </div>
        </div>

        {/* Log Detail Modal */}
        {showLogModal && selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Log Details</h3>
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.timestamp}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mode</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedLog.mode === 'LIVE_MODE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedLog.mode}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.type}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.content_id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reddit Permalink</label>
                    <a 
                      href={selectedLog.reddit_permalink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-red-600 hover:text-red-800 break-all"
                    >
                      {selectedLog.reddit_permalink}
                    </a>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">AI Decision</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedLog.ai_decision?.includes('YES') 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedLog.ai_decision}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.reason}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Original Content</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLog.original_content}</p>
                    </div>
                  </div>
                  
                  {selectedLog.generated_reply && selectedLog.generated_reply !== 'N/A' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Generated Reply</label>
                      <div className="mt-1 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLog.generated_reply}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 
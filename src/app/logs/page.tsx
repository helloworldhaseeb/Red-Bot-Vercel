'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { apiService } from '@/lib/api';
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await apiService.getLogs(100);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLogs = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, [fetchLogs]);

  const clearLogs = async () => {
    try {
      await apiService.clearLogs();
      toast.success('Logs cleared successfully');
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
    const interval = setInterval(fetchLogs, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [fetchLogs]);

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

        {/* Logs Display */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Live Logs ({logs.length} entries)
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No logs available</p>
                <p className="text-sm">Logs will appear here when monitoring is active</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {logs.map((log, index) => {
                  const level = getLogLevel(log);
                  return (
                    <div
                      key={`${log}-${index}`}
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
      </div>
    </Layout>
  );
} 
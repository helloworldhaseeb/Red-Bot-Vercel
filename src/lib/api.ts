import axios from 'axios';

const API_BASE_URL = 'https://guysolan.pythonanywhere.com';
// const API_BASE_URL = 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MonitoringConfig {
  subreddit: string;
  topic_filter: string;
  check_interval: number;
  test_mode: boolean;
}

export interface Account {
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  api_key: string;
}

export interface MonitoringStats {
  posts_checked: number;
  comments_checked: number;
  ai_replies: number;
  errors: number;
  rate_limited: number;
  status: string;
  subreddit: string;
  test_mode: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export const apiService = {
  // Monitoring
  startMonitoring: async (config: MonitoringConfig) => {
    const response = await api.post('/monitor/start', config);
    return response.data;
  },

  stopMonitoring: async () => {
    const response = await api.post('/monitor/stop');
    return response.data;
  },

  getStatus: async (): Promise<MonitoringStats> => {
    const response = await api.get('/monitor/status');
    return response.data;
  },

  // Logs
  getLogs: async (limit: number = 100): Promise<{ logs: string[] }> => {
    const response = await api.get(`/logs?limit=${limit}`);
    return response.data;
  },

  clearLogs: async () => {
    const response = await api.post('/logs/clear');
    return response.data;
  },

  downloadAnalysisLog: async () => {
    const response = await api.get('/logs/analysis', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Accounts
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  addAccount: async (account: Account) => {
    const response = await api.post('/accounts', account);
    return response.data;
  },

  removeAccount: async (username: string) => {
    const response = await api.delete(`/accounts/${username}`);
    return response.data;
  },

  // Medical Content
  getMedicalContent: async () => {
    const response = await api.get('/medical-content');
    return response.data;
  },
};

export default api; 
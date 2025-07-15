import { create } from 'zustand';
import { apiService, MonitoringStats, MonitoringConfig } from './api';

interface MonitoringStore {
  // State
  stats: MonitoringStats | null;
  config: MonitoringConfig;
  loading: boolean;
  refreshing: boolean;
  cooldownActive: boolean;
  cooldownTime: number;
  configLoading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  updateConfig: (config: Partial<MonitoringConfig>) => void;
  startCooldown: () => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setConfigLoading: (loading: boolean) => void;
}

const defaultConfig: MonitoringConfig = {
  subreddit: 'AskReddit',
  topic_filter: 'Achilles tendon injuries, rupture, recovery, medical advice, pain, surgery',
  check_interval: 2,
  test_mode: true,
};

export const useMonitoringStore = create<MonitoringStore>((set, get) => ({
  // Initial state
  stats: null,
  config: defaultConfig,
  loading: false,
  refreshing: false,
  cooldownActive: false,
  cooldownTime: 15,
  configLoading: false,
  initialized: false,

  // Initialize store - called once on app load
  initialize: async () => {
    const { initialized } = get();
    if (initialized) return;

    set({ loading: true });
    try {
      const data = await apiService.getStatus();
      set({ stats: data, initialized: true });
    } catch (error) {
      console.error('Failed to fetch initial stats:', error);
      // Set default inactive state if API fails
      set({
        stats: {
          status: "inactive",
          subreddit: defaultConfig.subreddit,
          test_mode: defaultConfig.test_mode,
          posts_checked: 0,
          comments_checked: 0,
          ai_replies: 0,
          errors: 0,
          rate_limited: 0,
        },
        initialized: true
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch stats from API
  fetchStats: async () => {
    set({ loading: true });
    try {
      const data = await apiService.getStatus();
      set({ stats: data });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Refresh stats (with loading indicator)
  refreshStats: async () => {
    set({ refreshing: true });
    try {
      await get().fetchStats();
    } finally {
      set({ refreshing: false });
    }
  },

  // Start monitoring
  startMonitoring: async () => {
    const { config, cooldownActive, cooldownTime } = get();
    
    if (cooldownActive) {
      throw new Error(`Please wait ${cooldownTime} seconds before starting monitoring again`);
    }

    set({ configLoading: true });
    try {
      const response = await apiService.startMonitoring(config);
      
      if (response.status === "monitoring_started") {
        // Update local state immediately
        set({
          stats: {
            status: "active",
            subreddit: config.subreddit,
            test_mode: config.test_mode,
            posts_checked: 0,
            comments_checked: 0,
            ai_replies: 0,
            errors: 0,
            rate_limited: 0,
          }
        });
        get().startCooldown();
      } else {
        throw new Error('Failed to start monitoring');
      }
    } finally {
      set({ configLoading: false });
    }
  },

  // Stop monitoring
  stopMonitoring: async () => {
    const { config, cooldownActive, cooldownTime } = get();
    
    if (cooldownActive) {
      throw new Error(`Please wait ${cooldownTime} seconds before stopping monitoring again`);
    }

    set({ configLoading: true });
    try {
      const response = await apiService.stopMonitoring();
      
      if (response.status === "monitoring_stopped") {
        // Update local state immediately
        set({
          stats: {
            status: "inactive",
            subreddit: config.subreddit,
            test_mode: config.test_mode,
            posts_checked: 0,
            comments_checked: 0,
            ai_replies: 0,
            errors: 0,
            rate_limited: 0,
          }
        });
        get().startCooldown();
      } else {
        throw new Error('Failed to stop monitoring');
      }
    } finally {
      set({ configLoading: false });
    }
  },

  // Update configuration
  updateConfig: (newConfig: Partial<MonitoringConfig>) => {
    set((state) => ({
      config: { ...state.config, ...newConfig }
    }));
  },

  // Start cooldown timer
  startCooldown: () => {
    set({ cooldownActive: true, cooldownTime: 15 });
    
    const interval = setInterval(() => {
      set((state) => {
        if (state.cooldownTime <= 1) {
          clearInterval(interval);
          return { cooldownActive: false, cooldownTime: 15 };
        }
        return { cooldownTime: state.cooldownTime - 1 };
      });
    }, 1000);
  },

  // Utility setters
  setLoading: (loading: boolean) => set({ loading }),
  setRefreshing: (refreshing: boolean) => set({ refreshing }),
  setConfigLoading: (configLoading: boolean) => set({ configLoading }),
})); 
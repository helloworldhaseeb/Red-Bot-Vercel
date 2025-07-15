import { useMonitoringStore } from './store';

// Custom hook for monitoring actions with better error handling
export const useMonitoring = () => {
  const store = useMonitoringStore();

  const startMonitoring = async () => {
    try {
      await store.startMonitoring();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start monitoring' 
      };
    }
  };

  const stopMonitoring = async () => {
    try {
      await store.stopMonitoring();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to stop monitoring' 
      };
    }
  };

  const refreshStats = async () => {
    try {
      await store.refreshStats();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh stats' 
      };
    }
  };

  return {
    ...store,
    startMonitoring,
    stopMonitoring,
    refreshStats,
  };
}; 
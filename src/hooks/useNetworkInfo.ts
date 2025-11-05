import { useState, useEffect } from 'react';

export interface NetworkInfo {
  isOnline: boolean;
  isWiFi: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean; // Data saver mode
}

/**
 * Hook to detect network conditions for intelligent video prefetching
 * Uses Network Information API where available
 */
export const useNetworkInfo = (): NetworkInfo => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    isWiFi: false,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        // Detect WiFi vs cellular
        const type = connection.type || connection.effectiveType;
        const isWiFi = type === 'wifi' || type === 'ethernet' || 
                       (!connection.type && connection.downlink > 10);

        setNetworkInfo({
          isOnline: navigator.onLine,
          isWiFi,
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        });
      } else {
        // Fallback - assume WiFi if online
        setNetworkInfo(prev => ({
          ...prev,
          isOnline: navigator.onLine,
          isWiFi: navigator.onLine, // Optimistic fallback
        }));
      }
    };

    updateNetworkInfo();

    // Listen for network changes
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
};

import { useState, useEffect } from 'react';

export interface BatteryInfo {
  level: number; // 0-100
  charging: boolean;
  available: boolean;
}

/**
 * Hook to detect battery level for power-aware prefetching
 * Uses Battery Status API where available
 */
export const useBatteryInfo = (): BatteryInfo => {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: 100, // Assume full battery if unavailable
    charging: false,
    available: false,
  });

  useEffect(() => {
    const updateBatteryInfo = (battery: any) => {
      setBatteryInfo({
        level: battery.level * 100,
        charging: battery.charging,
        available: true,
      });
    };

    // Battery API is async
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBatteryInfo(battery);

        // Listen for battery changes
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
      }).catch(() => {
        // Battery API not available
        console.log('Battery API not available');
      });
    }
  }, []);

  return batteryInfo;
};

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9e9e7aa7b8514f2d91c71aeff4384151',
  appName: 'shorttalez',
  webDir: 'dist',
  server: {
    url: 'https://9e9e7aa7-b851-4f2d-91c7-1aeff4384151.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Haptics: {
      // Enable haptic feedback for touch interactions
    }
  }
};

export default config;
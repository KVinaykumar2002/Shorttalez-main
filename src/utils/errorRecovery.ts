// Error recovery and app health monitoring
export class AppHealthMonitor {
  private static instance: AppHealthMonitor;
  private errorCount = 0;
  private lastError: Error | null = null;
  private recoveryAttempts = 0;
  private maxRecoveryAttempts = 3;

  static getInstance(): AppHealthMonitor {
    if (!AppHealthMonitor.instance) {
      AppHealthMonitor.instance = new AppHealthMonitor();
    }
    return AppHealthMonitor.instance;
  }

  init() {
    this.setupErrorHandlers();
    this.monitorPageVisibility();
    this.checkAppHealth();
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message || 'Unknown error'));
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason || 'Unhandled promise rejection'));
    });

    // React error boundary fallback
    window.addEventListener('react-error', (event: any) => {
      this.handleError(new Error(event.detail?.error || 'React error'));
    });
  }

  private handleError(error: Error) {
    this.errorCount++;
    this.lastError = error;
    
    console.error('App error detected:', error);
    
    // If too many errors, attempt recovery
    if (this.errorCount > 5 && this.recoveryAttempts < this.maxRecoveryAttempts) {
      this.attemptRecovery();
    }
  }

  private attemptRecovery() {
    this.recoveryAttempts++;
    console.log(`Attempting app recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);

    // Clear caches
    this.clearAppCaches();
    
    // Reset error count
    this.errorCount = 0;
    
    // Force page reload as last resort
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.log('Maximum recovery attempts reached, reloading page');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  private async clearAppCaches() {
    try {
      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }

      // Clear localStorage (but preserve auth)
      const authData = localStorage.getItem('supabase.auth.token');
      localStorage.clear();
      if (authData) {
        localStorage.setItem('supabase.auth.token', authData);
      }

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('App caches cleared successfully');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  async clearCaches() {
    return this.clearAppCaches();
  }

  private monitorPageVisibility() {
    let wasHidden = false;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        wasHidden = true;
      } else if (wasHidden) {
        // Page became visible again, check health
        setTimeout(() => this.checkAppHealth(), 1000);
        wasHidden = false;
      }
    });
  }

  private checkAppHealth() {
    // Check if main React app is still mounted
    const appRoot = document.getElementById('root');
    if (appRoot && appRoot.children.length === 0) {
      console.warn('App root is empty, attempting recovery');
      this.attemptRecovery();
    }

    // Check for frozen UI (no interactions for too long)
    let lastInteraction = Date.now();
    ['click', 'scroll', 'keydown'].forEach(event => {
      document.addEventListener(event, () => {
        lastInteraction = Date.now();
      }, { passive: true });
    });

    // Check every 30 seconds
    setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteraction;
      // If no interaction for 5 minutes and page is visible, something might be wrong
      if (timeSinceInteraction > 300000 && !document.hidden && this.errorCount > 0) {
        console.warn('Possible frozen UI detected');
      }
    }, 30000);
  }

  getHealthStatus() {
    return {
      errorCount: this.errorCount,
      lastError: this.lastError?.message,
      recoveryAttempts: this.recoveryAttempts,
      isHealthy: this.errorCount < 3 && this.recoveryAttempts < 2
    };
  }

  reset() {
    this.errorCount = 0;
    this.lastError = null;
    this.recoveryAttempts = 0;
  }
}

// Initialize app health monitoring
export const initAppHealthMonitoring = () => {
  const monitor = AppHealthMonitor.getInstance();
  monitor.init();
  
  // Expose to window for debugging
  (window as any).appHealthMonitor = monitor;
};

// Blank page recovery utility
export const recoverFromBlankPage = () => {
  console.log('Recovering from blank page...');
  
  // Check if we're on a blank page
  const body = document.body;
  const hasContent = body && body.children.length > 0;
  
  if (!hasContent || body?.textContent?.trim() === '') {
    console.warn('Blank page detected, forcing reload');
    // Clear all caches and reload
    AppHealthMonitor.getInstance().clearCaches().then(() => {
      window.location.href = window.location.origin + '/home';
    });
  }
};

// Service worker management
export const manageServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // Unregister old service workers that might cause issues
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        // Only keep the current service worker
        if (registration.scope !== `${window.location.origin}/`) {
          registration.unregister();
        }
      });
    });
    
    // Register current service worker
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('SW update found');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed, prompt for reload
              console.log('SW updated, reloading...');
              window.location.reload();
            }
          });
        }
      });
    }).catch(error => {
      console.error('SW registration failed:', error);
    });
  }
};

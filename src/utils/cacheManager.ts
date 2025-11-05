import { supabase } from '@/integrations/supabase/client';

export interface CacheOptions {
  clearStorage?: boolean;
  cacheBust?: boolean;
  forceReload?: boolean;
  version?: string;
}

export class CacheManager {
  private static instance: CacheManager;

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async clearAllCaches(options: CacheOptions = {}): Promise<void> {
    console.log('Starting comprehensive cache clear...');
    
    try {
      // Clear browser caches and unregister service workers
      await this.clearBrowserCaches();
      
      // Clear storage
      if (options.clearStorage === true) {
        // Destructive: remove EVERYTHING (do not preserve auth/theme)
        await this.clearStorage(false);
      } else if (options.clearStorage !== false) {
        // Default: clear but preserve critical data
        await this.clearStorage(true);
      }
      
      // Clear cookies (preserve critical cookies unless destructive clear)
      await this.clearCookies(options.clearStorage !== true);
      
      // Call server-side cache clearing
      await this.clearServerCaches(options);
      
      console.log('All caches cleared successfully');
      
      // Force reload if requested
      if (options.forceReload !== false) {
        this.forceReload(options);
      }
    } catch (error) {
      console.error('Cache clearing error:', error);
      throw error;
    }
  }

  private async clearBrowserCaches(): Promise<void> {
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs && regs.length) {
          await Promise.all(regs.map(r => r.unregister()));
          console.log('Service workers unregistered');
        }
      }

      // Delete all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('Found caches:', cacheNames);
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('Browser caches cleared');
      }
    } catch (error) {
      console.error('Browser cache clear error:', error);
      throw error;
    }
  }

  private async clearStorage(preserveCritical: boolean = true): Promise<void> {
    try {
      const criticalData = preserveCritical ? {
        authToken: localStorage.getItem('sb-nxsogkmnimaihoxbpnpd-auth-token'),
        theme: localStorage.getItem('theme')
      } : null;

      localStorage.clear();
      sessionStorage.clear();
      
      if (preserveCritical && criticalData) {
        if (criticalData.authToken) {
          localStorage.setItem('sb-nxsogkmnimaihoxbpnpd-auth-token', criticalData.authToken);
        }
        if (criticalData.theme) {
          localStorage.setItem('theme', criticalData.theme);
        }
      }
      
      console.log(`Storage cleared${preserveCritical ? ' (preserved auth and theme)' : ' (everything removed)'}`);
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  private async clearCookies(preserveCritical: boolean = true): Promise<void> {
    try {
      const cookies = document.cookie.split(";");
      
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name && (preserveCritical ? !this.isCriticalCookie(name) : true)) {
          // Clear for current path
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          
          // Clear for domain
          const hostname = window.location.hostname;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${hostname}`;
          
          // Clear for parent domain
          const domainParts = hostname.split('.');
          if (domainParts.length > 2) {
            const parentDomain = '.' + domainParts.slice(-2).join('.');
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
          }
        }
      }
      
      console.log(`Cookies cleared${preserveCritical ? ' (preserved critical cookies)' : ' (all cookies removed)'}`);
    } catch (error) {
      console.error('Cookie clear error:', error);
      throw error;
    }
  }

  private isCriticalCookie(name: string): boolean {
    const criticalCookies = [
      'sb-nxsogkmnimaihoxbpnpd-auth-token',
      'supabase.auth.token',
      'theme'
    ];
    return criticalCookies.some(critical => name.includes(critical));
  }

  private async clearServerCaches(options: CacheOptions): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('clear-user-caches', {
        body: {
          action: 'clear_all_user_caches',
          version: options.version || Date.now().toString(),
          force_reload: options.forceReload !== false,
          cache_bust: options.cacheBust !== false,
          clear_storage: options.clearStorage === true
        }
      });

      if (error) {
        console.error('Server cache clear error:', error);
        throw error;
      }
      
      console.log('Server caches cleared');
    } catch (error) {
      console.error('Server cache clear failed:', error);
      throw error;
    }
  }

  private forceReload(options: CacheOptions): void {
    try {
      const url = new URL(window.location.href);
      
      // Add cache-busting parameters
      url.searchParams.set('cb', Date.now().toString());
      url.searchParams.set('_', Math.random().toString(36).substring(7));
      
      if (options.version) {
        url.searchParams.set('v', options.version);
      }
      
      console.log('Force reloading with cache bypass:', url.toString());
      
      // Use replace to avoid adding to history
      setTimeout(() => {
        window.location.replace(url.toString());
      }, 100);
      
    } catch (error) {
      console.error('Force reload error:', error);
      // Fallback to simple reload
      window.location.reload();
    }
  }

  // Utility method for version updates
  async deployNewVersion(version?: string): Promise<void> {
    const newVersion = version || Date.now().toString();
    
    try {
      // Set version in storage for reference
      localStorage.setItem('app_version', newVersion);
      
      // Clear all caches with version update
      await this.clearAllCaches({
        version: newVersion,
        forceReload: true,
        cacheBust: true,
        clearStorage: false // Don't clear auth data during version updates
      });
      
    } catch (error) {
      console.error('Version deployment error:', error);
      throw error;
    }
  }

  // Check if cache needs clearing based on version
  checkVersionUpdate(): void {
    const currentVersion = localStorage.getItem('app_version') || undefined;
    // In browser we avoid process.env; only act if an explicit version is exposed
    const deployedVersion = (window as any).__APP_VERSION__ as string | undefined;
    if (currentVersion && deployedVersion && currentVersion !== deployedVersion) {
      console.log(`Version mismatch detected: ${currentVersion} -> ${deployedVersion}`);
      this.deployNewVersion(deployedVersion);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Auto-check version on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    cacheManager.checkVersionUpdate();
  });
}
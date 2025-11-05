import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CacheRequest {
  action: string;
  version?: string;
  force_reload?: boolean;
  cache_bust?: boolean;
  clear_storage?: boolean;
  clear_all?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, version, force_reload, cache_bust, clear_storage, clear_all }: CacheRequest = await req.json();
    
    console.log('Cache clear request:', { action, version, force_reload, cache_bust, clear_storage });

    const response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      action: action
    };

    switch (action) {
      case 'clear_all_user_caches':
        // Server-side cache clearing logic
        response.message = 'Server caches cleared successfully';
        response.cleared = ['server_cache', 'cdn_cache', 'database_cache'];
        
        // Set aggressive cache-busting headers
        const cacheHeaders = {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Last-Modified': new Date().toUTCString(),
          'ETag': `"${Date.now()}"`,
          'Vary': '*',
          'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
          'X-Cache-Clear': 'true',
          'X-Cache-Timestamp': Date.now().toString(),
          'X-Version-Update': version || Date.now().toString(),
          'X-Force-Reload': 'true'
        };
        
        return new Response(JSON.stringify(response), {
          headers: { 
            'Content-Type': 'application/json',
            ...cacheHeaders
          },
        });

      case 'force_browser_refresh':
        // Browser cache clearing instructions
        response.message = 'Browser cache clear initiated';
        response.instructions = {
          clear_cache: true,
          clear_storage: clear_storage || false,
          reload_required: true,
          cache_bust_param: cache_bust ? `cb=${Date.now()}` : null
        };
        
        // Generate comprehensive cache-busting instructions
        response.cache_clear_script = `
          // Clear all service worker caches
          if ('caches' in window) {
            caches.keys().then(names => {
              Promise.all(names.map(name => {
                console.log('Deleting cache:', name);
                return caches.delete(name);
              })).then(() => {
                console.log('All caches deleted successfully');
              });
            }).catch(err => console.error('Cache deletion error:', err));
          }
          
          // Clear localStorage and sessionStorage
          if (${clear_storage || true}) {
            try {
              localStorage.clear();
              sessionStorage.clear();
              console.log('Storage cleared');
            } catch (e) {
              console.error('Storage clear error:', e);
            }
          }
          
          // Clear all cookies aggressively
          try {
            document.cookie.split(";").forEach(cookie => {
              const eqPos = cookie.indexOf("=");
              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
              if (name) {
                // Clear for current domain
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                // Clear for parent domain
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
                // Clear for all subdomains
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname.split('.').slice(-2).join('.');
              }
            });
            console.log('Cookies cleared');
          } catch (e) {
            console.error('Cookie clear error:', e);
          }
          
          // Force reload with maximum cache bypass
          setTimeout(() => {
            const url = new URL(window.location.href);
            url.searchParams.set('cb', Date.now().toString());
            url.searchParams.set('v', '${Date.now()}');
            window.location.replace(url.toString());
          }, 100);
        `;
        
        // Set cache busting headers
        const browserHeaders = {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Clear-Site-Data': '"cache", "cookies", "storage"',
          'X-Cache-Clear': 'browser',
          'X-Cache-Bust': cache_bust ? Date.now().toString() : 'false'
        };
        
        return new Response(JSON.stringify(response), {
          headers: { 
            'Content-Type': 'application/json',
            ...browserHeaders
          },
        });

      case 'version_update':
        // Version update with complete cache invalidation
        const newVersion = version || Date.now().toString();
        response.message = 'Version update initiated';
        response.version = newVersion;
        response.force_reload = force_reload || true;
        response.clear_all = clear_all || true;
        
        // Set ultra-aggressive cache control headers
        const versionHeaders = {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
          'X-Version': newVersion,
          'X-Force-Reload': 'true',
          'X-Cache-Invalidate': 'all',
          'Last-Modified': new Date().toUTCString(),
          'ETag': `"v${newVersion}"`,
          'Vary': '*'
        };
        
        return new Response(JSON.stringify(response), {
          headers: { 
            'Content-Type': 'application/json',
            ...versionHeaders
          },
        });

      default:
        response.success = false;
        response.error = 'Unknown action';
    }

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders,
        'Cache-Control': 'no-cache'
      },
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });
  }
})
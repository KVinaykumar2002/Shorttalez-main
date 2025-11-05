// Enhanced Service Worker for maximum performance and no blank pages
const CACHE_NAME = 'shorttalez-v1.4';
const STATIC_CACHE = 'static-v1.4';
const DYNAMIC_CACHE = 'dynamic-v1.4';

// Critical resources that must be cached
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Aggressive caching for static assets
const CACHE_FIRST_PATTERNS = [
  /\.(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf|otf)$/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /cdn\./
];

// Fresh content for dynamic resources
const NETWORK_FIRST_PATTERNS = [
  /supabase\.co/,
  /\/api\//,
  /auth/
];

self.addEventListener('install', event => {
  console.log('SW: Installing enhanced service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW: Install failed', err))
  );
});

self.addEventListener('activate', event => {
  console.log('SW: Activating');
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(names => 
        Promise.all(
          names
            .filter(name => !name.includes('v1.4'))
            .map(name => caches.delete(name))
        )
      ),
      // Take control immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies but preserve headers for API calls
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip extension requests
  if (request.url.startsWith('chrome-extension://')) return;
  
  // CRITICAL: Skip Supabase API requests to prevent authorization issues
  if (request.url.includes('supabase.co')) return;
  
  // Handle different request types
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // NEVER cache API requests - always fetch fresh
    if (isAPI(url)) {
      return fetch(request);
    }
    
    // Static assets: Cache first for speed
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
      return await cacheFirstStrategy(request);
    }
    
    // Navigation requests: Network with smart fallback
    if (request.mode === 'navigate') {
      return await navigationStrategy(request);
    }
    
    // Default: Network first with cache fallback
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.warn('SW: Request failed:', url.href, error);
    return await fallbackResponse(request);
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version immediately, update in background
    updateCacheInBackground(request, cache);
    return cached;
  }
  
  // Not in cache, fetch and cache
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    // Always pass through original request headers for API calls
    const response = await fetch(request);
    
    if (response.ok && !isAPI(new URL(request.url))) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed, try cache only for non-API requests
    if (!isAPI(new URL(request.url))) {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    throw error;
  }
}

// Special handling for navigation to prevent blank pages
async function navigationStrategy(request) {
  try {
    // Always try network first for navigation
    const response = await fetch(request, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (response.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('SW: Navigation network failed, trying cache');
    
    // Try to find cached version
    const cached = await caches.match(request) || 
                   await caches.match('/') || 
                   await caches.match('/index.html');
    
    if (cached) return cached;
    
    // Last resort: Simple HTML shell to prevent blank page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Short Talez</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              margin: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              color: white;
            }
            .loading { text-align: center; }
            .spinner { 
              width: 40px; 
              height: 40px; 
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loading">
            <div class="spinner"></div>
            <h2>Short Talez</h2>
            <p>Loading your cinematic experience...</p>
            <script>
              setTimeout(() => location.reload(), 2000);
            </script>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    // Ignore background update errors
  }
}

// Fallback response for failed requests
async function fallbackResponse(request) {
  // Try to find any cached version
  const cached = await caches.match(request);
  if (cached) return cached;
  
  // Return appropriate error response
  return new Response('Content temporarily unavailable', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Helper functions
function isAPI(url) {
  return url.hostname.includes('supabase.co') ||
         url.pathname.includes('/rest/') ||
         url.pathname.includes('/auth/') ||
         url.pathname.includes('/functions/');
}

console.log('SW: Enhanced service worker v1.4 loaded successfully');
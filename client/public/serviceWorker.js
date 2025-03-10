// Service Worker for PrepAcademy
const CACHE_NAME = 'prepacademy-cache-v1';
const DYNAMIC_CACHE = 'prepacademy-dynamic-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// API routes to cache for offline use
const API_ROUTES_TO_CACHE = [
  '/api/questions',
  '/api/studyplan',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static files');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE
            );
          })
          .map((cacheName) => {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // For API routes we want to cache
    const shouldCacheRoute = API_ROUTES_TO_CACHE.some(route => 
      url.pathname.includes(route)
    );
    
    if (shouldCacheRoute) {
      event.respondWith(
        networkFirstWithCache(request)
      );
    } else {
      // For other API routes, try network only
      event.respondWith(
        fetch(request).catch(() => {
          return caches.match(request);
        })
      );
    }
  } else {
    // For non-API requests (static assets, pages)
    event.respondWith(
      cacheFirstWithNetwork(request)
    );
  }
});

// Network-first strategy with cache fallback (for API requests)
async function networkFirstWithCache(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the response for future offline use
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If nothing in cache, return offline response
    return new Response(
      JSON.stringify({ 
        error: 'You are offline and this content is not available in your cache.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Cache-first strategy with network fallback (for static assets)
async function cacheFirstWithNetwork(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for future
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // For other requests, return error
    return new Response(
      'Network error happened', 
      { status: 408, headers: { 'Content-Type': 'text/plain' } }
    );
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 
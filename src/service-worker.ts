import { build, files, prerendered, version } from '$service-worker'

const CACHE_NAME = `sveltekit-pwa-${version}`
const STATIC_CACHE_NAME = `static-${version}`

// Create a unique cache name for this deployment
// const ASSETS = [...build, ...files, ...prerendered] // Available if needed

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Install')

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const staticCache = await caches.open(STATIC_CACHE_NAME)

      // Cache app shell
      await cache.addAll(build)

      // Cache static assets
      await staticCache.addAll(files)

      // Cache prerendered pages
      if (prerendered.length > 0) {
        await cache.addAll(prerendered)
      }

      console.log('[ServiceWorker] Cached all assets')

      // Force the waiting service worker to become the active service worker
      self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activate')

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME
          )
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )

      // Take control of all pages
      self.clients.claim()

      console.log('[ServiceWorker] Ready to serve from cache')
    })()
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)

  event.respondWith(
    (async () => {
      // Try to get from cache first
      const cachedResponse = await caches.match(event.request)

      if (cachedResponse) {
        // If we have a cached version, serve it but also try to update in background
        if (navigator.onLine) {
          fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone()
                caches
                  .open(
                    url.pathname.startsWith('/_app/')
                      ? CACHE_NAME
                      : STATIC_CACHE_NAME
                  )
                  .then((cache) => cache.put(event.request, responseClone))
              }
            })
            .catch(() => {
              // Network failed, but we have cache
            })
        }

        return cachedResponse
      }

      // No cache, try network
      try {
        const networkResponse = await fetch(event.request)

        if (networkResponse.ok) {
          // Cache successful responses
          const responseClone = networkResponse.clone()
          const cacheName = url.pathname.startsWith('/_app/')
            ? CACHE_NAME
            : STATIC_CACHE_NAME
          const cache = await caches.open(cacheName)
          await cache.put(event.request, responseClone)
        }

        return networkResponse
      } catch (error) {
        // Network failed and no cache
        console.log('[ServiceWorker] Network failed:', error)

        // For navigation requests, try to serve a fallback page
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/')
          if (fallback) {
            return fallback
          }
        }

        // Return a generic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    })()
  )
})

// Listen for messages from the client
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version })
  }
})

console.log(`[ServiceWorker] Version ${version} ready`)

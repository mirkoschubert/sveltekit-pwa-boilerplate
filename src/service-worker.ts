/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker'

const sw = self as unknown as ServiceWorkerGlobalScope

const CACHE_NAME = `sveltekit-pwa-${version}`

// All assets in one cache - much simpler!
const ASSETS = [...build, ...files, ...prerendered]

sw.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Install')
  console.log('[ServiceWorker] Build files:', build.length)
  console.log('[ServiceWorker] Static files:', files.length)  
  console.log('[ServiceWorker] Prerendered pages:', prerendered)

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      
      console.log('[ServiceWorker] Caching all assets:', ASSETS.length)
      await cache.addAll(ASSETS)
      
      console.log('[ServiceWorker] Cached all assets')
      sw.skipWaiting()
    })()
  )
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activate')

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )

      // Take control of all pages
      sw.clients.claim()

      console.log('[ServiceWorker] Ready to serve from cache')
    })()
  )
})

sw.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(sw.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // const url = new URL(event.request.url) // Not needed with single cache

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
                caches.open(CACHE_NAME)
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
          const cache = await caches.open(CACHE_NAME)
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
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version })
  }
})

console.log(`[ServiceWorker] Version ${version} ready`)

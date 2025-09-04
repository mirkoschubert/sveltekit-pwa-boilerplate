/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

const sw = self as unknown as ServiceWorkerGlobalScope

// Create precache manifest with revision based on version
const precacheList = [...build, ...files, ...prerendered].map((url) => ({
  url,
  revision: version
}))

console.log('[ServiceWorker] Version:', version)
console.log('[ServiceWorker] Precaching', precacheList.length, 'assets')

// Use Workbox for robust precaching
precacheAndRoute(precacheList)

// Clean up outdated caches automatically
cleanupOutdatedCaches()

sw.addEventListener('install', () => {
  console.log('[ServiceWorker] Install - skipping waiting immediately')
  sw.skipWaiting()
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activate - taking control')
  event.waitUntil(sw.clients.claim())
})

// Custom fetch handler for runtime caching of non-precached requests
sw.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(sw.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Let Workbox handle precached requests, we'll handle runtime caching
  event.respondWith(
    (async () => {
      // First check if Workbox has it precached
      const precachedResponse = await caches.match(event.request)
      if (precachedResponse) {
        return precachedResponse
      }

      // Runtime caching for non-precached requests
      try {
        const networkResponse = await fetch(event.request)

        if (networkResponse.ok) {
          // Cache successful responses in runtime cache
          const cache = await caches.open(`runtime-${version}`)
          cache.put(event.request, networkResponse.clone())
        }

        return networkResponse
      } catch {
        // Network failed, try runtime cache
        const runtimeCached = await caches.match(event.request, {
          cacheName: `runtime-${version}`
        })

        if (runtimeCached) {
          return runtimeCached
        }

        // For navigation requests, try to serve the root page as fallback
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/')
          if (fallback) {
            return fallback
          }
        }

        // Return offline response as last resort
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
    console.log('[ServiceWorker] Received SKIP_WAITING message')
    sw.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    console.log('[ServiceWorker] Sending version:', version)
    event.ports[0].postMessage({ version })
  }
})

console.log(`[ServiceWorker] Version ${version} ready`)

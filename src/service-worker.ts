/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

const sw = self as unknown as ServiceWorkerGlobalScope

// Create precache manifest with version-based revisions (this worked in v1.x)
const precacheList = [...build, ...files, ...prerendered].map((url) => ({
  url,
  revision: version // Use SvelteKit version for cache busting
}))

console.log('[ServiceWorker] Version:', version)
console.log('[ServiceWorker] Precaching', precacheList.length, 'assets')
console.log('[ServiceWorker] Precache list sample:', precacheList.slice(0, 3))

// Use Workbox with version-based revisions
precacheAndRoute(precacheList)

console.log('[ServiceWorker] Workbox precacheAndRoute called')

// Clean up outdated caches automatically
cleanupOutdatedCaches()

// ============================================================================
// Enhanced Caching Strategies (based on blog article recommendations)
// ============================================================================

// 1. NetworkFirst for HTML/Navigation - ensures fresh content when online
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-cache',
    networkTimeoutSeconds: 5, // Fallback to cache after 5 seconds
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
)

// 2. NetworkFirst for prerendered HTML pages
registerRoute(
  ({ url }) => {
    // Check if URL matches any prerendered page
    return prerendered.some(path => url.pathname === path || url.pathname === path + '/')
  },
  new NetworkFirst({
    cacheName: 'prerendered-html',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days for prerendered content
      })
    ]
  })
)

// 3. NetworkOnly for version.json - always fetch fresh
registerRoute(
  ({ url }) => url.pathname.includes('version.json'),
  new NetworkOnly()
)

// 4. CacheFirst for static assets (CSS, JS, images) - fast loading
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
      })
    ]
  })
)

// 5. StaleWhileRevalidate for API calls (if any)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60 // 1 day
      })
    ]
  })
)

console.log('[ServiceWorker] Enhanced caching strategies registered')

sw.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Install - precaching assets')

  // Standard SvelteKit pattern - let framework handle lifecycle
  event.waitUntil(
    (async () => {
      console.log('[ServiceWorker] Precaching completed')
      // Let SvelteKit handle when to activate - no custom skipWaiting logic
    })()
  )
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activate - taking control')
  event.waitUntil(sw.clients.claim())
})

// Message handling for manual SW activation
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[ServiceWorker] 📨 Message received:', {
    type: event.data?.type,
    timestamp: new Date().toISOString()
  })

  if (event.data?.type === 'SKIP_WAITING') {
    console.log(
      '[ServiceWorker] ⚡ SKIP_WAITING received - calling skipWaiting()'
    )
    sw.skipWaiting()
    console.log('[ServiceWorker] ✅ skipWaiting() called')
  }

  if (event.data?.type === 'GET_VERSION') {
    console.log('[ServiceWorker] 📤 Sending version:', version)
    event.ports[0].postMessage({ version })
  }
})

console.log(`[ServiceWorker] Version ${version} ready`)

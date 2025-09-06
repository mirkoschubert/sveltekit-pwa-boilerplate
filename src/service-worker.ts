/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

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

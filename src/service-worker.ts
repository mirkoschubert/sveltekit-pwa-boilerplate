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

// Use Workbox with version-based revisions
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

// Note: Workbox precacheAndRoute automatically handles fetch events for precached resources
// We don't need a custom fetch handler as it would override Workbox functionality

// Optional: Add runtime caching for non-precached requests only
// Workbox will handle all precached assets automatically

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

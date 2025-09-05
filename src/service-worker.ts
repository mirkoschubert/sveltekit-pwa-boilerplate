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
  console.log('[ServiceWorker] Install - waiting for precaching to complete')
  
  // Wait for precaching to complete but DON'T automatically skip waiting
  // Let the client control when to activate the new service worker
  event.waitUntil(
    (async () => {
      // Let Workbox finish precaching first
      console.log('[ServiceWorker] Precaching completed - waiting for activation signal')
      // No automatic skipWaiting() - wait for client message
    })()
  )
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activate - taking control')
  event.waitUntil(sw.clients.claim())
})

// Listen for messages from the client
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[ServiceWorker] 📨 Message received:', {
    type: event.data?.type,
    data: event.data,
    timestamp: new Date().toISOString()
  })

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] ⚡ SKIP_WAITING received - calling skipWaiting()')
    sw.skipWaiting()
    console.log('[ServiceWorker] ✅ skipWaiting() called')
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    console.log('[ServiceWorker] 📤 Sending version:', version)
    event.ports[0].postMessage({ version })
  }
})

console.log(`[ServiceWorker] Version ${version} ready`)

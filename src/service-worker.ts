/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

const sw = self as unknown as ServiceWorkerGlobalScope

// Let Workbox auto-generate revisions based on file content
// This ensures proper cache busting when files actually change
console.log('[ServiceWorker] Version:', version)
console.log(
  '[ServiceWorker] Precaching',
  build.length + files.length + prerendered.length,
  'assets'
)

// Use Workbox with automatic revision generation
precacheAndRoute([
  ...build.map((url) => ({ url, revision: null })), // Workbox will generate revisions
  ...files.map((url) => ({ url, revision: null })),
  ...prerendered.map((url) => ({ url, revision: null }))
])

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

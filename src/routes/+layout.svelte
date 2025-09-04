<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import { PWAPrompts, Header } from '$lib/components'
  import { Toaster } from '$lib/components/ui/sonner'
  import { ModeWatcher } from 'mode-watcher'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  let { children } = $props()

  // Fallback service worker registration for Vercel deployment issues
  onMount(() => {
    if (browser && 'serviceWorker' in navigator) {
      // Check if service worker is already registered by SvelteKit
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length === 0) {
          // No service worker registered, register it manually as fallback
          console.log('[PWA] Manual service worker registration fallback')
          navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
              console.log(
                '[PWA] Service worker registered manually:',
                registration
              )
            })
            .catch((error) => {
              console.error(
                '[PWA] Manual service worker registration failed:',
                error
              )
            })
        } else {
          console.log('[PWA] Service worker already registered by SvelteKit')
        }
      })
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Header />

<main>
  {@render children?.()}
</main>

<PWAPrompts />
<Toaster position="top-right" />

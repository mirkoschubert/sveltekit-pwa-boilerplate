<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import { PWAPrompts, Header } from '$lib/components'
  import { Toaster } from '$lib/components/ui/sonner'
  import { ModeWatcher } from 'mode-watcher'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { beforeNavigate } from '$app/navigation'
  import { updated } from '$app/state'
  import { pwaActions } from '$lib/stores/pwa'

  let { children } = $props()

  onMount(async () => {
    if (!browser || !('serviceWorker' in navigator)) {
      return
    }

    // Only register service worker in production
    if (import.meta.env.DEV) {
      console.log('[PWA] Service worker disabled in development')
      pwaActions.initialize()
      return
    }

    try {
      // Register service worker first
      await navigator.serviceWorker.register('/service-worker.js')
      console.log(
        '[PWA] Service worker registered successfully from +layout.svelte'
      )

      // Then initialize PWA actions (event listeners, state setup)
      pwaActions.initialize()

      console.log(
        '[PWA] SvelteKit native polling enabled - updates handled automatically'
      )
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      // Still initialize PWA actions even if SW registration fails
      pwaActions.initialize()
    }
  })

  beforeNavigate(({ willUnload, to }) => {
    if (updated.current && !willUnload && to?.url) {
      location.href = to.url.href
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

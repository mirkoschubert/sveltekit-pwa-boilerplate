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
  import { pwaActions, pwaState } from '$lib/stores/pwa'

  let { children } = $props()
  let version: string

  onMount(async () => {
    if (!browser || !('serviceWorker' in navigator)) {
      return
    }

    const response = await fetch('_app/version.json')
    const data = await response.json()
    version = data.version

    // Only register service worker in production
    if (import.meta.env.DEV) {
      console.log('[PWA] Service worker disabled in development')
      pwaActions.initialize()
      return
    }

    // Register service worker first
    navigator.serviceWorker.register(`/service-worker.js?v=${version}`, {
      updateViaCache: 'none'
    }).then(
      (registration) => {
        console.log(
          '[PWA] Service worker registered successfully from +layout.svelte',
          version, registration
        )

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      },
      (error) => {
        console.error(error)
      }
    )

    // Initialize PWA actions (event listeners, state setup)
    pwaActions.initialize()

    console.log(
      '[PWA] SvelteKit native polling enabled - updates handled automatically'
    )
  })

  // Watch for updates with $effect and re-register service worker
  $effect(() => {
    if (updated.current && browser && version) {
      console.log('🎯 [PWA] Update detected - fetching new version')
      
      // Use async function inside $effect
      const handleUpdate = async () => {
        try {
          const response = await fetch('_app/version.json')
          const data = await response.json()
          const newVersion = data.version
          
          console.log(`[PWA] Re-registering service worker with new version: ${newVersion}`)
          
          await navigator.serviceWorker.register(`/service-worker.js?v=${newVersion}`, {
            updateViaCache: 'none'
          })
          
          pwaState.update((state) => ({
            ...state,
            updateAvailable: true
          }))
          console.log('[PWA] ✅ Service worker re-registered for update')
        } catch (error) {
          console.error('[PWA] Failed to re-register service worker:', error)
        }
      }
      
      handleUpdate()
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

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

  onMount(async () => {
    if (!browser || !('serviceWorker' in navigator)) {
      return
    }

    // Initialize PWA actions (event listeners, state setup)  
    pwaActions.initialize()

    // Check for service worker updates on mount
    try {
      const registration = await navigator.serviceWorker.ready
      console.log('[PWA] Checking for service worker updates on mount')
      await registration.update()
    } catch (error) {
      console.error('[PWA] Failed to check for updates on mount:', error)
    }

    console.log('[PWA] SvelteKit native service worker registration and polling enabled')
  })

  // Watch for updates with $effect and trigger service worker update
  $effect(() => {
    if (updated.current && browser) {
      console.log('🎯 [PWA] Update detected via SvelteKit')
      
      // Use async function inside $effect
      const handleUpdate = async () => {
        try {
          const registration = await navigator.serviceWorker.ready
          console.log('[PWA] Triggering service worker update check')
          await registration.update()
          
          pwaState.update((state) => ({
            ...state,
            updateAvailable: true
          }))
          console.log('[PWA] ✅ Service worker update triggered')
        } catch (error) {
          console.error('[PWA] Failed to update service worker:', error)
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

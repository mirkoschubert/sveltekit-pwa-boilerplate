<script lang="ts">
  import { pwaState, pwaActions } from '$lib/stores/pwa'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { Button } from '$lib/components/ui/button'

  let showInstallPrompt = $state(false)
  let showUpdatePrompt = $state(false)
  let showOfflineBanner = $state(false)

  onMount(() => {
    return pwaState.subscribe((state) => {
      showInstallPrompt = state.isInstallable && !state.isInstalled
      showOfflineBanner = state.isOffline

      // Show update toast when SvelteKit detects update
      if (
        state.updateAvailable &&
        !showUpdatePrompt
      ) {
        showUpdatePrompt = true

        console.log('[PWA] Showing update notification from SvelteKit')

        const updateMessage = 'App update available!'
        const updateDescription = 'A new version is available. Update for the latest features.'

        toast(updateMessage, {
          description: updateDescription,
          action: {
            label: 'Update Now',
            onClick: () => handleUpdate()
          },
          cancel: {
            label: 'Later',
            onClick: () => {
              showUpdatePrompt = false
              pwaActions.resetUpdateState()
            }
          },
          duration: Infinity
        })
      }

      // Reset showUpdatePrompt when update is no longer available
      if (!state.updateAvailable && showUpdatePrompt) {
        showUpdatePrompt = false
      }
    })
  })

  async function handleInstall() {
    const success = await pwaActions.install()
    if (success) {
      showInstallPrompt = false
    }
  }

  async function handleUpdate() {
    showUpdatePrompt = false

    // Show loading toast
    toast.loading('Updating app...', {
      description: 'Please wait while the app updates to the latest version.'
    })

    // Small delay to show the loading message
    setTimeout(async () => {
      await pwaActions.updateApp()
    }, 500)
  }

  function dismissInstall() {
    showInstallPrompt = false
  }
</script>

<!-- Install Prompt -->
{#if showInstallPrompt}
  <div
    class="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-lg border border-border bg-card p-4 shadow-lg"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg
          class="h-6 w-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium text-card-foreground">Install App</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          Install this app for quick access and better experience
        </p>
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <Button onclick={handleInstall} size="sm">Install</Button>
      <Button onclick={dismissInstall} variant="outline" size="sm">
        Not now
      </Button>
    </div>
  </div>
{/if}

<!-- Offline Banner -->
{#if showOfflineBanner}
  <div
    class="text-destructive-foreground fixed top-14 right-0 left-0 z-50 bg-destructive"
  >
    <div class="px-4 py-2 text-center text-sm">
      <div class="flex items-center justify-center gap-2">
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        You're offline. Some features may be limited.
      </div>
    </div>
  </div>
{/if}

<script lang="ts">
  import { pwaState, pwaActions } from '$lib/stores/pwa'
  import { onMount } from 'svelte'

  let showInstallPrompt = $state(false)
  let showUpdatePrompt = $state(false)
  let showOfflineBanner = $state(false)

  onMount(() => {
    return pwaState.subscribe((state) => {
      showInstallPrompt = state.isInstallable && !state.isInstalled
      showUpdatePrompt = state.updateAvailable
      showOfflineBanner = state.isOffline
    })
  })

  async function handleInstall() {
    const success = await pwaActions.install()
    if (success) {
      showInstallPrompt = false
    }
  }

  function handleUpdateLater() {
    showUpdatePrompt = false
    pwaState.update(state => ({ ...state, updateAvailable: false }))
  }

  async function handleUpdate() {
    await pwaActions.updateApp()
  }

  function dismissInstall() {
    showInstallPrompt = false
  }
</script>

<!-- Install Prompt -->
{#if showInstallPrompt}
  <div class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800 dark:border-gray-700">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          Install App
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Install this app for quick access and better experience
        </p>
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <button 
        onclick={handleInstall}
        class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Install
      </button>
      <button 
        onclick={dismissInstall}
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-600"
      >
        Not now
      </button>
    </div>
  </div>
{/if}

<!-- Update Prompt -->
{#if showUpdatePrompt}
  <div class="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-green-50 border-green-200 p-4 shadow-lg dark:bg-green-900/20 dark:border-green-800">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
          Update Available
        </h3>
        <p class="mt-1 text-sm text-green-700 dark:text-green-300">
          A new version is available. Update for the latest features and improvements.
        </p>
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <button 
        onclick={handleUpdate}
        class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      >
        Update Now
      </button>
      <button 
        onclick={handleUpdateLater}
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-green-800 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-50 dark:bg-green-900/50 dark:text-green-200 dark:ring-green-700 dark:hover:bg-green-900/70"
      >
        Later
      </button>
    </div>
  </div>
{/if}

<!-- Offline Banner -->
{#if showOfflineBanner}
  <div class="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white">
    <div class="px-4 py-2 text-center text-sm">
      <div class="flex items-center justify-center gap-2">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        You're offline. Some features may be limited.
      </div>
    </div>
  </div>
{/if}
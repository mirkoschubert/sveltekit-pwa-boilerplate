import { writable } from 'svelte/store'
import { browser } from '$app/environment'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
    prompt(): Promise<void>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  hasUpdate: boolean
  isOffline: boolean
  updateAvailable: boolean
  currentVersion: string | null
  latestVersion: string | null
}

const initialState: PWAState = {
  isInstallable: false,
  isInstalled: false,
  hasUpdate: false,
  isOffline: false,
  updateAvailable: false,
  currentVersion: null,
  latestVersion: null
}

export const pwaState = writable<PWAState>(initialState)

let deferredPrompt: BeforeInstallPromptEvent | null = null

// Service Worker registration
let swRegistration: ServiceWorkerRegistration | null = null

export const pwaActions = {
  async initialize() {
    if (!browser || !('serviceWorker' in navigator)) {
      return
    }

    // Only register service worker in production
    if (import.meta.env.DEV) {
      console.log('[PWA] Service worker disabled in development')
      return
    }

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInstalled =
      (navigator as { standalone?: boolean }).standalone || isStandalone

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      pwaState.update((state) => ({ ...state, isInstallable: true }))
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null
      pwaState.update((state) => ({
        ...state,
        isInstallable: false,
        isInstalled: true
      }))
    })

    // Listen for online/offline status
    const updateOnlineStatus = () => {
      pwaState.update((state) => ({ ...state, isOffline: !navigator.onLine }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    // Get current version and register service worker with version
    try {
      const versionResponse = await fetch('/_app/version.json')
      const versionData = await versionResponse.json()
      const currentVersion = versionData.version

      console.log('[PWA] Initializing with version:', {
        version: currentVersion,
        isInstalled,
        swUrl: `/service-worker.js?v=${currentVersion}`
      })

      pwaState.update((state) => ({
        ...state,
        isInstalled,
        currentVersion,
        latestVersion: currentVersion,
        updateAvailable: false,
        hasUpdate: false
      }))

      // Register service worker with versioned URL
      const swUrl = `/service-worker.js?v=${currentVersion}`
      swRegistration = await navigator.serviceWorker.register(swUrl)

      console.log(
        '[PWA] Service worker registered with version:',
        currentVersion
      )

      // Listen for service worker events for debugging purposes only
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration?.installing
        if (!newWorker) return

        console.log('[PWA] New service worker installing (debug only)')

        newWorker.addEventListener('statechange', () => {
          console.log('[PWA] Service worker state changed:', newWorker.state)

          if (newWorker.state === 'activated') {
            console.log('[PWA] New service worker activated')
          }
        })
      })

      // Check for existing waiting service worker (debug info only)
      if (swRegistration.waiting) {
        console.log('[PWA] Service worker update waiting (debug info)')
      }

      // Start periodic version checking
      this.startVersionPolling()
    } catch (error) {
      console.error(
        'Service Worker registration or version fetch failed:',
        error
      )
      // Fallback to non-versioned registration
      try {
        swRegistration =
          await navigator.serviceWorker.register('/service-worker.js')
        console.log('[PWA] Fallback: Service worker registered without version')
      } catch (fallbackError) {
        console.error(
          'Fallback service worker registration failed:',
          fallbackError
        )
      }
    }
  },

  async install() {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      deferredPrompt = null
      pwaState.update((state) => ({ ...state, isInstallable: false }))
      return true
    }

    return false
  },

  async updateApp() {
    console.log('[PWA] Starting app update process')

    // Clear update state before reload
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false,
      hasUpdate: false
    }))

    if (!swRegistration?.waiting) {
      // If no waiting worker, try refreshing to get new version
      console.log('[PWA] No waiting worker, refreshing page for updates')
      window.location.reload()
      return
    }

    console.log('[PWA] Activating waiting service worker')
    // Send message to service worker to skip waiting
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Reload the page to activate the new service worker
    window.location.reload()
  },

  async checkForUpdates() {
    if (!browser) return

    try {
      // Check for new version
      const versionResponse = await fetch('/_app/version.json', {
        cache: 'no-store'
      })
      const versionData = await versionResponse.json()
      const latestVersion = versionData.version

      pwaState.update((state) => {
        const hasNewVersion =
          state.currentVersion && state.currentVersion !== latestVersion

        console.log('[PWA] Version check result:', {
          current: state.currentVersion,
          latest: latestVersion,
          hasVersionDifference: hasNewVersion,
          willShowUpdate: hasNewVersion,
          previousUpdateState: {
            updateAvailable: state.updateAvailable,
            hasUpdate: state.hasUpdate
          }
        })

        return {
          ...state,
          latestVersion,
          updateAvailable: !!hasNewVersion,
          hasUpdate: !!hasNewVersion
        }
      })

      // If there's a version difference, the next page load will get the new SW
      if (swRegistration) {
        await swRegistration.update()
      }
    } catch (error) {
      console.error('[PWA] Failed to check for updates:', error)
    }
  },

  startVersionPolling() {
    if (!browser) return

    // Check for updates every 15 minutes
    const pollInterval = 15 * 60 * 1000 // 15 minutes

    const poll = async () => {
      await this.checkForUpdates()
      setTimeout(poll, pollInterval)
    }

    // Start first check after 5 seconds
    setTimeout(poll, 5000)
    console.log('[PWA] Started version polling (every 15 minutes)')
  },

  // Reset update state (useful for debugging or after failed updates)
  resetUpdateState() {
    console.log('[PWA] Resetting update state')
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false,
      hasUpdate: false
    }))
  }
}

// Auto-initialize when module is imported
if (browser) {
  pwaActions.initialize()
}

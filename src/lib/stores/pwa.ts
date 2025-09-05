import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { updated } from '$app/state'

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
  isOffline: boolean
  updateAvailable: boolean
}

const initialState: PWAState = {
  isInstallable: false,
  isInstalled: false,
  isOffline: false,
  updateAvailable: false
}

export const pwaState = writable<PWAState>(initialState)

let deferredPrompt: BeforeInstallPromptEvent | null = null

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

    // Register service worker (let SvelteKit handle updates)
    try {
      await navigator.serviceWorker.register('/service-worker.js')
      console.log('[PWA] Service worker registered successfully')

      pwaState.update((state) => ({
        ...state,
        isInstalled,
        updateAvailable: updated.current // Use SvelteKit's native update detection
      }))

      // Note: SvelteKit's native polling will handle update detection
      // We just need to listen to SvelteKit's updated state
      console.log('[PWA] SvelteKit native polling enabled - updates handled automatically')
    } catch (error) {
      console.error('Service Worker registration failed:', error)
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
    console.log('[PWA] Starting app update process - reloading page')

    // Clear update state before reload
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false
    }))

    // Simple reload - let SvelteKit handle the service worker update
    window.location.reload()
  },

  async checkForUpdates() {
    if (!browser) return

    // Use SvelteKit's native update check
    const hasUpdate = await updated.check()
    
    pwaState.update((state) => ({
      ...state,
      updateAvailable: hasUpdate || updated.current
    }))

    console.log('[PWA] SvelteKit update check result:', {
      hasUpdate,
      updatedCurrent: updated.current,
      updateAvailable: hasUpdate || updated.current
    })
  },


  // Reset update state (useful for debugging or after failed updates)
  resetUpdateState() {
    console.log('[PWA] Resetting update state')
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false
    }))
  }
}

// Monitor app state updates
if (browser) {
  // Log initial updated state
  console.log('[PWA] Initial app state updated value:', updated.current)
}

// Auto-initialize when module is imported
if (browser) {
  pwaActions.initialize()
}

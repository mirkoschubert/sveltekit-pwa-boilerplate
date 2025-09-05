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
    console.log('[PWA] 🔄 Starting simple update process')
    
    // Clear update state
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false
    }))

    // Simple reload - let SvelteKit handle SW lifecycle
    console.log('[PWA] 📄 Reloading to activate new version')
    window.location.reload()
  },

  async checkForUpdates() {
    if (!browser) return

    // Use SvelteKit's native update check - it handles SW updates automatically
    const hasUpdate = await updated.check()
    
    console.log('[PWA] SvelteKit native update check:', {
      hasUpdate,
      updatedCurrent: updated.current
    })

    // Update state based on SvelteKit's detection
    pwaState.update((state) => ({
      ...state,
      updateAvailable: hasUpdate || updated.current
    }))
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

// Reactive wrapper for SvelteKit's updated.current (since it's not reactive in stores)
if (browser) {
  let lastUpdatedState = updated.current
  console.log('[PWA] Initial app state updated value:', lastUpdatedState)
  
  // Monitor updated.current changes with interval (since it's not reactive in plain JS)
  const monitorUpdatedState = () => {
    const currentState = updated.current
    
    if (currentState !== lastUpdatedState) {
      console.log('[PWA] SvelteKit updated.current changed:', {
        from: lastUpdatedState,
        to: currentState,
        timestamp: new Date().toISOString()
      })
      
      lastUpdatedState = currentState
      
      // If updated.current became true, trigger update notification
      if (currentState === true) {
        console.log('🎯 [PWA] Automatic update detection triggered')
        console.log('[PWA] 🔍 Debug info at update detection:', {
          updatedCurrent: updated.current,
          hasServiceWorker: !!navigator.serviceWorker,
          controllerExists: !!navigator.serviceWorker.controller
        })
        
        pwaState.update((state) => ({
          ...state,
          updateAvailable: true
        }))
        console.log('[PWA] ✅ PWA state updated - toast should appear')
      }
    }
  }
  
  // Check every 2 seconds for updated.current changes
  setInterval(monitorUpdatedState, 2000)
  console.log('[PWA] Started monitoring updated.current changes (every 2 seconds)')
}

// Auto-initialize when module is imported
if (browser) {
  pwaActions.initialize()
}

import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  hasUpdate: boolean
  isOffline: boolean
  updateAvailable: boolean
}

const initialState: PWAState = {
  isInstallable: false,
  isInstalled: false,
  hasUpdate: false,
  isOffline: false,
  updateAvailable: false
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
    const isInstalled = (navigator as any).standalone || isStandalone
    
    pwaState.update(state => ({
      ...state,
      isInstalled
    }))

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      pwaState.update(state => ({ ...state, isInstallable: true }))
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null
      pwaState.update(state => ({
        ...state,
        isInstallable: false,
        isInstalled: true
      }))
    })

    // Listen for online/offline status
    const updateOnlineStatus = () => {
      pwaState.update(state => ({ ...state, isOffline: !navigator.onLine }))
    }
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    // Register service worker
    try {
      swRegistration = await navigator.serviceWorker.register('/service-worker.js')
      
      // Listen for updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration?.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            pwaState.update(state => ({ ...state, hasUpdate: true, updateAvailable: true }))
          }
        })
      })

      // Check for existing update
      if (swRegistration.waiting) {
        pwaState.update(state => ({ ...state, hasUpdate: true, updateAvailable: true }))
      }

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
      pwaState.update(state => ({ ...state, isInstallable: false }))
      return true
    }
    
    return false
  },

  async updateApp() {
    if (!swRegistration?.waiting) return
    
    // Send message to service worker to skip waiting
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // Reload the page to activate the new service worker
    window.location.reload()
  },

  async checkForUpdates() {
    if (!swRegistration) return
    
    try {
      await swRegistration.update()
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }
}

// Auto-initialize when module is imported
if (browser) {
  pwaActions.initialize()
}
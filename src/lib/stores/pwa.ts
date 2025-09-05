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
    console.log('🔄 [PWA] ========== UPDATE PROCESS STARTED ==========')
    
    // Clear update state immediately
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false
    }))

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      
      console.log('[PWA] 🔍 Service Worker registration state:', {
        hasRegistration: !!registration,
        hasActive: !!registration?.active,
        hasWaiting: !!registration?.waiting,
        hasInstalling: !!registration?.installing,
        activeState: registration?.active?.state,
        waitingState: registration?.waiting?.state,
        activeScriptURL: registration?.active?.scriptURL,
        waitingScriptURL: registration?.waiting?.scriptURL
      })

      if (registration?.waiting) {
        console.log('[PWA] ✅ Found waiting service worker - sending SKIP_WAITING')
        
        // Set up controller change listener before sending message
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] 🎯 Controller changed - new SW is now active!')
          console.log('[PWA] 🔄 WOULD reload page to use new service worker (disabled for debugging)')
          // window.location.reload() // DISABLED for debugging
        }, { once: true })
        
        // Send skip waiting message
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        console.log('[PWA] 📤 SKIP_WAITING message sent to waiting SW')
        
        // Backup timeout in case controllerchange doesn't fire
        setTimeout(() => {
          console.log('[PWA] ⏰ Backup timeout - WOULD reload anyway (disabled for debugging)')
          // window.location.reload() // DISABLED for debugging
        }, 3000)
        
      } else {
        console.log('[PWA] ❌ No waiting SW found - using fallback reload')
        console.log('[PWA] 🔄 WOULD do simple page reload for update (disabled for debugging)')
        // window.location.reload() // DISABLED for debugging
      }
      
    } catch (error) {
      console.error('[PWA] ❌ Update process failed:', error)
      console.log('[PWA] 🔄 Fallback: WOULD do simple page reload (disabled for debugging)')
      // window.location.reload() // DISABLED for debugging
    }
  },

  async checkForUpdates() {
    if (!browser) return

    // Use SvelteKit's native update check
    const hasUpdate = await updated.check()
    
    console.log('[PWA] SvelteKit update check result:', {
      hasUpdate,
      updatedCurrent: updated.current,
      updateAvailable: hasUpdate || updated.current
    })

    // If update detected, fetch and register new service worker
    if (hasUpdate || updated.current) {
      console.log('[PWA] 🎯 Update detected - fetching new service worker')
      await this.fetchAndRegisterNewSW()
    }
  },

  async fetchAndRegisterNewSW() {
    try {
      console.log('[PWA] 📥 Fetching version.json for new service worker')
      
      // Get the new version from version.json
      const versionResponse = await fetch('/_app/version.json', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const versionData = await versionResponse.json()
      const newVersion = versionData.version
      
      console.log('[PWA] 📊 Version info:', {
        newVersion,
        timestamp: new Date().toISOString()
      })

      // First unregister any existing service worker
      console.log('[PWA] 🗑️ Unregistering existing service worker first')
      const existingRegistration = await navigator.serviceWorker.getRegistration()
      if (existingRegistration) {
        console.log('[PWA] 📤 Found existing SW registration:', existingRegistration.scope)
        const unregistered = await existingRegistration.unregister()
        console.log('[PWA] ✅ Existing SW unregistered:', unregistered)
      } else {
        console.log('[PWA] ℹ️ No existing SW registration found')
      }

      // Register new service worker with version query parameter
      const swUrl = `/service-worker.js?v=${newVersion}`
      console.log('[PWA] 🔄 Registering new service worker:', swUrl)
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        updateViaCache: 'none' // Force fresh fetch
      })
      
      console.log('[PWA] ✅ New SW registration initiated')
      
      // Wait for the new service worker to reach waiting state
      await this.waitForWaitingSW(registration)
      
      console.log('[PWA] 🎯 New service worker ready and waiting for activation')
      
      // Now update the state to show the update is available
      pwaState.update((state) => ({
        ...state,
        updateAvailable: true
      }))
      
    } catch (error) {
      console.error('[PWA] ❌ Failed to fetch new service worker:', error)
      
      // Fallback: still show update available (will use simple reload)
      pwaState.update((state) => ({
        ...state,
        updateAvailable: true
      }))
    }
  },

  async waitForWaitingSW(registration: ServiceWorkerRegistration) {
    return new Promise((resolve) => {
      console.log('[PWA] ⏳ Waiting for service worker to reach waiting state')
      
      // Check if already waiting
      if (registration.waiting) {
        console.log('[PWA] ✅ Service worker already in waiting state')
        resolve(registration.waiting)
        return
      }
      
      // Check if installing and will become waiting
      if (registration.installing) {
        console.log('[PWA] 🔄 Service worker installing - waiting for completion')
        registration.installing.addEventListener('statechange', (e: Event) => {
          if ((e.target as ServiceWorker).state === 'installed') {
            console.log('[PWA] ✅ Service worker finished installing, now waiting')
            resolve(registration.waiting)
          }
        })
        return
      }
      
      // Listen for new service worker to start installing
      registration.addEventListener('updatefound', () => {
        console.log('[PWA] 🔄 Update found - new service worker installing')
        const newSW = registration.installing
        
        if (newSW) {
          newSW.addEventListener('statechange', (e: Event) => {
            if ((e.target as ServiceWorker).state === 'installed') {
              console.log('[PWA] ✅ New service worker installed and waiting')
              resolve(registration.waiting)
            }
          })
        }
      })
      
      // Timeout fallback (shouldn't happen but just in case)
      setTimeout(() => {
        console.log('[PWA] ⏰ Timeout waiting for SW - resolving anyway')
        resolve(registration.waiting || null)
      }, 10000)
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

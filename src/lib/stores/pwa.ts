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
  initialize() {
    if (!browser || !('serviceWorker' in navigator)) {
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

    // Set initial state
    pwaState.update((state) => ({
      ...state,
      isInstalled,
      updateAvailable: updated.current
    }))

    console.log(
      '[PWA] PWA actions initialized - service worker registration handled externally'
    )
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

  async triggerServiceWorkerUpdate() {
    console.log('[PWA] 🔄 Manually triggering service worker update')

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration) {
        console.log('[PWA] 📍 Found SW registration, calling update()')
        await registration.update()
        console.log('[PWA] ✅ Service worker update triggered successfully')

        // Check if we now have a waiting service worker
        if (registration.waiting) {
          console.log('[PWA] 🎯 New service worker is waiting for activation')
        } else {
          console.log('[PWA] ⏳ Waiting for new service worker to install...')
        }
      } else {
        console.log('[PWA] ❌ No service worker registration found')
      }
    } catch (error) {
      console.error('[PWA] ❌ Failed to trigger service worker update:', error)
    }
  },

  async updateApp() {
    console.log('[PWA] 🔄 Starting app update process')

    // Clear update state
    pwaState.update((state) => ({
      ...state,
      updateAvailable: false
    }))

    try {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration?.waiting) {
        console.log('[PWA] ✅ Found waiting service worker - activating it')

        // Listen for controller change before sending skip waiting
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            console.log('[PWA] 🎯 Controller changed - new SW is now active!')
            console.log('[PWA] 🔄 Reloading page to use new version')
            window.location.reload()
          },
          { once: true }
        )

        // Send skip waiting message
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        console.log('[PWA] 📤 SKIP_WAITING message sent to waiting SW')

        // Backup timeout
        setTimeout(() => {
          console.log('[PWA] ⏰ Backup timeout - reloading anyway')
          window.location.reload()
        }, 3000)
      } else {
        console.log('[PWA] ❌ No waiting SW - doing simple reload')
        window.location.reload()
      }
    } catch (error) {
      console.error('[PWA] ❌ Update process failed:', error)
      window.location.reload()
    }
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
  const monitorUpdatedState = async () => {
    const currentState = updated.current

    if (currentState !== lastUpdatedState) {
      console.log('[PWA] SvelteKit updated.current changed:', {
        from: lastUpdatedState,
        to: currentState,
        timestamp: new Date().toISOString()
      })

      lastUpdatedState = currentState

      // If updated.current became true, trigger SW update + notification
      if (currentState === true) {
        console.log('🎯 [PWA] Automatic update detection triggered')
        console.log('[PWA] 🔍 Debug info at update detection:', {
          updatedCurrent: updated.current,
          hasServiceWorker: !!navigator.serviceWorker,
          controllerExists: !!navigator.serviceWorker.controller
        })

        // Trigger manual service worker update (SvelteKit doesn't do this!)
        await pwaActions.triggerServiceWorkerUpdate()

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
  console.log(
    '[PWA] Started monitoring updated.current changes (every 2 seconds)'
  )
}

// Note: PWA actions will be initialized manually from +layout.svelte

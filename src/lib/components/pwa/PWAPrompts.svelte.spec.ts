import { page } from '@vitest/browser/context'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import PWAPrompts from './PWAPrompts.svelte'

// Mock the PWA store
const mockPwaState = {
  subscribe: vi.fn()
}

const mockPwaActions = {
  install: vi.fn(),
  updateApp: vi.fn()
}

vi.mock('$lib/stores/pwa', () => ({
  pwaState: mockPwaState,
  pwaActions: mockPwaActions
}))

vi.mock('svelte-sonner', () => ({
  toast: vi.fn()
}))

describe('PWAPrompts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', async () => {
    // Mock the subscribe function to not trigger any prompts
    mockPwaState.subscribe.mockImplementation((callback) => {
      callback({
        isInstallable: false,
        isInstalled: false,
        isOffline: false,
        updateAvailable: false
      })
      return () => {} // unsubscribe function
    })

    render(PWAPrompts)

    // Component should render without any prompts visible
    // Since no prompts are triggered, we just verify the component rendered successfully
    // by checking that no error was thrown during render
  })

  it('should subscribe to PWA state on mount', async () => {
    mockPwaState.subscribe.mockImplementation((callback) => {
      callback({
        isInstallable: false,
        isInstalled: false,
        isOffline: false,
        updateAvailable: false
      })
      return () => {}
    })

    render(PWAPrompts)

    expect(mockPwaState.subscribe).toHaveBeenCalledOnce()
  })
})
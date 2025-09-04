import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import PWAPrompts from './PWAPrompts.svelte'

// Simplified test without complex mocking

describe('PWAPrompts', () => {
  it('should render without crashing', async () => {
    // Simple smoke test - just verify component can render
    // The component will use real PWA store but shouldn't crash
    expect(() => render(PWAPrompts)).not.toThrow()
  })
})
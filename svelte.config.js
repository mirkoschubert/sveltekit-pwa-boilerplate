import adapter from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    version: {
      // Enable SvelteKit's native service worker polling (30 seconds for testing)
      pollInterval: 30000
    },
    prerender: {
      handleHttpError: ({ path, message }) => {
        // Ignore 404s for PWA icons during prerender - they exist but aren't found during build
        if (path.startsWith('/icons/') && message.includes('404')) {
          console.warn(`Ignoring 404 for PWA icon: ${path}`)
          return
        }

        // For other errors, throw to fail the build
        throw new Error(`${message} (${path})`)
      }
    }
  }
}

export default config

import netlifyAdapter from '@sveltejs/adapter-netlify'
import vercelAdapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Environment-based adapter selection
const isVercel = process.env.DEPLOY_TARGET === 'vercel'
const adapter = isVercel ? vercelAdapter() : netlifyAdapter()

console.log(`🚀 Using ${isVercel ? 'Vercel' : 'Netlify'} adapter`)

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter,
    version: {
      // Enable SvelteKit's native service worker polling (30 seconds for testing)
      name: Date.now().toString(),
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

import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)

  if (
    event.url.pathname.includes('service-worker.js') ||
    event.url.pathname.includes('sw.js')
  ) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  return response
}

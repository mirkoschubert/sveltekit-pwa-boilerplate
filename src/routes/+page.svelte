<script lang="ts">
  import { pwaState, pwaActions } from '$lib/stores/pwa'
  import { onMount } from 'svelte'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'

  let installationStatus = $state('unknown')
  let serviceWorkerStatus = $state('unknown')
  let isOffline = $state(false)

  onMount(() => {
    return pwaState.subscribe((state) => {
      installationStatus = state.isInstalled
        ? 'installed'
        : state.isInstallable
          ? 'installable'
          : 'not-installable'
      isOffline = state.isOffline
    })
  })

  onMount(() => {
    if ('serviceWorker' in navigator) {
      serviceWorkerStatus = 'supported'
      navigator.serviceWorker.ready
        .then(() => {
          serviceWorkerStatus = 'ready'
        })
        .catch(() => {
          serviceWorkerStatus = 'error'
        })
    } else {
      serviceWorkerStatus = 'not-supported'
    }
  })

  async function checkForUpdates() {
    await pwaActions.checkForUpdates()
  }
</script>

<div class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="mb-16 text-center">
      <h1 class="mb-6 text-5xl font-bold text-foreground">
        SvelteKit PWA Boilerplate
      </h1>
      <p class="mb-8 text-xl text-muted-foreground">
        A modern Progressive Web App built with SvelteKit, Svelte 5, TypeScript,
        and shadcn-svelte
      </p>

      <!-- Status Cards -->
      <div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- PWA Status -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-primary">PWA Status</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Installation:</span>
              <Badge
                variant={installationStatus === 'installed'
                  ? 'default'
                  : installationStatus === 'installable'
                    ? 'secondary'
                    : 'outline'}
                class="capitalize"
              >
                {installationStatus}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Service Worker:</span>
              <Badge
                variant={serviceWorkerStatus === 'ready'
                  ? 'default'
                  : serviceWorkerStatus === 'supported'
                    ? 'secondary'
                    : 'outline'}
                class="capitalize"
              >
                {serviceWorkerStatus}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Network:</span>
              <Badge variant={isOffline ? 'destructive' : 'default'}>
                {isOffline ? 'Offline' : 'Online'}
              </Badge>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Features -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-chart-2">Features</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex items-center gap-2">
                <svg
                  class="h-4 w-4 text-chart-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Offline Support
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="h-4 w-4 text-chart-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Auto Updates
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="h-4 w-4 text-chart-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Install Prompt
              </li>
              <li class="flex items-center gap-2">
                <svg
                  class="h-4 w-4 text-chart-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Vercel Ready
              </li>
            </ul>
          </Card.Content>
        </Card.Root>

        <!-- Tech Stack -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-chart-3">Tech Stack</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>SvelteKit 2.0</li>
              <li>Svelte 5 (Runes)</li>
              <li>TypeScript (strict)</li>
              <li>Tailwind CSS 4.0</li>
              <li>shadcn-svelte</li>
              <li>ESLint + Prettier</li>
              <li>Playwright + Vitest</li>
            </ul>
          </Card.Content>
        </Card.Root>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-4 text-center">
      <Button onclick={checkForUpdates} size="lg">Check for Updates</Button>

      <div class="text-sm text-muted-foreground">
        <p>Try going offline to test PWA functionality</p>
        <p>Install this app for the full experience</p>
      </div>
    </div>

    <!-- Links -->
    <div class="mt-16 space-y-4 text-center">
      <h2 class="mb-6 text-2xl font-semibold text-foreground">Resources</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card.Root class="transition-colors hover:bg-accent">
          <a href="https://svelte.dev/docs/kit" target="_blank" class="block">
            <Card.Header>
              <Card.Title class="text-primary">SvelteKit Docs</Card.Title>
              <Card.Description>Official documentation</Card.Description>
            </Card.Header>
          </a>
        </Card.Root>
        <Card.Root class="transition-colors hover:bg-accent">
          <a
            href="https://svelte.dev/docs/svelte/introduction"
            target="_blank"
            class="block"
          >
            <Card.Header>
              <Card.Title class="text-chart-4">Svelte 5 Docs</Card.Title>
              <Card.Description>New runes API</Card.Description>
            </Card.Header>
          </a>
        </Card.Root>
        <Card.Root class="transition-colors hover:bg-accent">
          <a
            href="https://www.shadcn-svelte.com/"
            target="_blank"
            class="block"
          >
            <Card.Header>
              <Card.Title class="text-chart-1">shadcn-svelte</Card.Title>
              <Card.Description>UI components</Card.Description>
            </Card.Header>
          </a>
        </Card.Root>
      </div>
    </div>
  </div>
</div>

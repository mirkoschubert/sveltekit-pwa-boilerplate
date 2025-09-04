<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
</script>

<div class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="mb-16 text-center">
      <h1 class="mb-6 text-5xl font-bold text-foreground">About</h1>
      <p class="mb-8 text-xl text-muted-foreground">
        Learn more about this SvelteKit PWA Boilerplate project
      </p>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-4xl space-y-8">
      <!-- Project Info -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">Project Overview</Card.Title>
          <Card.Description>
            Modern Progressive Web App boilerplate for rapid development
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <p class="text-muted-foreground">
            This boilerplate provides a solid foundation for building modern
            Progressive Web Apps using the latest web technologies. It combines
            the power of SvelteKit with Svelte 5's new runes system, TypeScript
            for type safety, and a carefully curated set of tools for an optimal
            development experience.
          </p>
          <p class="text-muted-foreground">
            The project follows best practices for PWA implementation, including
            offline support, automatic updates, install prompts, and service
            worker optimization specifically tailored for Vercel deployment.
          </p>
        </Card.Content>
      </Card.Root>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-primary">Modern Stack</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• SvelteKit 2.0 with file-based routing</li>
              <li>• Svelte 5 with runes for reactive state</li>
              <li>• TypeScript in strict mode</li>
              <li>• Tailwind CSS 4.0 for styling</li>
              <li>• shadcn-svelte UI components</li>
            </ul>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title class="text-primary">PWA Features</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• Native service worker implementation</li>
              <li>• Offline functionality and caching</li>
              <li>• Install prompts and app-like behavior</li>
              <li>• Seamless background updates</li>
              <li>• Vercel-optimized deployment</li>
            </ul>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title class="text-primary">Developer Experience</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• Hot module replacement (HMR)</li>
              <li>• ESLint and Prettier configuration</li>
              <li>• Playwright for E2E testing</li>
              <li>• Vitest for unit testing</li>
              <li>• pnpm for fast package management</li>
            </ul>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title class="text-primary">Production Ready</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• Optimized build process</li>
              <li>• Static asset optimization</li>
              <li>• SEO-friendly meta tags</li>
              <li>• Accessible UI components</li>
              <li>• Security best practices</li>
            </ul>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Philosophy -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">Philosophy</Card.Title>
          <Card.Description>Simple, modern, and opinionated</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <p class="text-muted-foreground">
            This boilerplate follows an opinionated approach that prioritizes
            simplicity and modern best practices. Rather than including every
            possible feature, it focuses on providing a clean, well-structured
            foundation that you can build upon.
          </p>
          <p class="text-muted-foreground">
            Every tool and configuration has been carefully chosen to work
            together seamlessly, reducing setup time and potential conflicts.
            The goal is to let you focus on building your application rather
            than configuring your development environment.
          </p>
        </Card.Content>
      </Card.Root>

      <!-- Actions -->
      <div class="text-center">
        <Button onclick={() => history.back()} variant="outline" size="lg">
          Go Back
        </Button>
      </div>
    </div>
  </div>
</div>

<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
</script>

<div class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="mb-16 text-center">
      <h1 class="mb-6 text-5xl font-bold text-foreground">Documentation</h1>
      <p class="mb-8 text-xl text-muted-foreground">
        Get started with this SvelteKit PWA Boilerplate
      </p>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-4xl space-y-8">
      <!-- Getting Started -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">Getting Started</Card.Title>
          <Card.Description>Quick setup guide for development</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Prerequisites</h4>
            <ul class="space-y-1 pl-4 text-sm text-muted-foreground">
              <li>
                • Node.js 22 (use <code class="rounded bg-muted px-1"
                  >fnm use 22</code
                >)
              </li>
              <li>• pnpm package manager</li>
              <li>• Git for version control</li>
            </ul>
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Installation</h4>
            <div class="rounded-md bg-muted p-4 font-mono text-sm">
              <div class="space-y-1">
                <div class="text-muted-foreground"># Clone the repository</div>
                <div>git clone &lt;your-repo-url&gt;</div>
                <div class="text-muted-foreground"># Install dependencies</div>
                <div>pnpm install</div>
                <div class="text-muted-foreground">
                  # Start development server
                </div>
                <div>pnpm dev</div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Available Scripts -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">Available Scripts</Card.Title>
          <Card.Description
            >Commands for development and deployment</Card.Description
          >
        </Card.Header>
        <Card.Content>
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-muted px-2 py-1 text-sm"
                    >pnpm dev</code
                  >
                  <Badge variant="secondary">Development</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Start development server with HMR
                </p>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-muted px-2 py-1 text-sm"
                    >pnpm build</code
                  >
                  <Badge variant="secondary">Production</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Build optimized production bundle
                </p>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-muted px-2 py-1 text-sm"
                    >pnpm preview</code
                  >
                  <Badge variant="secondary">Preview</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Preview production build locally
                </p>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-muted px-2 py-1 text-sm"
                    >pnpm test</code
                  >
                  <Badge variant="secondary">Testing</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Run all tests (unit + E2E)
                </p>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-muted px-2 py-1 text-sm"
                    >pnpm lint</code
                  >
                  <Badge variant="secondary">Quality</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Lint code with ESLint
                </p>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-muted px-2 py-1 text-sm"
                    >pnpm check</code
                  >
                  <Badge variant="secondary">TypeScript</Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  Check TypeScript types
                </p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Project Structure -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">Project Structure</Card.Title>
          <Card.Description
            >Understanding the codebase organization</Card.Description
          >
        </Card.Header>
        <Card.Content>
          <div class="rounded-md bg-muted p-4 font-mono text-sm">
            <div class="space-y-1 text-muted-foreground">
              <div>src/</div>
              <div>├── lib/</div>
              <div>│ ├── components/</div>
              <div>
                │ │ ├── layout/ <span class="text-foreground"
                  ># Header, Footer, etc.</span
                >
              </div>
              <div>
                │ │ ├── pwa/ <span class="text-foreground"
                  ># PWA-specific components</span
                >
              </div>
              <div>
                │ │ ├── ui/ <span class="text-foreground"
                  ># shadcn-svelte components</span
                >
              </div>
              <div>
                │ │ └── index.ts <span class="text-foreground"
                  ># Component exports</span
                >
              </div>
              <div>
                │ ├── stores/ <span class="text-foreground"
                  ># Svelte stores</span
                >
              </div>
              <div>
                │ └── utils/ <span class="text-foreground"
                  ># Utility functions</span
                >
              </div>
              <div>
                ├── routes/ <span class="text-foreground"
                  ># SvelteKit routes</span
                >
              </div>
              <div>
                ├── service-worker.ts <span class="text-foreground"
                  ># PWA service worker</span
                >
              </div>
              <div>
                └── app.html <span class="text-foreground"># HTML template</span
                >
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- PWA Configuration -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">PWA Configuration</Card.Title>
          <Card.Description
            >Progressive Web App features and setup</Card.Description
          >
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Service Worker</h4>
            <p class="text-sm text-muted-foreground">
              The service worker is implemented using SvelteKit's native service
              worker support. It handles caching, offline functionality, and
              automatic updates without the need for additional plugins like
              VitePWA.
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Manifest & Icons</h4>
            <p class="text-sm text-muted-foreground">
              Generate PWA icons from your favicon.svg using the command:
            </p>
            <code class="rounded bg-muted px-2 py-1 text-sm"
              >pnpm run icons:generate</code
            >
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Update Strategy</h4>
            <p class="text-sm text-muted-foreground">
              The app automatically checks for updates and prompts users when
              new versions are available. Updates are applied seamlessly without
              requiring a page reload.
            </p>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Deployment -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-primary">Deployment</Card.Title>
          <Card.Description>Deploy your PWA to production</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Vercel (Recommended)</h4>
            <p class="text-sm text-muted-foreground">
              This project is optimized for Vercel deployment with zero
              configuration. Simply connect your repository to Vercel and
              deploy.
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-foreground">Other Platforms</h4>
            <p class="text-sm text-muted-foreground">
              For other deployment platforms, you may need to adjust the adapter
              in
              <code class="rounded bg-muted px-1">svelte.config.js</code> and ensure
              service worker paths are correctly configured.
            </p>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- External Resources -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
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
              <Card.Title class="text-primary">Svelte 5 Docs</Card.Title>
              <Card.Description>Runes API guide</Card.Description>
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
              <Card.Title class="text-primary">shadcn-svelte</Card.Title>
              <Card.Description>UI components</Card.Description>
            </Card.Header>
          </a>
        </Card.Root>
      </div>

      <!-- Actions -->
      <div class="text-center">
        <Button onclick={() => history.back()} variant="outline" size="lg">
          Go Back
        </Button>
      </div>
    </div>
  </div>
</div>

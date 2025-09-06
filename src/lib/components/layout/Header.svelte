<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { toggleMode } from 'mode-watcher'
  import { Sun, Moon } from '@lucide/svelte'
</script>

<header
  class="sticky top-0 z-40 w-full border-b bg-blue-500/95 backdrop-blur supports-[backdrop-filter]:bg-blue-500/60"
>
  <div class="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
    <!-- Logo/Title -->
    <div class="flex items-center space-x-2">
      <svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"
        />
      </svg>
      <span class="font-bold text-foreground">SvelteKit PWA</span>
    </div>

    <!-- Navigation -->
    <nav
      class="flex flex-1 items-center justify-center space-x-6 text-sm font-medium"
    >
      <a
        href="/"
        class="text-foreground/80 transition-colors hover:text-foreground"
      >
        Home
      </a>
      <a
        href="/about"
        class="text-muted-foreground transition-colors hover:text-foreground"
      >
        About
      </a>
      <a
        href="/docs"
        class="text-muted-foreground transition-colors hover:text-foreground"
      >
        Docs
      </a>
    </nav>

    <!-- Dark Mode Toggle -->
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onclick={toggleMode}
        aria-label="Toggle dark mode"
      >
        <Sun
          class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  </div>
</header>

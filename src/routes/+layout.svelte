<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import PWAPrompts from '$lib/components/PWAPrompts.svelte'
  import Header from '$lib/components/Header.svelte'
  import { Toaster } from 'svelte-sonner'
  import { ModeWatcher } from 'mode-watcher'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Header />

<main>
  {@render children?.()}
</main>

<PWAPrompts />
<Toaster position="top-right" />

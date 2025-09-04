<script lang="ts">
	import '../app.css'
	import favicon from '$lib/assets/favicon.svg'
	import PWAPrompts from '$lib/components/PWAPrompts.svelte'
	import { Toaster } from 'svelte-sonner'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
<PWAPrompts />
<Toaster theme="dark" position="top-right" />

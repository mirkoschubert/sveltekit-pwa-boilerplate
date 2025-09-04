<script lang="ts">
	import { pwaState, pwaActions } from '$lib/stores/pwa'
	import { onMount } from 'svelte'

	let installationStatus = $state('unknown')
	let serviceWorkerStatus = $state('unknown')
	let isOffline = $state(false)

	onMount(() => {
		return pwaState.subscribe((state) => {
			installationStatus = state.isInstalled ? 'installed' : state.isInstallable ? 'installable' : 'not-installable'
			isOffline = state.isOffline
		})
	})

	onMount(() => {
		if ('serviceWorker' in navigator) {
			serviceWorkerStatus = 'supported'
			navigator.serviceWorker.ready.then(() => {
				serviceWorkerStatus = 'ready'
			}).catch(() => {
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

<div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
	<div class="container mx-auto px-4 py-16">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
				SvelteKit PWA Boilerplate
			</h1>
			<p class="text-xl text-slate-300 mb-8">
				A modern Progressive Web App built with SvelteKit, Svelte 5, TypeScript, and shadcn-svelte
			</p>
			
			<!-- Status Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
				<!-- PWA Status -->
				<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
					<h3 class="text-lg font-semibold mb-3 text-blue-400">PWA Status</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span>Installation:</span>
							<span class="capitalize {installationStatus === 'installed' ? 'text-green-400' : installationStatus === 'installable' ? 'text-yellow-400' : 'text-gray-400'}">
								{installationStatus}
							</span>
						</div>
						<div class="flex justify-between">
							<span>Service Worker:</span>
							<span class="capitalize {serviceWorkerStatus === 'ready' ? 'text-green-400' : serviceWorkerStatus === 'supported' ? 'text-yellow-400' : 'text-gray-400'}">
								{serviceWorkerStatus}
							</span>
						</div>
						<div class="flex justify-between">
							<span>Network:</span>
							<span class="{isOffline ? 'text-red-400' : 'text-green-400'}">
								{isOffline ? 'Offline' : 'Online'}
							</span>
						</div>
					</div>
				</div>

				<!-- Features -->
				<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
					<h3 class="text-lg font-semibold mb-3 text-purple-400">Features</h3>
					<ul class="space-y-2 text-sm text-slate-300">
						<li class="flex items-center gap-2">
							<svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							Offline Support
						</li>
						<li class="flex items-center gap-2">
							<svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							Auto Updates
						</li>
						<li class="flex items-center gap-2">
							<svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							Install Prompt
						</li>
						<li class="flex items-center gap-2">
							<svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							Vercel Ready
						</li>
					</ul>
				</div>

				<!-- Tech Stack -->
				<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
					<h3 class="text-lg font-semibold mb-3 text-green-400">Tech Stack</h3>
					<ul class="space-y-2 text-sm text-slate-300">
						<li>SvelteKit 2.0</li>
						<li>Svelte 5 (Runes)</li>
						<li>TypeScript (strict)</li>
						<li>Tailwind CSS 4.0</li>
						<li>shadcn-svelte</li>
						<li>ESLint + Prettier</li>
						<li>Playwright + Vitest</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="text-center space-y-4">
			<button 
				onclick={checkForUpdates}
				class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Check for Updates
			</button>
			
			<div class="text-sm text-slate-400">
				<p>Try going offline to test PWA functionality</p>
				<p>Install this app for the full experience</p>
			</div>
		</div>

		<!-- Links -->
		<div class="mt-16 text-center space-y-4">
			<h2 class="text-2xl font-semibold mb-6">Resources</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<a 
					href="https://svelte.dev/docs/kit" 
					target="_blank"
					class="block p-4 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
				>
					<h3 class="font-semibold text-blue-400 mb-2">SvelteKit Docs</h3>
					<p class="text-sm text-slate-300">Official documentation</p>
				</a>
				<a 
					href="https://svelte.dev/docs/svelte/introduction" 
					target="_blank"
					class="block p-4 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
				>
					<h3 class="font-semibold text-purple-400 mb-2">Svelte 5 Docs</h3>
					<p class="text-sm text-slate-300">New runes API</p>
				</a>
				<a 
					href="https://www.shadcn-svelte.com/" 
					target="_blank"
					class="block p-4 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
				>
					<h3 class="font-semibold text-green-400 mb-2">shadcn-svelte</h3>
					<p class="text-sm text-slate-300">UI components</p>
				</a>
			</div>
		</div>
	</div>
</div>

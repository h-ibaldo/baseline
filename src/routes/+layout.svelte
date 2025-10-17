<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	function navigateTo(path: string) {
		goto(path);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Baseline - Professional Design Tool</title>
</svelte:head>

<div class="app-layout">
	<!-- Navigation -->
	{#if $page.url.pathname.startsWith('/admin')}
		<nav class="admin-nav">
			<div class="nav-content">
				<div class="nav-brand">
					<button on:click={() => navigateTo('/')} class="brand-link">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
						</svg>
						<span class="brand-text">Baseline</span>
					</button>
				</div>
				
				<div class="nav-links">
					<button 
						class="nav-link" 
						class:active={$page.url.pathname === '/admin/designer'}
						on:click={() => navigateTo('/admin/designer')}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
						</svg>
						Designer
					</button>
					<button 
						class="nav-link" 
						class:active={$page.url.pathname === '/admin/blog'}
						on:click={() => navigateTo('/admin/blog')}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Blog
					</button>
					<button 
						class="nav-link" 
						class:active={$page.url.pathname === '/admin/pages'}
						on:click={() => navigateTo('/admin/pages')}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Pages
					</button>
					<button 
						class="nav-link" 
						class:active={$page.url.pathname === '/admin/media'}
						on:click={() => navigateTo('/admin/media')}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Media
					</button>
				</div>
			</div>
		</nav>
	{/if}

	<!-- Main Content -->
	<main class="main-content">
		<slot />
	</main>
</div>

<style>
	.app-layout {
		@apply min-h-screen bg-gray-50;
	}

	.admin-nav {
		@apply bg-white border-b border-gray-200 shadow-sm;
	}

	.nav-content {
		@apply max-w-7xl mx-auto px-4 py-3;
	}

	.nav-brand {
		@apply flex items-center;
	}

	.brand-link {
		@apply flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors;
	}

	.brand-text {
		@apply text-xl font-bold;
	}

	.nav-links {
		@apply flex items-center gap-1 mt-4 sm:mt-0;
	}

	.nav-link {
		@apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors;
	}

	.nav-link.active {
		@apply text-blue-600 bg-blue-50;
	}

	.main-content {
		@apply flex-1;
	}

	@media (min-width: 640px) {
		.nav-content {
			@apply flex items-center justify-between;
		}
		
		.nav-links {
			@apply mt-0;
		}
	}
</style>

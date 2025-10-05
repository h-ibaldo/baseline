<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const { page } = data;
</script>

<svelte:head>
	<title>{page.metaTitle || page.title}</title>
	{#if page.metaDescription}
		<meta name="description" content={page.metaDescription} />
	{/if}
	{#if page.metaImage}
		<meta property="og:image" content={page.metaImage} />
	{/if}
	{#if page.css}
		<style>
			{@html page.css}
		</style>
	{/if}
</svelte:head>

{#if page.html}
	{@html page.html}
{:else}
	<div class="error">
		<h1>Page content not available</h1>
		<p>This page has not been published yet.</p>
	</div>
{/if}

<style>
	.error {
		max-width: 600px;
		margin: 4rem auto;
		padding: 2rem;
		text-align: center;
	}

	.error h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #991b1b;
	}

	.error p {
		color: #666;
	}
</style>


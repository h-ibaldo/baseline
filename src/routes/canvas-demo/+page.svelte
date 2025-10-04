<script lang="ts">
	/**
	 * Canvas Demo Page
	 * Test page for infinite canvas with multiple artboards
	 */
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import Artboard from '$lib/components/canvas/Artboard.svelte';
	import type { CanvasConfig, Artboard as ArtboardType } from '$lib/types/canvas';

	// Canvas configuration
	let canvasConfig: CanvasConfig = {
		backgroundColor: '#f0f0f0',
		maxArtboards: 10,
		showPerformanceWarning: true
	};

	// Sample artboards for testing
	let artboards: ArtboardType[] = [
		{
			id: 'artboard-1',
			name: 'Desktop',
			x: 100,
			y: 100,
			width: 1200,
			height: 800,
			backgroundColor: '#ffffff',
			showGrid: true,
			gridSize: 20,
			isPublishTarget: true
		},
		{
			id: 'artboard-2',
			name: 'Mobile',
			x: 1400,
			y: 100,
			width: 375,
			height: 812,
			backgroundColor: '#ffffff',
			showGrid: true,
			gridSize: 10,
			isPublishTarget: false
		}
	];

	// Add new artboard
	function addArtboard() {
		if (artboards.length >= (canvasConfig.maxArtboards || 10)) {
			alert(`Maximum ${canvasConfig.maxArtboards} artboards allowed for performance`);
			return;
		}
		
		const newArtboard: ArtboardType = {
			id: `artboard-${Date.now()}`,
			name: `Artboard ${artboards.length + 1}`,
			x: 100 + (artboards.length * 200),
			y: 1000,
			width: 800,
			height: 600,
			backgroundColor: '#ffffff',
			showGrid: true,
			gridSize: 20,
			isPublishTarget: false
		};
		artboards = [...artboards, newArtboard];
	}
</script>

<svelte:head>
	<title>Canvas Demo - Baseline</title>
</svelte:head>

<main>
	<header>
		<h1>Canvas Demo</h1>
		<p>Infinite canvas with multiple artboards (Figma/Illustrator style)</p>
	</header>

	<div class="controls">
		<label>
			Canvas Background:
			<input type="color" bind:value={canvasConfig.backgroundColor} />
		</label>
		
		<button on:click={addArtboard}>
			+ Add Artboard ({artboards.length}/{canvasConfig.maxArtboards})
		</button>
	</div>

	<div class="canvas-wrapper">
		<Canvas config={canvasConfig}>
			{#each artboards as artboard (artboard.id)}
				<Artboard {artboard} />
			{/each}
		</Canvas>
	</div>
</main>

<style>
	main {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	p {
		color: #666;
	}

	.controls {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.canvas-wrapper {
		height: 800px;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	button:hover {
		background: #0056b3;
	}
</style>

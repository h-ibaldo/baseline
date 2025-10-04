<script lang="ts">
	/**
	 * Canvas Demo Page
	 * Test page for infinite canvas with multiple artboards
	 */
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import Artboard from '$lib/components/canvas/Artboard.svelte';
	import Element from '$lib/components/canvas/Element.svelte';
	import type { CanvasConfig, Artboard as ArtboardType, CanvasElement } from '$lib/types/canvas';

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

	// Selection state - now supports multiple selections
	let selectedElementIds: string[] = [];

	// Sample elements for testing
	let elements: CanvasElement[] = [
		{
			id: 'element-1',
			type: 'box',
			artboardId: 'artboard-1',
			x: 100,
			y: 100,
			width: 200,
			height: 150,
			opacity: 1,
			rotation: 0
		},
		{
			id: 'element-2',
			type: 'box',
			artboardId: 'artboard-1',
			x: 400,
			y: 200,
			width: 150,
			height: 150,
			opacity: 0.8,
			rotation: 15
		},
		{
			id: 'element-3',
			type: 'box',
			artboardId: 'artboard-2',
			x: 50,
			y: 100,
			width: 120,
			height: 100,
			opacity: 1,
			rotation: 0
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

	/**
	 * Handle element selection with multi-select support
	 */
	function handleElementSelect(elementId: string, shiftKey: boolean) {
		if (shiftKey) {
			// Shift+click: toggle element in selection
			if (selectedElementIds.includes(elementId)) {
				selectedElementIds = selectedElementIds.filter(id => id !== elementId);
			} else {
				selectedElementIds = [...selectedElementIds, elementId];
			}
		} else {
			// Regular click: select only this element
			selectedElementIds = [elementId];
		}
	}

	/**
	 * Clear all selections
	 */
	function clearSelection() {
		selectedElementIds = [];
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

		<div class="selection-info">
			{#if selectedElementIds.length > 0}
				<span>Selected: {selectedElementIds.length} element{selectedElementIds.length > 1 ? 's' : ''}</span>
			{:else}
				<span>No selection (Shift+click for multi-select)</span>
			{/if}
		</div>
	</div>

	<div 
		class="canvas-wrapper"
		on:mousedown={clearSelection}
		role="button"
		tabindex="0"
	>
		<Canvas config={canvasConfig}>
			{#each artboards as artboard (artboard.id)}
				<Artboard {artboard}>
					<!-- Render elements that belong to this artboard -->
					{#each elements.filter(el => el.artboardId === artboard.id) as element (element.id)}
						<Element 
							{element} 
							isSelected={selectedElementIds.includes(element.id)}
							onSelect={(shiftKey) => handleElementSelect(element.id, shiftKey)}
							onUpdate={() => elements = elements}
						/>
					{/each}
				</Artboard>
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

	.selection-info {
		padding: 0.5rem 1rem;
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.85rem;
		color: #666;
	}
</style>

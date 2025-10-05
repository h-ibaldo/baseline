<script lang="ts">
	/**
	 * Event Sourcing Demo Page
	 * Demonstrates the event sourcing state management system
	 */
	import HistoryPanel from '$lib/components/ui/HistoryPanel.svelte';
	import {
		canvasState,
		selectedElementIds,
		addArtboard,
		addElement,
		moveElement,
		resizeElement,
		deleteElement,
		updateElement,
		selectElement,
		clearSelection
	} from '$lib/stores/design-store';
	import { currentEvents } from '$lib/stores/event-store';
	import type { CanvasElement } from '$lib/types/canvas';

	/**
	 * Demo actions
	 */
	function addDemoArtboard() {
		addArtboard({
			name: `Artboard ${$canvasState.artboards.length + 1}`,
			x: 100 + ($canvasState.artboards.length * 200),
			y: 100,
			width: 800,
			height: 600,
			backgroundColor: '#ffffff',
			showGrid: true,
			gridSize: 20,
			isPublishTarget: true
		});
	}

	function addDemoElement() {
		if ($canvasState.artboards.length === 0) {
			alert('Please add an artboard first');
			return;
		}

		const artboardId = $canvasState.artboards[0].id;
		const elementCount = $canvasState.elements.filter(e => e.artboardId === artboardId).length;

		addElement({
			type: 'box',
			artboardId,
			x: 50 + (elementCount * 20),
			y: 50 + (elementCount * 20),
			width: 150,
			height: 100,
			rotation: 0,
			opacity: 1
		});
	}

	function moveDemoElement(elementId: string) {
		const element = $canvasState.elements.find(e => e.id === elementId);
		if (element) {
			moveElement(elementId, element.x + 50, element.y + 50);
		}
	}

	function resizeDemoElement(elementId: string) {
		const element = $canvasState.elements.find(e => e.id === elementId);
		if (element) {
			resizeElement(elementId, element.width + 20, element.height + 20);
		}
	}

	function deleteDemoElement(elementId: string) {
		deleteElement(elementId);
	}

	function updateOpacity(elementId: string) {
		const element = $canvasState.elements.find(e => e.id === elementId);
		if (element) {
			const newOpacity = element.opacity && element.opacity > 0.3 ? (element.opacity - 0.2) : 1;
			updateElement(elementId, { opacity: newOpacity });
		}
	}

	/**
	 * Get background color based on element index
	 */
	function getElementColor(index: number): string {
		const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
		return colors[index % colors.length];
	}
</script>

<svelte:head>
	<title>Event Sourcing Demo - Baseline</title>
</svelte:head>

<main>
	<header>
		<h1>Event Sourcing Demo</h1>
		<p>State management with perfect undo/redo via event history</p>
	</header>

	<div class="demo-container">
		<!-- Left: Canvas Preview -->
		<div class="canvas-section">
			<h2>Canvas State</h2>
			
			<div class="actions">
				<button on:click={addDemoArtboard}>
					+ Add Artboard
				</button>
				<button on:click={addDemoElement}>
					+ Add Element
				</button>
			</div>

			<div class="canvas-preview">
				{#if $canvasState.artboards.length === 0}
					<div class="empty-state">
						<p>No artboards yet. Click "Add Artboard" to get started!</p>
					</div>
				{:else}
					{#each $canvasState.artboards as artboard (artboard.id)}
						<div class="artboard" style="background-color: {artboard.backgroundColor};">
							<div class="artboard-header">
								<strong>{artboard.name}</strong>
								<span class="size">{artboard.width}×{artboard.height}</span>
							</div>

							<!-- Elements in this artboard -->
							{#each $canvasState.elements.filter(e => e.artboardId === artboard.id) as element, index (element.id)}
								<div 
									class="element"
									class:selected={$selectedElementIds.includes(element.id)}
									style="
										left: {element.x}px;
										top: {element.y + 40}px;
										width: {element.width}px;
										height: {element.height}px;
										background-color: {getElementColor(index)};
										opacity: {element.opacity ?? 1};
										transform: rotate({element.rotation ?? 0}deg);
									"
									on:click={() => selectElement(element.id)}
									on:keydown={(e) => e.key === 'Enter' && selectElement(element.id)}
									role="button"
									tabindex="0"
								>
									<div class="element-id">{element.id.slice(0, 12)}</div>
									<div class="element-actions">
										<button on:click|stopPropagation={() => moveDemoElement(element.id)} title="Move">↗</button>
										<button on:click|stopPropagation={() => resizeDemoElement(element.id)} title="Resize">⤢</button>
										<button on:click|stopPropagation={() => updateOpacity(element.id)} title="Opacity">◐</button>
										<button on:click|stopPropagation={() => deleteDemoElement(element.id)} title="Delete">×</button>
									</div>
								</div>
							{/each}
						</div>
					{/each}
				{/if}
			</div>

			<!-- State Info -->
			<div class="state-info">
				<h3>Current State</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="label">Artboards:</span>
						<span class="value">{$canvasState.artboards.length}</span>
					</div>
					<div class="info-item">
						<span class="label">Elements:</span>
						<span class="value">{$canvasState.elements.length}</span>
					</div>
					<div class="info-item">
						<span class="label">Selected:</span>
						<span class="value">{$selectedElementIds.length}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: History Panel & Events -->
		<div class="sidebar">
			<HistoryPanel />

			<div class="events-panel">
				<h3>Event History</h3>
				<div class="event-list">
					{#if $currentEvents.length === 0}
						<p class="empty">No events yet</p>
					{:else}
						{#each $currentEvents as event, index (event.id)}
							<div class="event-item">
								<span class="event-index">{index + 1}</span>
								<span class="event-type">{event.type}</span>
								<span class="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		padding: 2rem;
		max-width: 1600px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #28a745;
	}

	p {
		color: #666;
	}

	.demo-container {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 2rem;
	}

	/* Canvas Section */
	.canvas-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h2 {
		font-size: 1.3rem;
		margin: 0;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s;
	}

	button:hover {
		background: #0056b3;
	}

	.canvas-preview {
		min-height: 400px;
		border: 2px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		background: #f5f5f5;
		overflow: auto;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 300px;
		color: #999;
		font-style: italic;
	}

	.artboard {
		position: relative;
		display: inline-block;
		margin: 1rem;
		border: 2px solid #333;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		min-height: 400px;
		min-width: 500px;
	}

	.artboard-header {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: rgba(0,0,0,0.05);
		border-bottom: 1px solid rgba(0,0,0,0.1);
		font-size: 0.85rem;
	}

	.size {
		color: #666;
	}

	.element {
		position: absolute;
		border: 2px solid rgba(0,0,0,0.2);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.75rem;
		padding: 0.5rem;
	}

	.element:hover {
		border-color: #007bff;
		box-shadow: 0 2px 8px rgba(0,123,255,0.3);
	}

	.element.selected {
		border-color: #28a745;
		border-width: 3px;
		box-shadow: 0 0 0 3px rgba(40,167,69,0.2);
	}

	.element-id {
		font-family: monospace;
		font-size: 0.7rem;
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.element-actions {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.element:hover .element-actions {
		opacity: 1;
	}

	.element-actions button {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		background: rgba(0,0,0,0.6);
	}

	.element-actions button:hover {
		background: rgba(0,0,0,0.8);
	}

	.state-info {
		padding: 1rem;
		background: #fff;
		border: 2px solid #007bff;
		border-radius: 8px;
	}

	.state-info h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #007bff;
	}

	.info-grid {
		display: flex;
		gap: 2rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.85rem;
		color: #666;
	}

	.value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #333;
	}

	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.events-panel {
		padding: 1.5rem;
		background: #fff;
		border: 2px solid #6c757d;
		border-radius: 8px;
	}

	.events-panel h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #6c757d;
	}

	.event-list {
		max-height: 400px;
		overflow-y: auto;
		font-size: 0.85rem;
	}

	.event-list .empty {
		color: #999;
		font-style: italic;
		text-align: center;
		padding: 2rem;
	}

	.event-item {
		display: grid;
		grid-template-columns: 40px 1fr auto;
		gap: 0.5rem;
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
		font-family: monospace;
	}

	.event-item:last-child {
		border-bottom: none;
	}

	.event-index {
		color: #999;
		text-align: right;
	}

	.event-type {
		font-weight: 600;
		color: #333;
	}

	.event-time {
		color: #666;
		font-size: 0.75rem;
	}
</style>


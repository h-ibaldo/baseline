<script lang="ts">
	/**
	 * Canvas - The main page builder canvas
	 *
	 * Features:
	 * - Infinite scrollable canvas
	 * - Zoom in/out with mouse wheel
	 * - Pan with space + drag
	 * - Multi-page support (Figma-style)
	 * - Baseline grid overlay
	 * - Element rendering and interaction
	 */

	import { onMount, onDestroy } from 'svelte';
	import { designState, currentPage, initialize } from '$lib/stores/design-store';
	import CanvasElement from './CanvasElement.svelte';
	import BaselineGrid from './BaselineGrid.svelte';

	let canvasElement: HTMLDivElement;
	let viewport = { x: 0, y: 0, scale: 1 };
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let isPanning = false;

	// Zoom settings
	const MIN_ZOOM = 0.1;
	const MAX_ZOOM = 4;
	const ZOOM_STEP = 0.1;

	onMount(async () => {
		await initialize();
		setupEventListeners();
	});

	function setupEventListeners() {
		// Mouse wheel for zoom
		canvasElement.addEventListener('wheel', handleWheel, { passive: false });

		// Space key for panning
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	}

	onDestroy(() => {
		canvasElement?.removeEventListener('wheel', handleWheel);
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
	});

	function handleWheel(e: WheelEvent) {
		// Zoom with Cmd/Ctrl + wheel
		if (e.metaKey || e.ctrlKey) {
			e.preventDefault();

			const delta = -e.deltaY * 0.001;
			const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewport.scale + delta));

			// Zoom towards mouse position
			const rect = canvasElement.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const oldScale = viewport.scale;
			const scaleRatio = newScale / oldScale;

			viewport = {
				x: mouseX - (mouseX - viewport.x) * scaleRatio,
				y: mouseY - (mouseY - viewport.y) * scaleRatio,
				scale: newScale
			};
		}
		// Pan with shift + wheel (horizontal) or plain wheel (vertical)
		else {
			e.preventDefault();
			viewport = {
				...viewport,
				x: viewport.x - (e.shiftKey ? e.deltaY : e.deltaX),
				y: viewport.y - (e.shiftKey ? 0 : e.deltaY)
			};
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.code === 'Space' && !isPanning) {
			e.preventDefault();
			isPanning = true;
			canvasElement.style.cursor = 'grab';
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.code === 'Space') {
			isPanning = false;
			canvasElement.style.cursor = 'default';
			if (isDragging) {
				isDragging = false;
			}
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (isPanning) {
			isDragging = true;
			dragStart = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
			canvasElement.style.cursor = 'grabbing';
			e.preventDefault();
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging && isPanning) {
			viewport = {
				...viewport,
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			};
		}
	}

	function handleMouseUp() {
		if (isDragging) {
			isDragging = false;
			canvasElement.style.cursor = isPanning ? 'grab' : 'default';
		}
	}

	// Zoom controls
	function zoomIn() {
		viewport = {
			...viewport,
			scale: Math.min(MAX_ZOOM, viewport.scale + ZOOM_STEP)
		};
	}

	function zoomOut() {
		viewport = {
			...viewport,
			scale: Math.max(MIN_ZOOM, viewport.scale - ZOOM_STEP)
		};
	}

	function resetZoom() {
		viewport = { x: 0, y: 0, scale: 1 };
	}

	// Get page position on canvas (for multi-page layout)
	function getPagePosition(pageIndex: number) {
		const GAP = 100; // Gap between pages
		return {
			x: 0,
			y: pageIndex * (($currentPage?.height || 900) + GAP)
		};
	}
</script>

<!-- STYLE: Canvas container - full viewport, overflow hidden -->
<div class="canvas-container">
	<!-- STYLE: Zoom controls - floating toolbar, top-right corner -->
	<div class="zoom-controls">
		<button on:click={zoomOut}>-</button>
		<span>{Math.round(viewport.scale * 100)}%</span>
		<button on:click={zoomIn}>+</button>
		<button on:click={resetZoom}>Reset</button>
	</div>

	<!-- STYLE: Canvas - infinite scrollable area, dark background -->
	<div
		class="canvas"
		bind:this={canvasElement}
		on:mousedown={handleMouseDown}
		on:mousemove={handleMouseMove}
		on:mouseup={handleMouseUp}
		on:mouseleave={handleMouseUp}
		role="application"
		aria-label="Page builder canvas"
	>
		<!-- STYLE: Canvas viewport - transformed container with zoom/pan -->
		<div
			class="canvas-viewport"
			style="transform: translate({viewport.x}px, {viewport.y}px) scale({viewport.scale});"
		>
			{#if $currentPage}
				<!-- STYLE: Page container - white page on dark canvas -->
				<div
					class="page"
					style="width: {$currentPage.width}px; height: {$currentPage.height}px;"
				>
					<!-- Baseline grid overlay -->
					<BaselineGrid />

					<!-- Render all root elements on current page -->
					{#each $currentPage.elements as elementId}
						{#if $designState.elements[elementId]}
							<CanvasElement element={$designState.elements[elementId]} />
						{/if}
					{/each}
				</div>
			{:else}
				<!-- STYLE: Empty state - centered message -->
				<div class="empty-state">
					<p>No page selected. Create a page to get started.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* STYLE: Add your design here! */
	/* This is unstyled semantic HTML with functional logic */

	.canvas-container {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: #1a1a1a; /* Dark canvas background */
	}

	.zoom-controls {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 100;
		display: flex;
		gap: 8px;
		padding: 8px;
		background: white;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.zoom-controls button {
		padding: 4px 12px;
		border: 1px solid #ddd;
		background: white;
		cursor: pointer;
	}

	.zoom-controls button:hover {
		background: #f5f5f5;
	}

	.zoom-controls span {
		padding: 4px 8px;
		font-size: 14px;
		color: #333;
	}

	.canvas {
		width: 100%;
		height: 100%;
		position: relative;
		cursor: default;
	}

	.canvas-viewport {
		transform-origin: 0 0;
		will-change: transform;
	}

	.page {
		background: white;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		position: relative;
		margin: 50px;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 400px;
		color: #999;
		font-size: 16px;
	}
</style>

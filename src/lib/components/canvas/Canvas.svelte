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
		if (typeof window === 'undefined') return;

		// Mouse wheel for zoom
		canvasElement.addEventListener('wheel', handleWheel, { passive: false });

		// Space key for panning
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	}

	onDestroy(() => {
		if (typeof window === 'undefined') return;

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
			<!-- Baseline grid overlay across entire infinite canvas -->
			<BaselineGrid />

			<!-- Render all root elements (no parent) directly on infinite canvas -->
			{#each Object.values($designState.elements).filter(el => el.parentId === null) as element}
				<CanvasElement element={element} scale={viewport.scale} />
			{/each}

			<!-- Optional: Render pages as visual artboards (like Figma frames) -->
			{#each $designState.pageOrder as pageId}
				{#if $designState.pages[pageId]}
					<!-- STYLE: Page artboard - visual container for organization -->
					<div
						class="page-artboard"
						style="
							position: absolute;
							left: {getPagePosition($designState.pageOrder.indexOf(pageId)).x}px;
							top: {getPagePosition($designState.pageOrder.indexOf(pageId)).y}px;
							width: {$designState.pages[pageId].width}px;
							height: {$designState.pages[pageId].height}px;
						"
					>
						<div class="page-artboard-label">
							{$designState.pages[pageId].name}
						</div>
					</div>
				{/if}
			{/each}
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

	.page-artboard {
		position: absolute;
		border: 2px solid rgba(100, 100, 255, 0.3);
		background: rgba(255, 255, 255, 0.02);
		pointer-events: none;
	}

	.page-artboard-label {
		position: absolute;
		top: -30px;
		left: 0;
		color: rgba(100, 100, 255, 0.8);
		font-size: 14px;
		font-weight: 500;
		pointer-events: none;
	}
</style>

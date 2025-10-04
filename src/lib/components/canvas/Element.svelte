<script lang="ts">
	/**
	 * Element Component
	 * Basic design element (box) that can be positioned on canvas or inside artboards.
	 * This is the foundation for all design elements (text, images, etc. will extend this).
	 */
	import type { CanvasElement } from '$lib/types/canvas';

	export let element: CanvasElement;
	export let onUpdate: ((element: CanvasElement) => void) | undefined = undefined;

	let isDragging = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let elementStartX = 0;
	let elementStartY = 0;

	/**
	 * Start dragging - capture initial positions
	 */
	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		elementStartX = element.x;
		elementStartY = element.y;
		
		// Prevent text selection while dragging
		e.preventDefault();
	}

	/**
	 * Handle mouse move - update element position
	 */
	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;

		// Calculate delta from drag start
		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		// Update element position
		element.x = elementStartX + deltaX;
		element.y = elementStartY + deltaY;

		// Notify parent of update
		if (onUpdate) {
			onUpdate(element);
		}
	}

	/**
	 * Stop dragging
	 */
	function handleMouseUp() {
		isDragging = false;
	}
</script>

<!-- Global mouse listeners for drag -->
<svelte:window 
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
/>

<!-- Element positioned absolutely within its container (artboard or canvas) -->
<div
	class="element"
	class:box={element.type === 'box'}
	class:dragging={isDragging}
	style="
		left: {element.x}px;
		top: {element.y}px;
		width: {element.width}px;
		height: {element.height}px;
		opacity: {element.opacity ?? 1};
		transform: rotate({element.rotation ?? 0}deg);
	"
	data-element-id={element.id}
	data-element-type={element.type}
	on:mousedown={handleMouseDown}
	role="button"
	tabindex="0"
>
	<!-- Box type shows colored background -->
	{#if element.type === 'box'}
		<div class="box-content"></div>
	{/if}
	
	<!-- Show coordinates while dragging -->
	{#if isDragging}
		<div class="coordinates">
			x: {Math.round(element.x)}, y: {Math.round(element.y)}
		</div>
	{/if}
</div>

<style>
	.element {
		position: absolute;
		pointer-events: auto;
		cursor: move;
		user-select: none;
	}

	/* Visual feedback while dragging */
	.element.dragging {
		cursor: grabbing;
		opacity: 0.7;
	}

	/* Box element styling */
	.element.box .box-content {
		width: 100%;
		height: 100%;
		background: #4a90e2;
		border: 2px solid #2c5aa0;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s;
	}

	.element.box:hover .box-content {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	/* Coordinate display while dragging */
	.coordinates {
		position: absolute;
		top: -25px;
		left: 0;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-family: monospace;
		white-space: nowrap;
		pointer-events: none;
	}
</style>

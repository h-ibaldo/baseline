<script lang="ts">
	/**
	 * Element Component
	 * Basic design element (box) that can be positioned on canvas or inside artboards.
	 * This is the foundation for all design elements (text, images, etc. will extend this).
	 */
	import type { CanvasElement } from '$lib/types/canvas';

	export let element: CanvasElement;
	export let onUpdate: ((element: CanvasElement) => void) | undefined = undefined;
	export let isSelected = false;
	export let onSelect: (() => void) | undefined = undefined;

	let isDragging = false;
	let isResizing = false;
	let resizeHandle: string | null = null; // 'nw', 'ne', 'sw', 'se'
	let dragStartX = 0;
	let dragStartY = 0;
	let elementStartX = 0;
	let elementStartY = 0;
	let elementStartWidth = 0;
	let elementStartHeight = 0;

	/**
	 * Start dragging - capture initial positions
	 */
	function handleMouseDown(e: MouseEvent) {
		// Select element on click
		if (onSelect) {
			onSelect();
		}

		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		elementStartX = element.x;
		elementStartY = element.y;
		
		// Prevent text selection while dragging
		e.preventDefault();
		// Stop event from reaching canvas (prevent deselection)
		e.stopPropagation();
	}

	/**
	 * Start resizing from a handle
	 */
	function handleResizeMouseDown(e: MouseEvent, handle: string) {
		isResizing = true;
		resizeHandle = handle;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		elementStartX = element.x;
		elementStartY = element.y;
		elementStartWidth = element.width;
		elementStartHeight = element.height;
		
		e.preventDefault();
		e.stopPropagation();
	}

	/**
	 * Handle mouse move - update element position or size
	 */
	function handleMouseMove(e: MouseEvent) {
		if (isResizing) {
			handleResize(e);
		} else if (isDragging) {
			handleDrag(e);
		}
	}

	/**
	 * Handle dragging
	 */
	function handleDrag(e: MouseEvent) {
		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		element.x = elementStartX + deltaX;
		element.y = elementStartY + deltaY;

		if (onUpdate) {
			onUpdate(element);
		}
	}

	/**
	 * Handle resizing from corner handles
	 */
	function handleResize(e: MouseEvent) {
		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		// Apply resize based on which handle is being dragged
		switch (resizeHandle) {
			case 'se': // Southeast (bottom-right)
				element.width = Math.max(50, elementStartWidth + deltaX);
				element.height = Math.max(50, elementStartHeight + deltaY);
				break;
			case 'sw': // Southwest (bottom-left)
				element.width = Math.max(50, elementStartWidth - deltaX);
				element.height = Math.max(50, elementStartHeight + deltaY);
				element.x = elementStartX + (elementStartWidth - element.width);
				break;
			case 'ne': // Northeast (top-right)
				element.width = Math.max(50, elementStartWidth + deltaX);
				element.height = Math.max(50, elementStartHeight - deltaY);
				element.y = elementStartY + (elementStartHeight - element.height);
				break;
			case 'nw': // Northwest (top-left)
				element.width = Math.max(50, elementStartWidth - deltaX);
				element.height = Math.max(50, elementStartHeight - deltaY);
				element.x = elementStartX + (elementStartWidth - element.width);
				element.y = elementStartY + (elementStartHeight - element.height);
				break;
		}

		if (onUpdate) {
			onUpdate(element);
		}
	}

	/**
	 * Stop dragging or resizing
	 */
	function handleMouseUp() {
		isDragging = false;
		isResizing = false;
		resizeHandle = null;
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
	class:selected={isSelected}
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

	<!-- Show dimensions while resizing -->
	{#if isResizing}
		<div class="coordinates">
			{Math.round(element.width)} × {Math.round(element.height)}
		</div>
	{/if}

	<!-- Resize handles (only show when selected) -->
	{#if isSelected}
		<div class="resize-handle nw" on:mousedown={(e) => handleResizeMouseDown(e, 'nw')} role="button" tabindex="0"></div>
		<div class="resize-handle ne" on:mousedown={(e) => handleResizeMouseDown(e, 'ne')} role="button" tabindex="0"></div>
		<div class="resize-handle sw" on:mousedown={(e) => handleResizeMouseDown(e, 'sw')} role="button" tabindex="0"></div>
		<div class="resize-handle se" on:mousedown={(e) => handleResizeMouseDown(e, 'se')} role="button" tabindex="0"></div>
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

	/* Selection border */
	.element.selected::before {
		content: '';
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border: 2px solid #007bff;
		border-radius: 6px;
		pointer-events: none;
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

	/* Resize handles */
	.resize-handle {
		position: absolute;
		width: 10px;
		height: 10px;
		background: white;
		border: 2px solid #007bff;
		border-radius: 50%;
		pointer-events: auto;
	}

	.resize-handle:hover {
		background: #007bff;
	}

	/* Position each handle at corners */
	.resize-handle.nw {
		top: -5px;
		left: -5px;
		cursor: nw-resize;
	}

	.resize-handle.ne {
		top: -5px;
		right: -5px;
		cursor: ne-resize;
	}

	.resize-handle.sw {
		bottom: -5px;
		left: -5px;
		cursor: sw-resize;
	}

	.resize-handle.se {
		bottom: -5px;
		right: -5px;
		cursor: se-resize;
	}
</style>

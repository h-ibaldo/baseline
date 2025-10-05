<script lang="ts">
	/**
	 * Element Component
	 * Basic design element (box) that can be positioned on canvas or inside artboards.
	 * This is the foundation for all design elements (text, images, etc. will extend this).
	 */
	import type { CanvasElement } from '$lib/types/canvas';
	import type { BaselineConfig } from '$lib/types/baseline';
	import { snapToBaseline } from '$lib/utils/baseline';

	export let element: CanvasElement;
	export let onUpdate: ((element: CanvasElement) => void) | undefined = undefined;
	export let isSelected = false;
	export let onSelect: ((shiftKey: boolean) => void) | undefined = undefined;
	export let baselineConfig: BaselineConfig | undefined = undefined;

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
		// Select element on click (pass shift key for multi-select)
		if (onSelect) {
			onSelect(e.shiftKey);
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
	 * Handle dragging with optional baseline snapping
	 */
	function handleDrag(e: MouseEvent) {
		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		let newX = elementStartX + deltaX;
		let newY = elementStartY + deltaY;

		// Apply baseline snapping if enabled
		if (shouldSnapToBaseline()) {
			newY = snapToBaseline(newY, baselineConfig!.height);
		}

		element.x = newX;
		element.y = newY;

		if (onUpdate) {
			onUpdate(element);
		}
	}

	/**
	 * Check if element should snap to baseline
	 */
	function shouldSnapToBaseline(): boolean {
		if (!baselineConfig || !baselineConfig.enabled) return false;
		// Per-element override: if snapToBaseline is explicitly set, use it
		if (element.snapToBaseline !== undefined) return element.snapToBaseline;
		// Otherwise use global setting
		return baselineConfig.enabled;
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

	<!-- Text type shows editable text -->
	{#if element.type === 'text'}
		<div class="text-content">
			Sample Text
		</div>
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

	/* Text element styling */
	.element.text .text-content {
		width: 100%;
		height: 100%;
		padding: 8px;
		font-size: 16px;
		line-height: 1.5;
		color: #333;
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.element.text:hover .text-content {
		border-color: #999;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

<script lang="ts">
	/**
	 * SelectionUI - Renders selection border and handles for ONE element
	 *
	 * This component is reactive to viewport and pending transforms
	 */

	import { currentTool } from '$lib/stores/tool-store';
	import type { Element } from '$lib/types/events';

	export let element: Element;
	export let viewport: { x: number; y: number; scale: number };
	export let pendingPosition: { x: number; y: number } | null;
	export let pendingSize: { width: number; height: number } | null;
	export let isPanning: boolean = false;
	export let onMouseDown: (e: MouseEvent, handle?: string) => void;

	// Determine cursor based on tool and panning state
	$: dragCursor = $currentTool === 'hand' || isPanning ? 'grab' : 'default';

	const HANDLE_SIZE = 8;
	const BORDER_WIDTH = 2;

	// Reactive: Get display position/size
	$: pos = pendingPosition || element.position;
	$: size = pendingSize || element.size;

	// Reactive: Convert to screen coordinates
	$: screenTopLeft = {
		x: viewport.x + pos.x * viewport.scale,
		y: viewport.y + pos.y * viewport.scale
	};

	$: screenBottomRight = {
		x: viewport.x + (pos.x + size.width) * viewport.scale,
		y: viewport.y + (pos.y + size.height) * viewport.scale
	};

	$: screenWidth = screenBottomRight.x - screenTopLeft.x;
	$: screenHeight = screenBottomRight.y - screenTopLeft.y;
	$: handleOffset = HANDLE_SIZE / 2;
</script>

<!-- Selection border -->
<div
	class="selection-border"
	style="
		position: absolute;
		left: {screenTopLeft.x}px;
		top: {screenTopLeft.y}px;
		width: {screenWidth}px;
		height: {screenHeight}px;
		border: {BORDER_WIDTH}px solid #3b82f6;
		pointer-events: none;
		box-sizing: border-box;
	"
/>

<!-- Draggable area (invisible, covers element) -->
<div
	class="drag-area"
	style="
		position: absolute;
		left: {screenTopLeft.x}px;
		top: {screenTopLeft.y}px;
		width: {screenWidth}px;
		height: {screenHeight}px;
		cursor: {dragCursor};
	"
	on:mousedown={(e) => onMouseDown(e)}
	role="button"
	tabindex="0"
	aria-label="Drag {element.type}"
/>

<!-- Resize handles - N -->
<div
	class="resize-handle"
	style="
		left: {screenTopLeft.x + screenWidth / 2 - handleOffset}px;
		top: {screenTopLeft.y - handleOffset}px;
		cursor: ns-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'n')}
	role="button"
	tabindex="0"
	aria-label="Resize north"
/>

<!-- NE -->
<div
	class="resize-handle"
	style="
		left: {screenBottomRight.x - handleOffset}px;
		top: {screenTopLeft.y - handleOffset}px;
		cursor: nesw-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'ne')}
	role="button"
	tabindex="0"
	aria-label="Resize northeast"
/>

<!-- E -->
<div
	class="resize-handle"
	style="
		left: {screenBottomRight.x - handleOffset}px;
		top: {screenTopLeft.y + screenHeight / 2 - handleOffset}px;
		cursor: ew-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'e')}
	role="button"
	tabindex="0"
	aria-label="Resize east"
/>

<!-- SE -->
<div
	class="resize-handle"
	style="
		left: {screenBottomRight.x - handleOffset}px;
		top: {screenBottomRight.y - handleOffset}px;
		cursor: nwse-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'se')}
	role="button"
	tabindex="0"
	aria-label="Resize southeast"
/>

<!-- S -->
<div
	class="resize-handle"
	style="
		left: {screenTopLeft.x + screenWidth / 2 - handleOffset}px;
		top: {screenBottomRight.y - handleOffset}px;
		cursor: ns-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 's')}
	role="button"
	tabindex="0"
	aria-label="Resize south"
/>

<!-- SW -->
<div
	class="resize-handle"
	style="
		left: {screenTopLeft.x - handleOffset}px;
		top: {screenBottomRight.y - handleOffset}px;
		cursor: nesw-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'sw')}
	role="button"
	tabindex="0"
	aria-label="Resize southwest"
/>

<!-- W -->
<div
	class="resize-handle"
	style="
		left: {screenTopLeft.x - handleOffset}px;
		top: {screenTopLeft.y + screenHeight / 2 - handleOffset}px;
		cursor: ew-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'w')}
	role="button"
	tabindex="0"
	aria-label="Resize west"
/>

<!-- NW -->
<div
	class="resize-handle"
	style="
		left: {screenTopLeft.x - handleOffset}px;
		top: {screenTopLeft.y - handleOffset}px;
		cursor: nwse-resize;
	"
	on:mousedown={(e) => onMouseDown(e, 'nw')}
	role="button"
	tabindex="0"
	aria-label="Resize northwest"
/>

<style>
	.selection-border {
		pointer-events: none;
	}

	.drag-area {
		pointer-events: auto;
	}

	.resize-handle {
		position: absolute;
		width: 8px;
		height: 8px;
		background: white;
		border: 1px solid #3b82f6;
		pointer-events: auto;
		box-sizing: border-box;
	}

	.resize-handle:hover {
		background: #3b82f6;
	}
</style>

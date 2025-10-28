<script lang="ts">
	/**
	 * SelectionOverlay - Renders selection UI and handles interactions
	 *
	 * Architecture:
	 * - Renders ABOVE all canvas elements in a separate fixed layer
	 * - Handles all drag/resize interactions for selected elements
	 * - Maintains constant visual size regardless of canvas zoom
	 * - Future: measurements, angles, distances, alignment guides
	 */

	import { onDestroy } from 'svelte';
	import type { Element } from '$lib/types/events';
	import { moveElement, resizeElement, selectElement } from '$lib/stores/design-store';
	import { interactionState } from '$lib/stores/interaction-store';
	import SelectionUI from './SelectionUI.svelte';

	// Props
	export let viewport: { x: number; y: number; scale: number };
	export let selectedElements: Element[];

	// Local interaction state
	let activeElementId: string | null = null;
	let interactionMode: 'idle' | 'dragging' | 'resizing' = 'idle';
	let resizeHandle: string | null = null;

	// Pending transform during interaction (for live preview)
	let pendingPosition: { x: number; y: number } | null = null;
	let pendingSize: { width: number; height: number } | null = null;

	// Broadcast state to store for CanvasElement to consume
	$: {
		interactionState.set({
			activeElementId,
			mode: interactionMode,
			pendingPosition,
			pendingSize
		});
	}

	// Drag start tracking
	let dragStartScreen = { x: 0, y: 0 };
	let elementStartCanvas = { x: 0, y: 0, width: 0, height: 0 };

	// Constants
	const MOVEMENT_THRESHOLD = 2; // px

	// Coordinate conversion helper
	function screenToCanvas(screenX: number, screenY: number) {
		return {
			x: (screenX - viewport.x) / viewport.scale,
			y: (screenY - viewport.y) / viewport.scale
		};
	}

	// Helper: Get display position (pending or actual)
	function getDisplayPosition(element: Element): { x: number; y: number } {
		return pendingPosition && activeElementId === element.id ? pendingPosition : element.position;
	}

	// Helper: Get display size (pending or actual)
	function getDisplaySize(element: Element): { width: number; height: number } {
		return pendingSize && activeElementId === element.id ? pendingSize : element.size;
	}

	// Mouse event handlers
	function handleMouseDown(e: MouseEvent, element: Element, handle?: string) {
		e.stopPropagation();
		e.preventDefault();

		activeElementId = element.id;
		dragStartScreen = { x: e.clientX, y: e.clientY };

		const pos = getDisplayPosition(element);
		const size = getDisplaySize(element);

		elementStartCanvas = {
			x: pos.x,
			y: pos.y,
			width: size.width,
			height: size.height
		};

		if (handle) {
			// Resize mode
			interactionMode = 'resizing';
			resizeHandle = handle;
			pendingSize = { ...size };
			pendingPosition = { ...pos };
		} else {
			// Drag mode
			interactionMode = 'dragging';
			pendingPosition = { ...pos };
		}

		// Select the element
		selectElement(element.id);

		// Add global listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		if (interactionMode === 'idle' || !activeElementId) return;

		const deltaScreen = {
			x: e.clientX - dragStartScreen.x,
			y: e.clientY - dragStartScreen.y
		};

		// Convert delta to canvas space
		const deltaCanvas = {
			x: deltaScreen.x / viewport.scale,
			y: deltaScreen.y / viewport.scale
		};

		if (interactionMode === 'dragging') {
			// Update pending position
			pendingPosition = {
				x: elementStartCanvas.x + deltaCanvas.x,
				y: elementStartCanvas.y + deltaCanvas.y
			};
		} else if (interactionMode === 'resizing' && resizeHandle) {
			// Calculate new size based on handle
			let newWidth = elementStartCanvas.width;
			let newHeight = elementStartCanvas.height;
			let newX = elementStartCanvas.x;
			let newY = elementStartCanvas.y;

			if (resizeHandle.includes('e')) {
				newWidth = elementStartCanvas.width + deltaCanvas.x;
			}
			if (resizeHandle.includes('w')) {
				newWidth = elementStartCanvas.width - deltaCanvas.x;
				newX = elementStartCanvas.x + deltaCanvas.x;
			}
			if (resizeHandle.includes('s')) {
				newHeight = elementStartCanvas.height + deltaCanvas.y;
			}
			if (resizeHandle.includes('n')) {
				newHeight = elementStartCanvas.height - deltaCanvas.y;
				newY = elementStartCanvas.y + deltaCanvas.y;
			}

			// Allow negative dimensions (flip element when dragging past opposite edge)
			if (newWidth < 0) {
				newX = newX + newWidth;
				newWidth = Math.abs(newWidth);
			}
			if (newHeight < 0) {
				newY = newY + newHeight;
				newHeight = Math.abs(newHeight);
			}

			pendingSize = { width: newWidth, height: newHeight };
			pendingPosition = { x: newX, y: newY };
		}
	}

	async function handleMouseUp() {
		if (interactionMode === 'idle' || !activeElementId) return;

		// Check if actually moved beyond threshold
		const movedX = pendingPosition
			? Math.abs(pendingPosition.x - elementStartCanvas.x)
			: 0;
		const movedY = pendingPosition
			? Math.abs(pendingPosition.y - elementStartCanvas.y)
			: 0;
		const sizeChangedW = pendingSize
			? Math.abs(pendingSize.width - elementStartCanvas.width)
			: 0;
		const sizeChangedH = pendingSize
			? Math.abs(pendingSize.height - elementStartCanvas.height)
			: 0;

		if (interactionMode === 'dragging') {
			if (movedX > MOVEMENT_THRESHOLD || movedY > MOVEMENT_THRESHOLD) {
				if (pendingPosition) {
					await moveElement(activeElementId, pendingPosition);
				}
			}
		} else if (interactionMode === 'resizing') {
			const sizeChanged = sizeChangedW > MOVEMENT_THRESHOLD || sizeChangedH > MOVEMENT_THRESHOLD;
			const positionChanged = movedX > MOVEMENT_THRESHOLD || movedY > MOVEMENT_THRESHOLD;

			if (sizeChanged || positionChanged) {
				if (pendingSize) {
					await resizeElement(
						activeElementId,
						pendingSize,
						positionChanged && pendingPosition ? pendingPosition : undefined
					);
				}
			}
		}

		// Keep element selected after interaction
		selectElement(activeElementId);

		// Reset state
		interactionMode = 'idle';
		activeElementId = null;
		resizeHandle = null;
		pendingPosition = null;
		pendingSize = null;

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	// Cleanup on destroy
	onDestroy(() => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	});
</script>

<!-- Render selection UI for each selected element -->
{#each selectedElements as element (element.id)}
	<SelectionUI
		{element}
		{viewport}
		pendingPosition={activeElementId === element.id ? pendingPosition : null}
		pendingSize={activeElementId === element.id ? pendingSize : null}
		onMouseDown={(e, handle) => handleMouseDown(e, element, handle)}
	/>
{/each}

<script lang="ts">
	/**
	 * CanvasElement - Draggable/resizable element on the canvas
	 *
	 * Features:
	 * - Drag to move
	 * - Resize handles (8 directions)
	 * - Selection visual feedback
	 * - Renders actual HTML elements (not canvas drawings)
	 * - Recursive children rendering
	 */

	import type { Element } from '$lib/types/events';
	import {
		designState,
		moveElement,
		resizeElement,
		selectElement,
		selectedElements
	} from '$lib/stores/design-store';

	export let element: Element;
	export let scale = 1; // Canvas viewport scale for accurate drag/resize

	let isDragging = false;
	let isResizing = false;
	let resizeHandle = '';
	let dragStart = { x: 0, y: 0 };
	let elementStart = { x: 0, y: 0, width: 0, height: 0 };
	let pendingPosition = { x: 0, y: 0 };
	let pendingSize = { width: 0, height: 0 };

	$: isSelected = $selectedElements.some((el) => el.id === element.id);

	// Force re-render when dragging/resizing
	$: elementStyles = getElementStyles();
	$: if (isDragging || isResizing) {
		elementStyles = getElementStyles();
	}

	function handleMouseDown(e: MouseEvent) {
		// Check if clicking on a resize handle
		const target = e.target as HTMLElement;
		if (target.classList.contains('resize-handle')) {
			isResizing = true;
			resizeHandle = target.dataset.handle || '';
			e.stopPropagation();
		} else {
			isDragging = true;
		}

		dragStart = { x: e.clientX, y: e.clientY };
		elementStart = {
			x: element.position.x,
			y: element.position.y,
			width: element.size.width,
			height: element.size.height
		};

		// Initialize pending values to current values
		pendingPosition = { x: element.position.x, y: element.position.y };
		pendingSize = { width: element.size.width, height: element.size.height };

		selectElement(element.id);
		e.preventDefault();

		// Add global mouse move/up listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging && !isResizing) return;

		// Account for canvas zoom/scale
		const deltaX = (e.clientX - dragStart.x) / scale;
		const deltaY = (e.clientY - dragStart.y) / scale;

		if (isDragging) {
			// Calculate new position but don't dispatch event yet
			pendingPosition = {
				x: elementStart.x + deltaX,
				y: elementStart.y + deltaY
			};
		} else if (isResizing) {
			// Calculate new size based on handle
			let newWidth = elementStart.width;
			let newHeight = elementStart.height;
			let newX = elementStart.x;
			let newY = elementStart.y;

			if (resizeHandle.includes('e')) {
				newWidth = elementStart.width + deltaX;
			}
			if (resizeHandle.includes('w')) {
				newWidth = elementStart.width - deltaX;
				newX = elementStart.x + deltaX;
			}
			if (resizeHandle.includes('s')) {
				newHeight = elementStart.height + deltaY;
			}
			if (resizeHandle.includes('n')) {
				newHeight = elementStart.height - deltaY;
				newY = elementStart.y + deltaY;
			}

			// Minimum size
			newWidth = Math.max(20, newWidth);
			newHeight = Math.max(20, newHeight);

			pendingSize = { width: newWidth, height: newHeight };
			pendingPosition = { x: newX, y: newY };
		}
	}

	async function handleMouseUp() {
		// Only dispatch event once on mouseup (not every mousemove)
		if (isDragging) {
			await moveElement(element.id, pendingPosition);
		} else if (isResizing) {
			await resizeElement(element.id, pendingSize);
			if (pendingPosition.x !== elementStart.x || pendingPosition.y !== elementStart.y) {
				await moveElement(element.id, pendingPosition);
			}
		}

		isDragging = false;
		isResizing = false;
		resizeHandle = '';

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	// Generate inline styles from element styles
	function getElementStyles(): string {
		const styles: string[] = [];

		// Position and size - use pending values if dragging/resizing
		const pos = (isDragging || isResizing) ? pendingPosition : element.position;
		const size = isResizing ? pendingSize : element.size;

		styles.push(`position: absolute`);
		styles.push(`left: ${pos.x}px`);
		styles.push(`top: ${pos.y}px`);
		styles.push(`width: ${size.width}px`);
		styles.push(`height: ${size.height}px`);

		// Element styles
		if (element.styles.backgroundColor) styles.push(`background-color: ${element.styles.backgroundColor}`);
		if (element.styles.color) styles.push(`color: ${element.styles.color}`);
		if (element.styles.borderWidth) styles.push(`border-width: ${element.styles.borderWidth}`);
		if (element.styles.borderStyle) styles.push(`border-style: ${element.styles.borderStyle}`);
		if (element.styles.borderColor) styles.push(`border-color: ${element.styles.borderColor}`);
		if (element.styles.borderRadius) styles.push(`border-radius: ${element.styles.borderRadius}`);
		if (element.styles.opacity !== undefined) styles.push(`opacity: ${element.styles.opacity}`);
		if (element.styles.boxShadow) styles.push(`box-shadow: ${element.styles.boxShadow}`);
		if (element.styles.overflow) styles.push(`overflow: ${element.styles.overflow}`);

		// Typography
		if (element.typography.fontFamily) styles.push(`font-family: ${element.typography.fontFamily}`);
		if (element.typography.fontSize) styles.push(`font-size: ${element.typography.fontSize}`);
		if (element.typography.fontWeight) styles.push(`font-weight: ${element.typography.fontWeight}`);
		if (element.typography.lineHeight) styles.push(`line-height: ${element.typography.lineHeight}`);
		if (element.typography.letterSpacing) styles.push(`letter-spacing: ${element.typography.letterSpacing}`);
		if (element.typography.textAlign) styles.push(`text-align: ${element.typography.textAlign}`);
		if (element.typography.textDecoration) styles.push(`text-decoration: ${element.typography.textDecoration}`);
		if (element.typography.textTransform) styles.push(`text-transform: ${element.typography.textTransform}`);

		// Spacing
		if (element.spacing.marginTop) styles.push(`margin-top: ${element.spacing.marginTop}`);
		if (element.spacing.marginRight) styles.push(`margin-right: ${element.spacing.marginRight}`);
		if (element.spacing.marginBottom) styles.push(`margin-bottom: ${element.spacing.marginBottom}`);
		if (element.spacing.marginLeft) styles.push(`margin-left: ${element.spacing.marginLeft}`);
		if (element.spacing.paddingTop) styles.push(`padding-top: ${element.spacing.paddingTop}`);
		if (element.spacing.paddingRight) styles.push(`padding-right: ${element.spacing.paddingRight}`);
		if (element.spacing.paddingBottom) styles.push(`padding-bottom: ${element.spacing.paddingBottom}`);
		if (element.spacing.paddingLeft) styles.push(`padding-left: ${element.spacing.paddingLeft}`);

		return styles.join('; ');
	}
</script>

<!-- STYLE: Canvas element wrapper - absolutely positioned, interactive -->
<div
	class="canvas-element"
	class:selected={isSelected}
	style={elementStyles}
	on:mousedown={handleMouseDown}
	role="button"
	tabindex="0"
	aria-label="{element.type} element"
>
	<!-- Render element content based on type -->
	{#if element.type === 'img'}
		<img src={element.src || ''} alt={element.alt || ''} style="width: 100%; height: 100%; object-fit: cover;" />
	{:else if element.type === 'a'}
		<a href={element.href || '#'}>{element.content || 'Link'}</a>
	{:else if element.type === 'button'}
		<button type="button">{element.content || 'Button'}</button>
	{:else if element.type === 'input'}
		<input type="text" placeholder={element.content || 'Input'} />
	{:else if element.type === 'textarea'}
		<textarea placeholder={element.content || 'Textarea'}></textarea>
	{:else}
		<!-- Text content for other elements -->
		{element.content || ''}
	{/if}

	<!-- Render children recursively -->
	{#each element.children as childId}
		{#if $designState.elements[childId]}
			<svelte:self element={$designState.elements[childId]} {scale} />
		{/if}
	{/each}

	<!-- STYLE: Selection outline - blue border when selected -->
	{#if isSelected}
		<div class="selection-outline"></div>

		<!-- STYLE: Resize handles - 8 handles around element -->
		<div class="resize-handle resize-n" data-handle="n"></div>
		<div class="resize-handle resize-ne" data-handle="ne"></div>
		<div class="resize-handle resize-e" data-handle="e"></div>
		<div class="resize-handle resize-se" data-handle="se"></div>
		<div class="resize-handle resize-s" data-handle="s"></div>
		<div class="resize-handle resize-sw" data-handle="sw"></div>
		<div class="resize-handle resize-w" data-handle="w"></div>
		<div class="resize-handle resize-nw" data-handle="nw"></div>
	{/if}
</div>

<style>
	/* STYLE: Add your design here! */
	/* This is unstyled semantic HTML with functional logic */

	.canvas-element {
		position: absolute;
		cursor: move;
		user-select: none;
		box-sizing: border-box;
		z-index: 10; /* Above baseline grid */
	}

	.canvas-element.selected {
		outline: 2px solid #3b82f6;
		outline-offset: 0;
	}

	.selection-outline {
		position: absolute;
		inset: -2px;
		border: 2px solid #3b82f6;
		pointer-events: none;
	}

	.resize-handle {
		position: absolute;
		width: 8px;
		height: 8px;
		background: white;
		border: 1px solid #3b82f6;
		z-index: 10;
	}

	.resize-n {
		top: -4px;
		left: 50%;
		transform: translateX(-50%);
		cursor: ns-resize;
	}

	.resize-ne {
		top: -4px;
		right: -4px;
		cursor: nesw-resize;
	}

	.resize-e {
		top: 50%;
		right: -4px;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	.resize-se {
		bottom: -4px;
		right: -4px;
		cursor: nwse-resize;
	}

	.resize-s {
		bottom: -4px;
		left: 50%;
		transform: translateX(-50%);
		cursor: ns-resize;
	}

	.resize-sw {
		bottom: -4px;
		left: -4px;
		cursor: nesw-resize;
	}

	.resize-w {
		top: 50%;
		left: -4px;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	.resize-nw {
		top: -4px;
		left: -4px;
		cursor: nwse-resize;
	}
</style>

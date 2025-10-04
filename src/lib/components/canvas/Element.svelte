<script lang="ts">
	/**
	 * Element Component
	 * Basic design element (box) that can be positioned on canvas or inside artboards.
	 * This is the foundation for all design elements (text, images, etc. will extend this).
	 */
	import type { CanvasElement } from '$lib/types/canvas';

	export let element: CanvasElement;
</script>

<!-- Element positioned absolutely within its container (artboard or canvas) -->
<div
	class="element"
	class:box={element.type === 'box'}
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
>
	<!-- Box type shows colored background -->
	{#if element.type === 'box'}
		<div class="box-content"></div>
	{/if}
</div>

<style>
	.element {
		position: absolute;
		pointer-events: auto;
	}

	/* Box element styling */
	.element.box .box-content {
		width: 100%;
		height: 100%;
		background: #4a90e2;
		border: 2px solid #2c5aa0;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>

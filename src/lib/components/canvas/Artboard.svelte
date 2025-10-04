<script lang="ts">
	/**
	 * Artboard Component
	 * Fixed-size frame within the infinite canvas (like Figma frames or Illustrator artboards)
	 * Each artboard can have its own grid, background, and contains design elements
	 */
	import type { Artboard } from '$lib/types/canvas';

	export let artboard: Artboard;
</script>

<!-- Artboard frame positioned absolutely on infinite canvas -->
<div
	class="artboard"
	style="
		left: {artboard.x}px;
		top: {artboard.y}px;
		width: {artboard.width}px;
		height: {artboard.height}px;
		background-color: {artboard.backgroundColor};
	"
	class:show-grid={artboard.showGrid}
	style:--grid-size="{artboard.gridSize || 20}px"
	style:--grid-color="{artboard.gridColor || 'rgba(0, 0, 0, 0.05)'}"
	data-artboard-id={artboard.id}
>
	<!-- Artboard label -->
	<div class="artboard-label">
		{artboard.name}
		{#if artboard.isPublishTarget}
			<span class="publish-badge">📤</span>
		{/if}
	</div>

	<!-- Child elements render here -->
	<slot />
</div>

<style>
	.artboard {
		position: absolute;
		border: 2px solid #999;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	/* Per-artboard grid using CSS variables */
	.artboard.show-grid {
		background-image: 
			linear-gradient(var(--grid-color) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
	}

	/* Artboard name label */
	.artboard-label {
		position: absolute;
		top: -28px;
		left: 0;
		font-size: 12px;
		font-weight: 600;
		color: #666;
		background: white;
		padding: 4px 8px;
		border-radius: 4px 4px 0 0;
		border: 2px solid #999;
		border-bottom: none;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.publish-badge {
		font-size: 10px;
	}
</style>

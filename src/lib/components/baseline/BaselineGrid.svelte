<script lang="ts">
	/**
	 * Baseline Grid Overlay Component
	 * Visual grid overlay showing baseline lines
	 */
	import type { BaselineConfig } from '$lib/types/baseline';

	export let config: BaselineConfig;
	export let width: number;
	export let height: number;
</script>

{#if config.showGrid}
	<!-- SVG grid overlay -->
	<svg
		class="baseline-grid"
		{width}
		{height}
		style="
			opacity: {config.opacity};
			pointer-events: none;
		"
	>
		<!-- Horizontal baseline lines -->
		{#each Array(Math.ceil(height / config.height)) as _, i}
			<line
				x1="0"
				y1={i * config.height}
				x2={width}
				y2={i * config.height}
				stroke={config.color}
				stroke-width="1"
			/>
		{/each}
	</svg>
{/if}

<style>
	.baseline-grid {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 1000;
	}
</style>

<script lang="ts">
	/**
	 * Canvas Component
	 * Infinite viewport container for artboards and design elements.
	 * Supports pan/zoom (to be implemented) and multiple artboards.
	 */
	import type { CanvasConfig } from '$lib/types/canvas';

	// Canvas configuration with defaults
	export let config: CanvasConfig = {
		backgroundColor: '#f0f0f0',
		maxArtboards: 10,
		showPerformanceWarning: true
	};
</script>

<!-- Infinite canvas viewport -->
<div
	class="canvas"
	style="background-color: {config.backgroundColor};"
>
	<!-- Artboards and elements render here -->
	<slot />
</div>

<style>
	.canvas {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: auto; /* Scroll for now, pan/zoom later */
		min-height: 600px;
	}
</style>

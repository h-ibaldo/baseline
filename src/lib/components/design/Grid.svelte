<script lang="ts">
	/**
	 * Grid Component
	 * CSS Grid layout component with baseline awareness
	 */
	import type { GridProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	export let props: GridProps;
	export let baselineHeight = 8;

	$: columnGap = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.columnGap || 16, baselineHeight)
		: (props.columnGap || 16);

	$: rowGap = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.rowGap || 16, baselineHeight)
		: (props.rowGap || 16);

	$: styles = `
		display: grid;
		grid-template-columns: repeat(${props.columns || 3}, 1fr);
		${props.rows ? `grid-template-rows: repeat(${props.rows}, 1fr);` : ''}
		column-gap: ${columnGap}px;
		row-gap: ${rowGap}px;
		grid-auto-flow: ${props.autoFlow || 'row'};
		align-items: ${props.alignItems || 'start'};
		justify-items: ${props.justifyItems || 'start'};
		background-color: ${props.backgroundColor || 'transparent'};
		padding: ${typeof props.padding === 'number' ? `${props.padding}px` : '0'};
		border-radius: ${props.borderRadius || 0}px;
	`.trim();
</script>

<div style={styles} class="baseline-grid">
	<slot />
</div>

<style>
	.baseline-grid {
		width: 100%;
	}
</style>


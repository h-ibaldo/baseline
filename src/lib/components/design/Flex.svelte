<script lang="ts">
	/**
	 * Flex Component
	 * Flexbox layout component
	 */
	import type { FlexProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	export let props: FlexProps;
	export let baselineHeight = 8;

	$: gap = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.gap || 16, baselineHeight)
		: (props.gap || 16);

	$: styles = `
		display: flex;
		flex-direction: ${props.direction || 'row'};
		flex-wrap: ${props.wrap || 'nowrap'};
		align-items: ${props.alignItems || 'start'};
		justify-content: ${props.justifyContent || 'start'};
		gap: ${gap}px;
		background-color: ${props.backgroundColor || 'transparent'};
		padding: ${typeof props.padding === 'number' ? `${props.padding}px` : '0'};
		border-radius: ${props.borderRadius || 0}px;
	`.trim();
</script>

<div style={styles} class="baseline-flex">
	<slot />
</div>

<style>
	.baseline-flex {
		width: 100%;
	}
</style>


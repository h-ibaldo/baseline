<script lang="ts">
	/**
	 * Container Component
	 * Flexible container for layout
	 */
	import type { ContainerProps } from '$lib/types/components';

	export let props: ContainerProps;

	$: styles = `
		display: ${props.display || 'block'};
		max-width: ${props.maxWidth ? `${props.maxWidth}px` : 'none'};
		min-width: ${props.minWidth ? `${props.minWidth}px` : 'auto'};
		background-color: ${props.backgroundColor || 'transparent'};
		padding: ${typeof props.padding === 'number' ? `${props.padding}px` : '0'};
		${props.display === 'flex' || props.display === 'grid' ? `
			align-items: ${props.alignItems || 'start'};
			justify-content: ${props.justifyContent || 'start'};
			gap: ${props.gap || 0}px;
		` : ''}
		border-radius: ${props.borderRadius || 0}px;
	`.trim();
</script>

<div style={styles} class="baseline-container">
	<slot />
</div>

<style>
	.baseline-container {
		width: 100%;
	}
</style>


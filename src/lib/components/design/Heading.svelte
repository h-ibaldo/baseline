<script lang="ts">
	/**
	 * Heading Component
	 * Baseline-aware heading component (H1-H6)
	 * Automatically snaps to baseline grid when enabled
	 */
	import type { HeadingProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	// Props
	export let props: HeadingProps;
	export let baselineHeight = 8;

	// Reactive computed styles
	$: fontSize = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.fontSize || 48, baselineHeight)
		: (props.fontSize || 48);

	$: lineHeight = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.lineHeight || 56, baselineHeight)
		: (props.lineHeight || 56);

	$: tag = `h${props.level || 1}`;

	$: styles = `
		font-family: ${props.fontFamily || 'system-ui, -apple-system, sans-serif'};
		font-size: ${fontSize}px;
		line-height: ${lineHeight}px;
		font-weight: ${props.fontWeight || 700};
		color: ${props.color || '#000000'};
		text-align: ${props.textAlign || 'left'};
		letter-spacing: ${props.letterSpacing || 0}px;
		text-transform: ${props.textTransform || 'none'};
		margin: 0;
		padding: 0;
	`.trim();
</script>

<svelte:element this={tag} style={styles} class="baseline-heading">
	{props.text}
</svelte:element>

<style>
	.baseline-heading {
		display: block;
		width: 100%;
	}
</style>


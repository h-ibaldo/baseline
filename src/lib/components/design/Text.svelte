<script lang="ts">
	/**
	 * Text Component
	 * Inline text component
	 */
	import type { TextProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	export let props: TextProps;
	export let baselineHeight = 8;

	$: fontSize = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.fontSize || 16, baselineHeight)
		: (props.fontSize || 16);

	$: lineHeight = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.lineHeight || 24, baselineHeight)
		: (props.lineHeight || 24);

	$: styles = `
		font-family: ${props.fontFamily || 'system-ui, -apple-system, sans-serif'};
		font-size: ${fontSize}px;
		line-height: ${lineHeight}px;
		font-weight: ${props.fontWeight || 400};
		color: ${props.color || '#000000'};
		text-align: ${props.textAlign || 'left'};
		letter-spacing: ${props.letterSpacing || 0}px;
		text-decoration: ${props.textDecoration || 'none'};
		font-style: ${props.fontStyle || 'normal'};
	`.trim();
</script>

<span style={styles} class="baseline-text">
	{props.text}
</span>

<style>
	.baseline-text {
		display: inline;
	}
</style>


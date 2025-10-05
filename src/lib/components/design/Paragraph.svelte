<script lang="ts">
	/**
	 * Paragraph Component
	 * Baseline-aware paragraph component for body text
	 */
	import type { ParagraphProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	export let props: ParagraphProps;
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
		color: ${props.color || '#333333'};
		text-align: ${props.textAlign || 'left'};
		letter-spacing: ${props.letterSpacing || 0}px;
		max-width: ${props.maxWidth ? `${props.maxWidth}px` : 'none'};
		margin: 0;
		padding: 0;
	`.trim();
</script>

<p style={styles} class="baseline-paragraph">
	{props.text}
</p>

<style>
	.baseline-paragraph {
		display: block;
	}
</style>


<script lang="ts">
	/**
	 * Input Component
	 * Text input field with baseline alignment
	 */
	import type { InputProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	export let props: InputProps;
	export let baselineHeight = 8;

	$: fontSize = props.snapToBaseline && $baselineConfig.enabled
		? snapToBaseline(props.fontSize || 16, baselineHeight)
		: (props.fontSize || 16);

	$: styles = `
		width: 100%;
		font-family: ${props.fontFamily || 'system-ui, -apple-system, sans-serif'};
		font-size: ${fontSize}px;
		padding: 8px 12px;
		background-color: ${props.backgroundColor || '#ffffff'};
		color: ${props.color || '#000000'};
		border: ${props.borderWidth || 1}px ${props.borderStyle || 'solid'} ${props.borderColor || '#ddd'};
		border-radius: ${props.borderRadius || 4}px;
		opacity: ${props.opacity || 1};
		box-sizing: border-box;
	`.trim();
</script>

<div class="input-wrapper">
	{#if props.label}
		<label class="input-label">{props.label}</label>
	{/if}
	<input
		type={props.inputType || 'text'}
		placeholder={props.placeholder}
		value={props.value || ''}
		disabled={props.disabled}
		required={props.required}
		style={styles}
		class="baseline-input"
	/>
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.input-label {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.baseline-input:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	.baseline-input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}
</style>


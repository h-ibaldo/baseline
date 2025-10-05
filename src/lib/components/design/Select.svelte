<script lang="ts">
	/**
	 * Select Component
	 * Dropdown select field
	 */
	import type { SelectProps } from '$lib/types/components';
	import { snapToBaseline } from '$lib/utils/baseline';
	import { baselineConfig } from '$lib/stores/baseline';

	export let props: SelectProps;
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
		border: ${props.borderWidth || 1}px solid ${props.borderColor || '#ddd'};
		border-radius: ${props.borderRadius || 4}px;
		opacity: ${props.opacity || 1};
		box-sizing: border-box;
		cursor: pointer;
	`.trim();
</script>

<div class="select-wrapper">
	{#if props.label}
		<label class="select-label">{props.label}</label>
	{/if}
	<select
		value={props.value || ''}
		disabled={props.disabled}
		required={props.required}
		style={styles}
		class="baseline-select"
	>
		{#if props.placeholder}
			<option value="" disabled selected>{props.placeholder}</option>
		{/if}
		{#each props.options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>

<style>
	.select-wrapper {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.select-label {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.baseline-select:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	.baseline-select:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}
</style>


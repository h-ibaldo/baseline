<script lang="ts">
	/**
	 * Button Component
	 * Interactive button with baseline alignment
	 */
	import type { ButtonProps } from '$lib/types/components';

	export let props: ButtonProps;

	$: sizeStyles = {
		small: 'padding: 6px 12px; font-size: 14px;',
		medium: 'padding: 10px 20px; font-size: 16px;',
		large: 'padding: 14px 28px; font-size: 18px;'
	}[props.size || 'medium'];

	$: variantStyles = {
		primary: `
			background-color: ${props.backgroundColor || '#007bff'};
			color: ${props.color || '#ffffff'};
			border: none;
		`,
		secondary: `
			background-color: ${props.backgroundColor || '#6c757d'};
			color: ${props.color || '#ffffff'};
			border: none;
		`,
		outline: `
			background-color: transparent;
			color: ${props.color || '#007bff'};
			border: 2px solid ${props.backgroundColor || '#007bff'};
		`,
		text: `
			background-color: transparent;
			color: ${props.color || '#007bff'};
			border: none;
		`
	}[props.variant || 'primary'];

	$: styles = `
		${sizeStyles}
		${variantStyles}
		font-family: ${props.fontFamily || 'system-ui, -apple-system, sans-serif'};
		font-weight: ${props.fontWeight || 600};
		border-radius: ${props.borderRadius || 4}px;
		cursor: ${props.disabled ? 'not-allowed' : 'pointer'};
		opacity: ${props.disabled ? 0.6 : (props.opacity || 1)};
		transition: all 0.2s;
	`.trim();
</script>

<button
	style={styles}
	class="baseline-button"
	disabled={props.disabled}
	type="button"
>
	{props.text}
</button>

<style>
	.baseline-button {
		display: inline-block;
		text-align: center;
		white-space: nowrap;
		vertical-align: middle;
		user-select: none;
	}

	.baseline-button:hover:not(:disabled) {
		filter: brightness(0.9);
	}

	.baseline-button:active:not(:disabled) {
		transform: translateY(1px);
	}
</style>


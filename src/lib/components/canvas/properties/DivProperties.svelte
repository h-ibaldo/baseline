<script lang="ts">
	/**
	 * DivProperties - Properties for Div elements
	 *
	 * Features:
	 * - Frame toggle (converts div to frame)
	 * - Layout properties
	 * - Background, border, spacing
	 */

	import type { Element } from '$lib/types/events';
	import { updateElementStyles, toggleFrame } from '$lib/stores/design-store';

	export let element: Element;

	// Frame toggle state (stored in element metadata)
	$: isFrame = element.isFrame || false;

	async function handleToggleFrame() {
		await toggleFrame(element.id, !isFrame, `Frame ${element.id.slice(0, 8)}`, 1440, false);
	}

	// Background color
	$: backgroundColor = element.styles?.backgroundColor || '#f5f5f5';

	function updateBackgroundColor(e: Event) {
		const input = e.target as HTMLInputElement;
		updateElementStyles(element.id, { backgroundColor: input.value });
	}

	// Border
	$: borderWidth = element.styles?.borderWidth || '0px';
	$: borderColor = element.styles?.borderColor || '#000000';
	$: borderStyle = element.styles?.borderStyle || 'solid';

	function updateBorder(property: string, value: string) {
		updateElementStyles(element.id, { [property]: value });
	}

	// Opacity
	$: opacity = element.styles?.opacity !== undefined ? element.styles.opacity : 1;

	function updateOpacity(e: Event) {
		const input = e.target as HTMLInputElement;
		updateElementStyles(element.id, { opacity: parseFloat(input.value) });
	}
</script>

<div class="div-properties">
	<!-- Frame Toggle -->
	<div class="property-section">
		<h3>Type</h3>
		<label class="toggle-label">
			<input type="checkbox" checked={isFrame} on:change={handleToggleFrame} />
			<span>Convert to Frame</span>
		</label>
		{#if isFrame}
			<p class="hint">This div is a frame (page/breakpoint)</p>
		{/if}
	</div>

	<!-- Background -->
	<div class="property-section">
		<h3>Background</h3>
		<div class="property-row">
			<label>
				<span>Color</span>
				<input type="color" value={backgroundColor} on:input={updateBackgroundColor} />
			</label>
		</div>
	</div>

	<!-- Border -->
	<div class="property-section">
		<h3>Border</h3>
		<div class="property-row">
			<label>
				<span>Width</span>
				<input
					type="text"
					value={borderWidth}
					on:input={(e) => updateBorder('borderWidth', e.currentTarget.value)}
				/>
			</label>
		</div>
		<div class="property-row">
			<label>
				<span>Color</span>
				<input
					type="color"
					value={borderColor}
					on:input={(e) => updateBorder('borderColor', e.currentTarget.value)}
				/>
			</label>
		</div>
		<div class="property-row">
			<label>
				<span>Style</span>
				<select
					value={borderStyle}
					on:change={(e) => updateBorder('borderStyle', e.currentTarget.value)}
				>
					<option value="solid">Solid</option>
					<option value="dashed">Dashed</option>
					<option value="dotted">Dotted</option>
				</select>
			</label>
		</div>
	</div>

	<!-- Opacity -->
	<div class="property-section">
		<h3>Opacity</h3>
		<div class="property-row">
			<label>
				<span>{Math.round(opacity * 100)}%</span>
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={opacity}
					on:input={updateOpacity}
				/>
			</label>
		</div>
	</div>

	<!-- Element Info -->
	<div class="property-section">
		<h3>Info</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Position</span>
				<span class="info-value">{Math.round(element.position.x)}, {Math.round(element.position.y)}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Size</span>
				<span class="info-value"
					>{Math.round(element.size.width)} × {Math.round(element.size.height)}</span
				>
			</div>
		</div>
	</div>
</div>

<style>
	.div-properties {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.property-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.property-section h3 {
		font-size: 12px;
		font-weight: 600;
		color: #333;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.property-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.property-row label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
	}

	.property-row label span {
		color: #666;
		font-size: 12px;
	}

	.property-row input[type='text'],
	.property-row select {
		padding: 6px 8px;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		font-size: 13px;
		font-family: inherit;
	}

	.property-row input[type='color'] {
		height: 32px;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		cursor: pointer;
	}

	.property-row input[type='range'] {
		width: 100%;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		background: #f5f5f5;
		border-radius: 4px;
		cursor: pointer;
		font-size: 13px;
	}

	.toggle-label:hover {
		background: #e8e8e8;
	}

	.toggle-label input[type='checkbox'] {
		cursor: pointer;
	}

	.hint {
		font-size: 11px;
		color: #999;
		margin: 0;
		padding: 4px 8px;
		background: #f9f9f9;
		border-radius: 4px;
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		padding: 8px;
		background: #f5f5f5;
		border-radius: 4px;
		font-size: 12px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.info-label {
		color: #999;
		font-size: 11px;
	}

	.info-value {
		color: #333;
		font-weight: 500;
	}
</style>

<script lang="ts">
	import type { ExportConfig } from '$lib/types/ast';
	import { createDefaultExportConfig } from '$lib/utils/export-service';

	export let config: ExportConfig = createDefaultExportConfig();
	export let onExport: (() => void) | undefined = undefined;
	export let onCancel: (() => void) | undefined = undefined;

	let expanded = {
		html: true,
		css: true,
		optimization: false,
		structure: false
	};

	function toggleSection(section: keyof typeof expanded) {
		expanded[section] = !expanded[section];
	}
</script>

<div class="export-config">
	<h3>Export Configuration</h3>

	<!-- HTML Options -->
	<section class="config-section">
		<button class="section-header" on:click={() => toggleSection('html')}>
			<span class="icon">{expanded.html ? '▼' : '▶'}</span>
			<span>HTML Options</span>
		</button>

		{#if expanded.html}
			<div class="section-content">
				<label>
					<input type="checkbox" bind:checked={config.codeOptions.includeDoctype} />
					Include DOCTYPE
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.includeMetaTags} />
					Include meta tags
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.prettyPrint} />
					Pretty print
				</label>

				{#if config.codeOptions.prettyPrint}
					<div class="indent-options">
						<label>
							<input
								type="radio"
								bind:group={config.codeOptions.indentation}
								value="spaces"
							/>
							Spaces
						</label>

						<label>
							<input type="radio" bind:group={config.codeOptions.indentation} value="tabs" />
							Tabs
						</label>

						{#if config.codeOptions.indentation === 'spaces'}
							<label class="inline-label">
								<span>Indent size:</span>
								<input
									type="number"
									min="2"
									max="8"
									bind:value={config.codeOptions.indentSize}
									class="small-input"
								/>
							</label>
						{/if}
					</div>
				{/if}

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.includeSemanticHtml} />
					Use semantic HTML5 tags
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.includeAriaLabels} />
					Add ARIA labels
				</label>
			</div>
		{/if}
	</section>

	<!-- CSS Options -->
	<section class="config-section">
		<button class="section-header" on:click={() => toggleSection('css')}>
			<span class="icon">{expanded.css ? '▼' : '▶'}</span>
			<span>CSS Options</span>
		</button>

		{#if expanded.css}
			<div class="section-content">
				<label class="full-width">
					<span>CSS Format:</span>
					<select bind:value={config.codeOptions.cssFormat}>
						<option value="inline">Inline (style attribute)</option>
						<option value="embedded">Embedded (in &lt;style&gt; tag)</option>
						<option value="external">External (separate file)</option>
					</select>
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.cssVariables} />
					Use CSS variables
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.cssMinify} />
					Minify CSS
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.cssPrefix} />
					Add vendor prefixes
				</label>

				<label class="full-width">
					<span>Class naming:</span>
					<select bind:value={config.cssNaming}>
						<option value="component">Component-based</option>
						<option value="bem">BEM</option>
						<option value="atomic">Atomic/utility</option>
						<option value="semantic">Semantic</option>
					</select>
				</label>
			</div>
		{/if}
	</section>

	<!-- Optimization Options -->
	<section class="config-section">
		<button class="section-header" on:click={() => toggleSection('optimization')}>
			<span class="icon">{expanded.optimization ? '▼' : '▶'}</span>
			<span>Optimization</span>
		</button>

		{#if expanded.optimization}
			<div class="section-content">
				<label>
					<input type="checkbox" bind:checked={config.codeOptions.removeDuplicateStyles} />
					Remove duplicate styles
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.removeComments} />
					Remove comments
				</label>

				<label>
					<input type="checkbox" bind:checked={config.codeOptions.optimizeImages} />
					Optimize images
				</label>
			</div>
		{/if}
	</section>

	<!-- File Structure -->
	<section class="config-section">
		<button class="section-header" on:click={() => toggleSection('structure')}>
			<span class="icon">{expanded.structure ? '▼' : '▶'}</span>
			<span>File Structure</span>
		</button>

		{#if expanded.structure}
			<div class="section-content">
				<label class="full-width">
					<span>HTML directory:</span>
					<input
						type="text"
						bind:value={config.fileStructure!.htmlDir}
						placeholder="."
						class="text-input"
					/>
				</label>

				<label class="full-width">
					<span>CSS directory:</span>
					<input
						type="text"
						bind:value={config.fileStructure!.cssDir}
						placeholder="css"
						class="text-input"
					/>
				</label>

				<label class="full-width">
					<span>Assets directory:</span>
					<input
						type="text"
						bind:value={config.fileStructure!.assetsDir}
						placeholder="assets"
						class="text-input"
					/>
				</label>
			</div>
		{/if}
	</section>

	<!-- Action Buttons -->
	<div class="actions">
		{#if onCancel}
			<button class="btn btn-secondary" on:click={onCancel}> Cancel </button>
		{/if}
		{#if onExport}
			<button class="btn btn-primary" on:click={onExport}> Export </button>
		{/if}
	</div>
</div>

<style>
	.export-config {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.5rem;
		max-width: 600px;
	}

	h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		color: #1a1a1a;
	}

	.config-section {
		margin-bottom: 1rem;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		overflow: hidden;
	}

	.section-header {
		width: 100%;
		padding: 0.75rem 1rem;
		background: #f5f5f5;
		border: none;
		text-align: left;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.2s;
	}

	.section-header:hover {
		background: #e5e5e5;
	}

	.icon {
		font-size: 0.75rem;
		color: #666;
	}

	.section-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #333;
		cursor: pointer;
		user-select: none;
	}

	label.full-width {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
	}

	label.inline-label {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		margin-left: 2rem;
	}

	label span {
		font-weight: 500;
	}

	input[type='checkbox'],
	input[type='radio'] {
		cursor: pointer;
	}

	.indent-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-left: 1.5rem;
		padding-left: 1rem;
		border-left: 2px solid #e5e5e5;
	}

	select,
	.text-input {
		padding: 0.5rem;
		border: 1px solid #d0d0d0;
		border-radius: 4px;
		font-size: 0.9rem;
		width: 100%;
		background: white;
	}

	select:focus,
	.text-input:focus {
		outline: none;
		border-color: #0066cc;
	}

	.small-input {
		width: 60px;
		padding: 0.25rem 0.5rem;
		border: 1px solid #d0d0d0;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e5e5;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #0066cc;
		color: white;
	}

	.btn-primary:hover {
		background: #0052a3;
	}

	.btn-secondary {
		background: #f5f5f5;
		color: #333;
		border: 1px solid #d0d0d0;
	}

	.btn-secondary:hover {
		background: #e5e5e5;
	}
</style>


<script lang="ts">
	import ExportConfig from '$lib/components/ui/ExportConfig.svelte';
	import type { CanvasState } from '$lib/types/canvas';
	import type { ExportConfig as ExportConfigType } from '$lib/types/ast';
	import {
		exportAsZip,
		downloadBlob,
		createDefaultExportConfig,
		estimateExportSize,
		validateExportConfig
	} from '$lib/utils/export-service';

	// Sample design state
	const sampleDesignState: CanvasState = {
		config: {
			backgroundColor: '#f5f5f5',
			maxArtboards: 10
		},
		artboards: [
			{
				id: 'artboard-home',
				name: 'Home Page',
				x: 100,
				y: 100,
				width: 1200,
				height: 800,
				backgroundColor: '#ffffff',
				showGrid: true,
				gridSize: 20,
				isPublishTarget: true
			},
			{
				id: 'artboard-about',
				name: 'About Us',
				x: 100,
				y: 1000,
				width: 1200,
				height: 600,
				backgroundColor: '#f8f8f8',
				showGrid: true,
				gridSize: 20,
				isPublishTarget: true
			}
		],
		elements: [
			// Home page elements
			{
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-home',
				x: 50,
				y: 50,
				width: 1100,
				height: 80,
				opacity: 1,
				snapToBaseline: true
			},
			{
				id: 'element-2',
				type: 'box',
				artboardId: 'artboard-home',
				x: 50,
				y: 150,
				width: 500,
				height: 300,
				opacity: 1,
				snapToBaseline: true
			},
			{
				id: 'element-3',
				type: 'box',
				artboardId: 'artboard-home',
				x: 570,
				y: 150,
				width: 580,
				height: 300,
				opacity: 1,
				snapToBaseline: true
			},
			// About page elements
			{
				id: 'element-4',
				type: 'box',
				artboardId: 'artboard-about',
				x: 50,
				y: 50,
				width: 1100,
				height: 500,
				opacity: 1,
				snapToBaseline: true
			}
		]
	};

	let exportConfig: ExportConfigType = createDefaultExportConfig();
	let showConfig = false;
	let exporting = false;
	let exportStatus = '';
	let estimatedSize = { bytes: 0, kb: 0, mb: 0 };

	// Calculate estimated size
	$: {
		estimatedSize = estimateExportSize(sampleDesignState, exportConfig, {
			enabled: true,
			height: 8
		});
	}

	// Validate config
	$: validation = validateExportConfig(exportConfig);

	async function handleExport() {
		exportStatus = 'Preparing export...';
		exporting = true;

		try {
			// Generate ZIP
			exportStatus = 'Generating HTML and CSS...';
			const blob = await exportAsZip(
				sampleDesignState,
				exportConfig,
				{ enabled: true, height: 8 }
			);

			// Download
			exportStatus = 'Downloading...';
			const timestamp = new Date().toISOString().split('T')[0];
			const filename = `baseline-export-${timestamp}.zip`;
			downloadBlob(blob, filename);

			exportStatus = `✅ Exported successfully! (${filename})`;
			showConfig = false;

			// Reset status after 3 seconds
			setTimeout(() => {
				exportStatus = '';
			}, 3000);
		} catch (error) {
			exportStatus = `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
			console.error('Export error:', error);
		} finally {
			exporting = false;
		}
	}

	function quickExport(format: 'minimal' | 'standard' | 'optimized') {
		const config = createDefaultExportConfig();

		switch (format) {
			case 'minimal':
				config.codeOptions.prettyPrint = false;
				config.codeOptions.includeMetaTags = false;
				config.codeOptions.cssMinify = true;
				config.codeOptions.removeComments = true;
				break;

			case 'optimized':
				config.codeOptions.cssMinify = true;
				config.codeOptions.removeDuplicateStyles = true;
				config.codeOptions.removeComments = true;
				config.codeOptions.cssPrefix = true;
				break;

			case 'standard':
			default:
			// Use default config
		}

		exportConfig = config;
		handleExport();
	}
</script>

<svelte:head>
	<title>Export Demo - Baseline</title>
</svelte:head>

<div class="container">
	<header>
		<h1>📦 Export Demo</h1>
		<p>Export your designs as production-ready HTML/CSS</p>
	</header>

	<!-- Quick Export Options -->
	<section class="quick-export">
		<h2>Quick Export</h2>
		<p class="description">One-click export with preset configurations</p>

		<div class="quick-buttons">
			<button class="quick-btn" on:click={() => quickExport('minimal')} disabled={exporting}>
				<div class="btn-icon">🎯</div>
				<div class="btn-content">
					<h3>Minimal</h3>
					<p>Compact output, minified CSS</p>
				</div>
			</button>

			<button class="quick-btn" on:click={() => quickExport('standard')} disabled={exporting}>
				<div class="btn-icon">✨</div>
				<div class="btn-content">
					<h3>Standard</h3>
					<p>Pretty printed, readable code</p>
				</div>
			</button>

			<button class="quick-btn" on:click={() => quickExport('optimized')} disabled={exporting}>
				<div class="btn-icon">⚡</div>
				<div class="btn-content">
					<h3>Optimized</h3>
					<p>Production-ready, optimized</p>
				</div>
			</button>
		</div>
	</section>

	<!-- Custom Export -->
	<section class="custom-export">
		<div class="section-header">
			<div>
				<h2>Custom Export</h2>
				<p class="description">Configure export options in detail</p>
			</div>
			<button class="btn btn-primary" on:click={() => (showConfig = !showConfig)}>
				{showConfig ? 'Hide' : 'Show'} Configuration
			</button>
		</div>

		{#if showConfig}
			<div class="config-panel">
				<ExportConfig
					bind:config={exportConfig}
					onExport={handleExport}
					onCancel={() => (showConfig = false)}
				/>
			</div>
		{/if}
	</section>

	<!-- Export Info -->
	<section class="export-info">
		<h2>Export Information</h2>

		<div class="info-grid">
			<div class="info-card">
				<div class="info-icon">📄</div>
				<div class="info-content">
					<h3>Pages</h3>
					<p class="info-value">{sampleDesignState.artboards.filter((a) => a.isPublishTarget).length}</p>
					<p class="info-label">
						{sampleDesignState.artboards.map((a) => a.name).join(', ')}
					</p>
				</div>
			</div>

			<div class="info-card">
				<div class="info-icon">🎨</div>
				<div class="info-content">
					<h3>Elements</h3>
					<p class="info-value">{sampleDesignState.elements.length}</p>
					<p class="info-label">Design components</p>
				</div>
			</div>

			<div class="info-card">
				<div class="info-icon">📦</div>
				<div class="info-content">
					<h3>Estimated Size</h3>
					<p class="info-value">
						{estimatedSize.kb < 1 ? `${estimatedSize.bytes} B` : `${estimatedSize.kb} KB`}
					</p>
					<p class="info-label">Before compression</p>
				</div>
			</div>

			<div class="info-card">
				<div class="info-icon">{validation.valid ? '✅' : '⚠️'}</div>
				<div class="info-content">
					<h3>Configuration</h3>
					<p class="info-value">{validation.valid ? 'Valid' : 'Issues'}</p>
					<p class="info-label">
						{validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
					</p>
				</div>
			</div>
		</div>

		<!-- Validation Messages -->
		{#if validation.errors.length > 0}
			<div class="alert alert-error">
				<strong>Errors:</strong>
				<ul>
					{#each validation.errors as error}
						<li>{error}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if validation.warnings.length > 0}
			<div class="alert alert-warning">
				<strong>Warnings:</strong>
				<ul>
					{#each validation.warnings as warning}
						<li>{warning}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>

	<!-- Status -->
	{#if exportStatus}
		<div class="status" class:success={exportStatus.includes('✅')} class:error={exportStatus.includes('❌')}>
			{exportStatus}
		</div>
	{/if}

	<!-- Export Details -->
	<section class="details">
		<h2>What's Included</h2>

		<div class="feature-list">
			<div class="feature">
				<span class="feature-icon">📄</span>
				<div class="feature-content">
					<h3>HTML Files</h3>
					<p>One HTML file per published artboard with semantic markup</p>
				</div>
			</div>

			<div class="feature">
				<span class="feature-icon">🎨</span>
				<div class="feature-content">
					<h3>CSS Styles</h3>
					<p>Optimized CSS with baseline grid support and modern features</p>
				</div>
			</div>

			<div class="feature">
				<span class="feature-icon">📖</span>
				<div class="feature-content">
					<h3>README</h3>
					<p>Documentation with project info and deployment instructions</p>
				</div>
			</div>

			<div class="feature">
				<span class="feature-icon">🚀</span>
				<div class="feature-content">
					<h3>Deploy Ready</h3>
					<p>Upload to any static host - no build step required</p>
				</div>
			</div>
		</div>
	</section>

	<footer>
		<a href="/">← Back to Home</a>
	</footer>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #1a1a1a;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #2a2a2a;
	}

	section {
		margin-bottom: 3rem;
	}

	.description {
		color: #666;
		margin-bottom: 1.5rem;
	}

	/* Quick Export */
	.quick-export {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.quick-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.quick-btn {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: white;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.quick-btn:hover:not(:disabled) {
		border-color: #0066cc;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
	}

	.quick-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-icon {
		font-size: 2rem;
	}

	.btn-content h3 {
		font-size: 1rem;
		margin: 0 0 0.25rem 0;
		color: #1a1a1a;
	}

	.btn-content p {
		font-size: 0.85rem;
		margin: 0;
		color: #666;
	}

	/* Custom Export */
	.custom-export {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	.config-panel {
		margin-top: 1.5rem;
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

	/* Export Info */
	.export-info {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.info-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: #f8f8f8;
		border-radius: 6px;
	}

	.info-icon {
		font-size: 2rem;
	}

	.info-content h3 {
		font-size: 0.85rem;
		margin: 0 0 0.25rem 0;
		color: #666;
		font-weight: 500;
	}

	.info-value {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.25rem 0;
		color: #1a1a1a;
	}

	.info-label {
		font-size: 0.8rem;
		margin: 0;
		color: #999;
	}

	/* Alerts */
	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
	}

	.alert-error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
	}

	.alert-warning {
		background: #fefce8;
		border: 1px solid #fde047;
		color: #854d0e;
	}

	.alert ul {
		margin: 0.5rem 0 0 1.5rem;
	}

	/* Status */
	.status {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		padding: 1rem 1.5rem;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		font-weight: 500;
		animation: slideIn 0.3s;
	}

	.status.success {
		border-color: #86efac;
		background: #f0fdf4;
		color: #166534;
	}

	.status.error {
		border-color: #fecaca;
		background: #fef2f2;
		color: #991b1b;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* Details */
	.details {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.feature-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature {
		display: flex;
		gap: 1rem;
	}

	.feature-icon {
		font-size: 1.5rem;
	}

	.feature-content h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.feature-content p {
		font-size: 0.9rem;
		margin: 0;
		color: #666;
		line-height: 1.5;
	}

	/* Footer */
	footer {
		text-align: center;
		padding: 2rem 0;
		border-top: 1px solid #e5e5e5;
	}

	footer a {
		color: #0066cc;
		text-decoration: none;
	}

	footer a:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.quick-buttons {
			grid-template-columns: 1fr;
		}

		.info-grid,
		.feature-list {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			gap: 1rem;
		}

		.status {
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
		}
	}
</style>


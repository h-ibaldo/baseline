<script lang="ts">
	import { parseDesignToAST, validateAST, generateHTML, generateCSS } from '$lib';
	import type { CanvasState, CodeGenerationOptions } from '$lib';

	// Sample design state
	const sampleDesignState: CanvasState = {
		config: {
			backgroundColor: '#f5f5f5',
			maxArtboards: 10
		},
		artboards: [
			{
				id: 'artboard-1',
				name: 'Home Page',
				x: 100,
				y: 100,
				width: 1200,
				height: 800,
				backgroundColor: '#ffffff',
				showGrid: true,
				gridSize: 20,
				isPublishTarget: true
			}
		],
		elements: [
			{
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 50,
				y: 50,
				width: 300,
				height: 200,
				opacity: 1,
				snapToBaseline: true
			},
			{
				id: 'element-2',
				type: 'box',
				artboardId: 'artboard-1',
				x: 400,
				y: 50,
				width: 250,
				height: 150,
				opacity: 1,
				snapToBaseline: true
			}
		]
	};

	// Code generation options
	const generationOptions: CodeGenerationOptions = {
		format: 'html',
		includeDoctype: true,
		includeMetaTags: true,
		prettyPrint: true,
		indentation: 'spaces',
		indentSize: 2,
		cssFormat: 'embedded',
		cssMinify: false,
		includeAriaLabels: true,
		includeSemanticHtml: true
	};

	// Generate AST
	const ast = parseDesignToAST(sampleDesignState, { enabled: true, height: 8 });
	const validation = validateAST(ast);

	// Generate code
	let generatedCode = '';
	let generatedCSS = '';

	if (validation.valid) {
		const result = generateHTML(ast, generationOptions);
		if (result.files.length > 0) {
			generatedCode = result.files[0].content;
		}
		generatedCSS = generateCSS(ast, generationOptions);
	}

	// Pretty print AST
	let astPreview = '';
	try {
		astPreview = JSON.stringify(ast, null, 2);
	} catch (e) {
		astPreview = 'Error serializing AST';
	}

	// Download function
	function downloadHTML() {
		const blob = new Blob([generatedCode], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'generated-page.html';
		a.click();
		URL.revokeObjectURL(url);
	}

	function downloadCSS() {
		const blob = new Blob([generatedCSS], { type: 'text/css' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'styles.css';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="container">
	<header>
		<h1>🎨 Code Generation Demo</h1>
		<p>
			Demonstrates AST parsing and HTML/CSS generation from design state
		</p>
	</header>

	<div class="demo-grid">
		<!-- Design State -->
		<section class="panel">
			<h2>1. Design State</h2>
			<p class="description">Current canvas state with artboards and elements</p>
			<div class="info-box">
				<p><strong>Artboards:</strong> {sampleDesignState.artboards.length}</p>
				<p><strong>Elements:</strong> {sampleDesignState.elements.length}</p>
				<p><strong>Publishable:</strong> {sampleDesignState.artboards.filter(a => a.isPublishTarget).length}</p>
			</div>
		</section>

		<!-- AST -->
		<section class="panel">
			<h2>2. Abstract Syntax Tree (AST)</h2>
			<p class="description">Intermediate representation for code generation</p>
			
			{#if validation.valid}
				<div class="success-box">
					<p>✅ AST is valid</p>
					<p><strong>Pages:</strong> {ast.pages.length}</p>
					<p><strong>Generated at:</strong> {new Date(ast.metadata.generatedAt).toLocaleTimeString()}</p>
				</div>
			{:else}
				<div class="error-box">
					<p>❌ AST validation failed:</p>
					<ul>
						{#each validation.errors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<details>
				<summary>View AST JSON</summary>
				<pre class="code-block">{astPreview}</pre>
			</details>
		</section>

		<!-- Generated HTML -->
		<section class="panel full-width">
			<h2>3. Generated HTML</h2>
			<p class="description">Clean, semantic HTML5 output</p>
			
			<div class="button-group">
				<button on:click={downloadHTML} class="download-btn">
					⬇️ Download HTML
				</button>
			</div>

			<pre class="code-block">{generatedCode}</pre>
		</section>

		<!-- Generated CSS -->
		<section class="panel full-width">
			<h2>4. Generated CSS</h2>
			<p class="description">Optimized CSS with baseline grid support</p>
			
			<div class="button-group">
				<button on:click={downloadCSS} class="download-btn">
					⬇️ Download CSS
				</button>
			</div>

			<pre class="code-block">{generatedCSS}</pre>
		</section>

		<!-- Preview -->
		<section class="panel full-width">
			<h2>5. Live Preview</h2>
			<p class="description">Rendered output in iframe</p>
			
			<div class="iframe-container">
				<iframe
					title="Generated Page Preview"
					srcdoc={generatedCode}
					sandbox="allow-same-origin"
				></iframe>
			</div>
		</section>
	</div>

	<footer>
		<a href="/">← Back to Home</a>
	</footer>
</div>

<style>
	.container {
		max-width: 1400px;
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

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.panel {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.panel.full-width {
		grid-column: 1 / -1;
	}

	.description {
		color: #666;
		margin-bottom: 1rem;
		font-size: 0.95rem;
	}

	.info-box, .success-box, .error-box {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
	}

	.info-box {
		background: #f5f5f5;
		border: 1px solid #e0e0e0;
	}

	.success-box {
		background: #f0fdf4;
		border: 1px solid #86efac;
		color: #166534;
	}

	.error-box {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
	}

	.code-block {
		background: #1e1e1e;
		color: #d4d4d4;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		max-height: 400px;
		overflow-y: auto;
	}

	details {
		margin-top: 1rem;
		cursor: pointer;
	}

	summary {
		padding: 0.5rem;
		background: #f5f5f5;
		border-radius: 4px;
		user-select: none;
	}

	summary:hover {
		background: #e5e5e5;
	}

	.button-group {
		margin-bottom: 1rem;
	}

	.download-btn {
		background: #0066cc;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 0.95rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.download-btn:hover {
		background: #0052a3;
	}

	.iframe-container {
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		overflow: hidden;
		background: white;
	}

	iframe {
		width: 100%;
		height: 600px;
		border: none;
		display: block;
	}

	footer {
		text-align: center;
		padding: 2rem 0;
		border-top: 1px solid #e5e5e5;
	}

	footer a {
		color: #0066cc;
		text-decoration: none;
		font-size: 1rem;
	}

	footer a:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.demo-grid {
			grid-template-columns: 1fr;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>


<script lang="ts">
	import type { CanvasState } from '$lib/types/canvas';

	// Sample design state
	const sampleDesign: CanvasState = {
		config: { backgroundColor: '#f5f5f5', maxArtboards: 10 },
		artboards: [
			{
				id: 'demo-page',
				name: 'Demo Page',
				x: 100,
				y: 100,
				width: 1200,
				height: 800,
				backgroundColor: '#ffffff',
				showGrid: true,
				isPublishTarget: true
			}
		],
		elements: [
			{
				id: 'el-1',
				type: 'box',
				artboardId: 'demo-page',
				x: 50,
				y: 50,
				width: 1100,
				height: 100
			}
		]
	};

	let status = '';
	let publishing = false;
	let pageId = '';
	let publishedUrl = '';

	async function createPage() {
		status = 'Creating page...';
		publishing = true;

		try {
			const response = await fetch('/api/pages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug: `demo-${Date.now()}`,
					title: 'Demo Page',
					description: 'A demonstration of the publishing system',
					designEvents: JSON.stringify(sampleDesign),
					authorId: 'demo-user' // In real app, use actual user ID
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create page');
			}

			const page = await response.json();
			pageId = page.id;
			status = `✅ Page created! ID: ${page.id}`;
		} catch (error) {
			status = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			publishing = false;
		}
	}

	async function publishPage() {
		if (!pageId) {
			status = '❌ Create a page first';
			return;
		}

		status = 'Publishing page...';
		publishing = true;

		try {
			const response = await fetch(`/api/pages/${pageId}/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				throw new Error('Failed to publish page');
			}

			const result = await response.json();
			publishedUrl = result.url;
			status = `✅ Published! URL: ${result.url}`;
		} catch (error) {
			status = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			publishing = false;
		}
	}

	async function createAndPublish() {
		await createPage();
		if (pageId) {
			await new Promise(resolve => setTimeout(resolve, 500));
			await publishPage();
		}
	}
</script>

<svelte:head>
	<title>Publishing Demo - Baseline</title>
</svelte:head>

<div class="container">
	<header>
		<h1>🚀 Publishing Demo</h1>
		<p>Demonstrates the complete publishing flow: Design → Database → Live Page</p>
	</header>

	<section class="workflow">
		<h2>Publishing Workflow</h2>

		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<div class="step-content">
					<h3>Design State</h3>
					<p>Your design with artboards and elements</p>
				</div>
			</div>

			<div class="arrow">→</div>

			<div class="step">
				<div class="step-number">2</div>
				<div class="step-content">
					<h3>Database</h3>
					<p>Store design events and metadata</p>
				</div>
			</div>

			<div class="arrow">→</div>

			<div class="step">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>Generate</h3>
					<p>AST → HTML/CSS generation</p>
				</div>
			</div>

			<div class="arrow">→</div>

			<div class="step">
				<div class="step-number">4</div>
				<div class="step-content">
					<h3>Publish</h3>
					<p>Live on your domain</p>
				</div>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Try It Out</h2>

		<div class="actions">
			<button on:click={createPage} disabled={publishing} class="btn btn-primary">
				1. Create Page
			</button>

			<button on:click={publishPage} disabled={publishing || !pageId} class="btn btn-primary">
				2. Publish Page
			</button>

			<button on:click={createAndPublish} disabled={publishing} class="btn btn-featured">
				🚀 Create & Publish
			</button>
		</div>

		{#if status}
			<div class="status" class:success={status.includes('✅')} class:error={status.includes('❌')}>
				{status}
			</div>
		{/if}

		{#if publishedUrl}
			<div class="published">
				<h3>Page Published!</h3>
				<p>Visit your published page:</p>
				<a href={publishedUrl} target="_blank" class="published-link">
					{publishedUrl}
				</a>
			</div>
		{/if}
	</section>

	<section class="info">
		<h2>Features</h2>

		<div class="features">
			<div class="feature">
				<span class="icon">💾</span>
				<h3>Database Storage</h3>
				<p>Design events stored in SQLite database with Prisma ORM</p>
			</div>

			<div class="feature">
				<span class="icon">⚡</span>
				<h3>Fast Publishing</h3>
				<p>AST-based code generation creates optimized HTML/CSS</p>
			</div>

			<div class="feature">
				<span class="icon">🔄</span>
				<h3>Version History</h3>
				<p>Every publish creates a revision for rollback capability</p>
			</div>

			<div class="feature">
				<span class="icon">🌐</span>
				<h3>SSR Rendering</h3>
				<p>Published pages served with SvelteKit SSR for SEO</p>
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
		margin-bottom: 1.5rem;
		color: #2a2a2a;
	}

	section {
		margin-bottom: 3rem;
	}

	/* Workflow */
	.workflow {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.steps {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.step {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.step-number {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #0066cc;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.step-content h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.step-content p {
		font-size: 0.85rem;
		margin: 0;
		color: #666;
	}

	.arrow {
		font-size: 2rem;
		color: #0066cc;
	}

	/* Demo */
	.demo {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
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

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #0066cc;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #0052a3;
	}

	.btn-featured {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-featured:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.status {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.status.success {
		background: #f0fdf4;
		border: 1px solid #86efac;
		color: #166534;
	}

	.status.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
	}

	.published {
		padding: 1.5rem;
		background: #f0f9ff;
		border: 1px solid #7dd3fc;
		border-radius: 6px;
	}

	.published h3 {
		margin: 0 0 0.5rem 0;
		color: #0c4a6e;
	}

	.published p {
		margin: 0 0 1rem 0;
		color: #0c4a6e;
	}

	.published-link {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #0284c7;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-weight: 500;
	}

	.published-link:hover {
		background: #0369a1;
	}

	/* Info */
	.info {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 2rem;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature {
		text-align: center;
	}

	.icon {
		font-size: 2rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.feature h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.feature p {
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
		.steps {
			flex-direction: column;
		}

		.arrow {
			transform: rotate(90deg);
		}

		.actions {
			flex-direction: column;
		}

		.features {
			grid-template-columns: 1fr;
		}
	}
</style>


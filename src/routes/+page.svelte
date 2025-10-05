<svelte:head>
	<title>Baseline - Design with Code</title>
</svelte:head>

<main>
	<header>
		<h1>Baseline</h1>
		<p>Open-source design tool that generates production-ready code</p>
	</header>

	<section class="demos">
		<h2>Demos</h2>
		
		<div class="demo-grid">
			<a href="/canvas-demo" class="demo-card">
				<h3>🎨 Canvas Demo</h3>
				<p>Infinite canvas with multiple artboards, drag-and-drop, and baseline grid system</p>
				<span class="status completed">✅ Completed</span>
			</a>

			<a href="/event-sourcing-demo" class="demo-card">
				<h3>⚡ Event Sourcing Demo</h3>
				<p>State management with perfect undo/redo via event history</p>
				<span class="status completed">✅ Completed</span>
			</a>

			<a href="/persistence-demo" class="demo-card">
				<h3>💾 Persistence Demo</h3>
				<p>IndexedDB local storage with auto-save and project management</p>
				<span class="status completed">✅ Completed</span>
			</a>

			<a href="/components-demo" class="demo-card">
				<h3>🧩 Components Demo</h3>
				<p>Baseline-aware design components with typography, layout, and form elements</p>
				<span class="status completed">✅ Completed</span>
			</a>

			<a href="/code-generation-demo" class="demo-card">
				<h3>⚙️ Code Generation Demo</h3>
				<p>AST-based HTML/CSS generation from design state</p>
				<span class="status completed">✅ Completed</span>
			</a>

			<a href="/export-demo" class="demo-card">
				<h3>📦 Export Demo</h3>
				<p>Export designs as production-ready HTML/CSS (ZIP download)</p>
				<span class="status completed">✅ Completed</span>
			</a>

			<a href="/publishing-demo" class="demo-card featured">
				<h3>🚀 Publishing Demo</h3>
				<p>Full CMS publishing flow: Design → Database → Live Pages</p>
				<span class="status new">🆕 New!</span>
			</a>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li><strong>DOM-based Canvas:</strong> Design with actual web components</li>
			<li><strong>Baseline Grid:</strong> InDesign-style typography alignment</li>
			<li><strong>Event Sourcing:</strong> Perfect undo/redo with time-travel</li>
			<li><strong>Local-first:</strong> Your designs live in your browser</li>
			<li><strong>You own everything:</strong> Code, data, and platform</li>
		</ul>
	</section>
</main>

<style>
	main {
		padding: 3rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 4rem;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #007bff, #28a745);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	header p {
		font-size: 1.2rem;
		color: #666;
	}

	section {
		margin-bottom: 4rem;
	}

	h2 {
		font-size: 2rem;
		margin-bottom: 2rem;
		color: #333;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.demo-card {
		display: block;
		padding: 2rem;
		background: white;
		border: 2px solid #ddd;
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s;
		position: relative;
	}

	.demo-card:hover {
		border-color: #007bff;
		box-shadow: 0 8px 24px rgba(0,123,255,0.15);
		transform: translateY(-4px);
	}

	.demo-card.featured {
		border-color: #28a745;
		background: linear-gradient(135deg, rgba(40,167,69,0.05), rgba(40,167,69,0.02));
	}

	.demo-card.featured:hover {
		border-color: #28a745;
		box-shadow: 0 8px 24px rgba(40,167,69,0.2);
	}

	.demo-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		color: #333;
	}

	.demo-card p {
		margin: 0 0 1rem 0;
		color: #666;
		line-height: 1.6;
	}

	.status {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.status.completed {
		background: #d4edda;
		color: #155724;
	}

	.status.new {
		background: #fff3cd;
		color: #856404;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.features {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 12px;
	}

	.features ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1rem;
	}

	.features li {
		padding: 1rem;
		background: white;
		border-radius: 8px;
		border-left: 4px solid #007bff;
	}

	.features strong {
		color: #007bff;
	}
</style>

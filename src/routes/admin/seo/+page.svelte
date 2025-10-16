<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface SEOMetadata {
		// Page-level
		title: string;
		description: string;
		keywords: string;
		canonicalUrl: string;
		// Open Graph
		ogTitle: string;
		ogDescription: string;
		ogImage: string;
		ogType: string;
		// Twitter
		twitterCard: string;
		twitterTitle: string;
		twitterDescription: string;
		twitterImage: string;
		// Advanced
		robotsMeta: string;
		schemaMarkup: string;
	}

	let metadata: SEOMetadata = {
		title: '',
		description: '',
		keywords: '',
		canonicalUrl: '',
		ogTitle: '',
		ogDescription: '',
		ogImage: '',
		ogType: 'website',
		twitterCard: 'summary_large_image',
		twitterTitle: '',
		twitterDescription: '',
		twitterImage: '',
		robotsMeta: 'index, follow',
		schemaMarkup: ''
	};

	let activeTab: 'page' | 'opengraph' | 'twitter' | 'advanced' = 'page';
	let loading = true;
	let saving = false;
	let error = '';
	let success = '';

	onMount(async () => {
		await loadMetadata();
	});

	async function loadMetadata() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			loading = true;
			const response = await fetch('/api/settings', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (response.ok) {
				const data = await response.json();
				const getSetting = (key: string, defaultVal: string) =>
					data.settings?.find((s: any) => s.key === key)?.value ?? defaultVal;

				metadata = {
					title: getSetting('meta_title', ''),
					description: getSetting('meta_description', ''),
					keywords: getSetting('meta_keywords', ''),
					canonicalUrl: getSetting('canonical_url', ''),
					ogTitle: getSetting('og_title', ''),
					ogDescription: getSetting('og_description', ''),
					ogImage: getSetting('og_image_url', ''),
					ogType: getSetting('og_type', 'website'),
					twitterCard: getSetting('twitter_card', 'summary_large_image'),
					twitterTitle: getSetting('twitter_title', ''),
					twitterDescription: getSetting('twitter_description', ''),
					twitterImage: getSetting('twitter_image', ''),
					robotsMeta: getSetting('robots_meta', 'index, follow'),
					schemaMarkup: getSetting('schema_markup', '')
				};
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load SEO metadata';
		} finally {
			loading = false;
		}
	}

	async function saveMetadata() {
		error = '';
		success = '';

		// Validation
		if (metadata.title && metadata.title.length > 60) {
			error = 'Title should be 60 characters or less for optimal SEO';
			return;
		}
		if (metadata.description && metadata.description.length > 160) {
			error = 'Description should be 160 characters or less for optimal SEO';
			return;
		}

		try {
			saving = true;
			const token = localStorage.getItem('access_token');

			const updates = [
				{ key: 'meta_title', value: metadata.title },
				{ key: 'meta_description', value: metadata.description },
				{ key: 'meta_keywords', value: metadata.keywords },
				{ key: 'canonical_url', value: metadata.canonicalUrl },
				{ key: 'og_title', value: metadata.ogTitle },
				{ key: 'og_description', value: metadata.ogDescription },
				{ key: 'og_image_url', value: metadata.ogImage },
				{ key: 'og_type', value: metadata.ogType },
				{ key: 'twitter_card', value: metadata.twitterCard },
				{ key: 'twitter_title', value: metadata.twitterTitle },
				{ key: 'twitter_description', value: metadata.twitterDescription },
				{ key: 'twitter_image', value: metadata.twitterImage },
				{ key: 'robots_meta', value: metadata.robotsMeta },
				{ key: 'schema_markup', value: metadata.schemaMarkup }
			];

			for (const update of updates) {
				await fetch('/api/settings', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(update)
				});
			}

			success = 'SEO metadata saved successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save SEO metadata';
		} finally {
			saving = false;
		}
	}

	$: displayTitle = metadata.title || 'Your Page Title';
	$: displayDescription = metadata.description || 'Your page description will appear here...';
	$: displayUrl = metadata.canonicalUrl || 'https://example.com/page';
</script>

<svelte:head>
	<title>SEO Metadata Editor - LineBasis Admin</title>
</svelte:head>

<div class="seo-page">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/admin" class="back-link">← Dashboard</a>
				<h1>SEO Metadata Editor</h1>
			</div>
		</div>
	</header>

	{#if error}
		<div class="alert alert-error">
			{error}
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	{#if success}
		<div class="alert alert-success">
			{success}
			<button on:click={() => (success = '')}>✕</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Loading SEO metadata...</div>
	{:else}
		<div class="content">
			<!-- Preview Card -->
			<div class="preview-card">
				<h2>Search Result Preview</h2>
				<div class="search-preview">
					<div class="preview-url">{displayUrl}</div>
					<div class="preview-title">{displayTitle}</div>
					<div class="preview-description">{displayDescription}</div>
				</div>
				<p class="preview-note">
					Title: {metadata.title.length}/60 chars • Description: {metadata.description.length}/160
					chars
				</p>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button class:active={activeTab === 'page'} on:click={() => (activeTab = 'page')}>
					📄 Page Metadata
				</button>
				<button class:active={activeTab === 'opengraph'} on:click={() => (activeTab = 'opengraph')}>
					🌐 Open Graph
				</button>
				<button class:active={activeTab === 'twitter'} on:click={() => (activeTab = 'twitter')}>
					🐦 Twitter
				</button>
				<button class:active={activeTab === 'advanced'} on:click={() => (activeTab = 'advanced')}>
					⚙️ Advanced
				</button>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				{#if activeTab === 'page'}
					<div class="form-section">
						<div class="form-group">
							<label for="title">Meta Title *</label>
							<input
								id="title"
								type="text"
								bind:value={metadata.title}
								placeholder="Your Page Title - Keywords"
								maxlength="60"
							/>
							<p class="field-help">Optimal: 50-60 characters</p>
						</div>

						<div class="form-group">
							<label for="description">Meta Description *</label>
							<textarea
								id="description"
								bind:value={metadata.description}
								rows="3"
								placeholder="A compelling description that encourages clicks..."
								maxlength="160"
							></textarea>
							<p class="field-help">Optimal: 150-160 characters</p>
						</div>

						<div class="form-group">
							<label for="keywords">Keywords</label>
							<input
								id="keywords"
								type="text"
								bind:value={metadata.keywords}
								placeholder="keyword1, keyword2, keyword3"
							/>
							<p class="field-help">Comma-separated keywords (less important for modern SEO)</p>
						</div>

						<div class="form-group">
							<label for="canonicalUrl">Canonical URL</label>
							<input
								id="canonicalUrl"
								type="url"
								bind:value={metadata.canonicalUrl}
								placeholder="https://example.com/canonical-page"
							/>
							<p class="field-help">Preferred URL for duplicate content</p>
						</div>
					</div>
				{:else if activeTab === 'opengraph'}
					<div class="form-section">
						<div class="form-group">
							<label for="ogTitle">OG Title</label>
							<input
								id="ogTitle"
								type="text"
								bind:value={metadata.ogTitle}
								placeholder="Title for social media shares"
							/>
						</div>

						<div class="form-group">
							<label for="ogDescription">OG Description</label>
							<textarea
								id="ogDescription"
								bind:value={metadata.ogDescription}
								rows="3"
								placeholder="Description for social media shares..."
							></textarea>
						</div>

						<div class="form-group">
							<label for="ogImage">OG Image URL</label>
							<input
								id="ogImage"
								type="url"
								bind:value={metadata.ogImage}
								placeholder="https://example.com/image.jpg"
							/>
							<p class="field-help">Recommended: 1200x630px</p>
						</div>

						<div class="form-group">
							<label for="ogType">OG Type</label>
							<select id="ogType" bind:value={metadata.ogType}>
								<option value="website">Website</option>
								<option value="article">Article</option>
								<option value="product">Product</option>
								<option value="profile">Profile</option>
							</select>
						</div>
					</div>
				{:else if activeTab === 'twitter'}
					<div class="form-section">
						<div class="form-group">
							<label for="twitterCard">Twitter Card Type</label>
							<select id="twitterCard" bind:value={metadata.twitterCard}>
								<option value="summary">Summary</option>
								<option value="summary_large_image">Summary Large Image</option>
								<option value="app">App</option>
								<option value="player">Player</option>
							</select>
						</div>

						<div class="form-group">
							<label for="twitterTitle">Twitter Title</label>
							<input
								id="twitterTitle"
								type="text"
								bind:value={metadata.twitterTitle}
								placeholder="Title for Twitter shares"
							/>
						</div>

						<div class="form-group">
							<label for="twitterDescription">Twitter Description</label>
							<textarea
								id="twitterDescription"
								bind:value={metadata.twitterDescription}
								rows="3"
								placeholder="Description for Twitter shares..."
							></textarea>
						</div>

						<div class="form-group">
							<label for="twitterImage">Twitter Image URL</label>
							<input
								id="twitterImage"
								type="url"
								bind:value={metadata.twitterImage}
								placeholder="https://example.com/twitter-image.jpg"
							/>
							<p class="field-help">Recommended: 1200x675px for large image card</p>
						</div>
					</div>
				{:else if activeTab === 'advanced'}
					<div class="form-section">
						<div class="form-group">
							<label for="robotsMeta">Robots Meta Tag</label>
							<select id="robotsMeta" bind:value={metadata.robotsMeta}>
								<option value="index, follow">Index, Follow (Default)</option>
								<option value="noindex, follow">No Index, Follow</option>
								<option value="index, nofollow">Index, No Follow</option>
								<option value="noindex, nofollow">No Index, No Follow</option>
							</select>
							<p class="field-help">Controls how search engines crawl this page</p>
						</div>

						<div class="form-group">
							<label for="schemaMarkup">Schema.org JSON-LD</label>
							<textarea
								id="schemaMarkup"
								bind:value={metadata.schemaMarkup}
								rows="8"
								placeholder={`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Your Page Name"
}`}
							></textarea>
							<p class="field-help">Structured data markup (JSON-LD format)</p>
						</div>
					</div>
				{/if}

				<div class="form-actions">
					<button class="btn-primary" on:click={saveMetadata} disabled={saving}>
						{saving ? 'Saving...' : '💾 Save SEO Metadata'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.seo-page {
		min-height: 100vh;
		background: #f7fafc;
	}

	.header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 20px 0;
	}

	.header-content {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.back-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	h1 {
		margin: 0;
		font-size: 24px;
		color: #1a202c;
	}

	.alert {
		max-width: 1000px;
		margin: 24px auto;
		padding: 12px 24px;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.alert-error {
		background: #fed7d7;
		color: #c53030;
	}

	.alert-success {
		background: #c6f6d5;
		color: #2f855a;
	}

	.alert button {
		background: none;
		border: none;
		font-size: 20px;
		cursor: pointer;
		color: inherit;
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: #718096;
	}

	.content {
		max-width: 1000px;
		margin: 24px auto;
		padding: 0 24px;
	}

	.preview-card {
		background: white;
		border-radius: 8px;
		padding: 24px;
		margin-bottom: 24px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.preview-card h2 {
		margin: 0 0 16px 0;
		font-size: 18px;
		color: #1a202c;
	}

	.search-preview {
		padding: 16px;
		background: #f7fafc;
		border-radius: 6px;
		border: 1px solid #e2e8f0;
	}

	.preview-url {
		color: #5f6368;
		font-size: 14px;
		margin-bottom: 4px;
	}

	.preview-title {
		color: #1a0dab;
		font-size: 20px;
		font-weight: 400;
		margin-bottom: 4px;
	}

	.preview-description {
		color: #4d5156;
		font-size: 14px;
		line-height: 1.58;
	}

	.preview-note {
		margin: 12px 0 0 0;
		font-size: 13px;
		color: #718096;
	}

	.tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		border-bottom: 2px solid #e2e8f0;
	}

	.tabs button {
		padding: 12px 20px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		color: #718096;
		transition: all 0.2s;
	}

	.tabs button:hover {
		color: #667eea;
	}

	.tabs button.active {
		color: #667eea;
		border-bottom-color: #667eea;
	}

	.tab-content {
		background: white;
		border-radius: 8px;
		padding: 24px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group label {
		margin-bottom: 8px;
		font-weight: 500;
		color: #1a202c;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 10px 12px;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group textarea {
		resize: vertical;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.field-help {
		margin: 6px 0 0 0;
		font-size: 13px;
		color: #718096;
	}

	.form-actions {
		margin-top: 24px;
		display: flex;
		gap: 12px;
	}

	.btn-primary {
		padding: 12px 24px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

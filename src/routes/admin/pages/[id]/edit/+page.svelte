<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SeoEditor from '$lib/components/ui/SeoEditor.svelte';

	interface Page {
		id: string;
		slug: string;
		title: string;
		description: string | null;
		status: 'draft' | 'published' | 'archived';
		metaTitle: string | null;
		metaDescription: string | null;
		metaImage: string | null;
		designEvents: string;
	}

	let pageData: Page | null = null;
	let loading = true;
	let saving = false;
	let error = '';
	let success = '';

	// Form data
	let title = '';
	let slug = '';
	let description = '';
	let status: 'draft' | 'published' | 'archived' = 'draft';
	let metaTitle = '';
	let metaDescription = '';
	let metaImage = '';

	const pageId = $page.params.id;

	onMount(() => {
		loadPage();
	});

	async function loadPage() {
		try {
			loading = true;
			const token = localStorage.getItem('access_token');
			if (!token) {
				goto('/admin/login');
				return;
			}

			const response = await fetch(`/api/pages/${pageId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to load page');
			}

			pageData = await response.json();
			title = pageData.title;
			slug = pageData.slug;
			description = pageData.description || '';
			status = pageData.status;
			metaTitle = pageData.metaTitle || '';
			metaDescription = pageData.metaDescription || '';
			metaImage = pageData.metaImage || '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load page';
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		try {
			saving = true;
			error = '';
			success = '';

			// Validation
			if (!title || !slug) {
				error = 'Title and slug are required';
				return;
			}

			const token = localStorage.getItem('access_token');

			const response = await fetch(`/api/pages/${pageId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					title,
					slug,
					description: description || null,
					status,
					metaTitle: metaTitle || null,
					metaDescription: metaDescription || null,
					metaImage: metaImage || null
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to save page');
			}

			success = 'Page saved successfully';
			setTimeout(() => {
				success = '';
			}, 3000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save page';
		} finally {
			saving = false;
		}
	}

	function generateSlug() {
		slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function handleCancel() {
		goto('/admin/pages');
	}
</script>

<svelte:head>
	<title>Edit Page - {title || 'Untitled'}</title>
</svelte:head>

<div class="page-edit">
	<header class="page-header">
		<div class="header-content">
			<button class="btn-back" on:click={handleCancel}>← Back to Pages</button>
			<div>
				<h1>Edit Page</h1>
				<p class="subtitle">{title || 'Untitled'}</p>
			</div>
		</div>
		<div class="header-actions">
			<button class="btn-secondary" on:click={handleCancel}>Cancel</button>
			<button class="btn-primary" on:click={handleSave} disabled={saving}>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</header>

	{#if error}
		<div class="error-banner">
			<span>⚠️ {error}</span>
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	{#if success}
		<div class="success-banner">
			<span>✅ {success}</span>
			<button on:click={() => (success = '')}>✕</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Loading page...</div>
	{:else if pageData}
		<div class="editor-container">
			<div class="editor-main">
				<section class="editor-section">
					<h2>Basic Information</h2>

					<div class="form-group">
						<label for="title">Title *</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							on:input={generateSlug}
							required
							placeholder="Page title"
						/>
					</div>

					<div class="form-group">
						<label for="slug">
							Slug *
							<span class="field-info">URL-friendly identifier</span>
						</label>
						<div class="slug-input-group">
							<span class="slug-prefix">/</span>
							<input
								id="slug"
								type="text"
								bind:value={slug}
								required
								placeholder="page-slug"
								pattern="[a-z0-9-]+"
							/>
						</div>
						<p class="field-help">Only lowercase letters, numbers, and hyphens allowed</p>
					</div>

					<div class="form-group">
						<label for="description">
							Description
							<span class="optional">(optional)</span>
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="3"
							placeholder="Brief description of this page"
						></textarea>
					</div>

					<div class="form-group">
						<label for="status">Status</label>
						<select id="status" bind:value={status}>
							<option value="draft">Draft</option>
							<option value="published">Published</option>
							<option value="archived">Archived</option>
						</select>
					</div>
				</section>

				<section class="editor-section">
					<SeoEditor
						bind:metaTitle
						bind:metaDescription
						bind:metaImage
						pageTitle={title}
						pageDescription={description}
					/>
				</section>

				<section class="editor-section">
					<h2>🎨 Design</h2>
					<p class="section-desc">
						Open this page in the Designer to edit the layout and content.
					</p>
					<a href="/?page={pageId}" class="btn-designer">Open in Designer</a>
				</section>
			</div>

			<aside class="editor-sidebar">
				<div class="sidebar-section">
					<h3>Page Actions</h3>
					<div class="action-buttons">
						<button class="action-btn" on:click={handleSave} disabled={saving}>
							💾 Save Changes
						</button>
						<a href="/pages/{slug}" class="action-btn" target="_blank">
							👁️ Preview Page
						</a>
						<a href="/?page={pageId}" class="action-btn">
							✏️ Edit Design
						</a>
					</div>
				</div>

				<div class="sidebar-section">
					<h3>Page Info</h3>
					<div class="info-list">
						<div class="info-item">
							<span class="info-label">Status</span>
							<span class="info-value badge badge-{status}">{status}</span>
						</div>
						<div class="info-item">
							<span class="info-label">URL</span>
							<span class="info-value">/{slug || 'untitled'}</span>
						</div>
						<div class="info-item">
							<span class="info-label">Created</span>
							<span class="info-value">
								{new Date(pageData.id).toLocaleDateString()}
							</span>
						</div>
					</div>
				</div>

				<div class="sidebar-section danger-zone">
					<h3>⚠️ Danger Zone</h3>
					<button class="btn-danger-outline">Delete Page</button>
				</div>
			</aside>
		</div>
	{/if}
</div>

<style>
	.page-edit {
		min-height: 100vh;
		background: var(--color-bg-secondary);
	}

	.page-header {
		background: white;
		border-bottom: 1px solid var(--color-border);
		padding: 1.5rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.btn-back {
		background: none;
		border: 1px solid var(--color-border);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn-back:hover {
		background: var(--color-bg-secondary);
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-text);
	}

	.subtitle {
		margin: 0.25rem 0 0 0;
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.error-banner,
	.success-banner {
		padding: 1rem;
		margin: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.error-banner {
		background: #fee;
		border-bottom: 1px solid #fcc;
		color: #c00;
	}

	.success-banner {
		background: #e8f5e9;
		border-bottom: 1px solid #c8e6c9;
		color: #2e7d32;
	}

	.error-banner button,
	.success-banner button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0 0.5rem;
	}

	.loading {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-muted);
	}

	.editor-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 2rem;
	}

	.editor-main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.editor-section {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.editor-section h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.2rem;
		color: var(--color-text);
	}

	.section-desc {
		margin: 0 0 1rem 0;
		color: var(--color-text-muted);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.field-info {
		font-weight: normal;
		color: var(--color-text-muted);
		font-size: 0.85rem;
		margin-left: 0.5rem;
	}

	.optional {
		font-weight: normal;
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
	}

	.form-group textarea {
		resize: vertical;
	}

	.slug-input-group {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		overflow: hidden;
	}

	.slug-prefix {
		padding: 0.75rem;
		background: var(--color-bg-secondary);
		color: var(--color-text-muted);
		border-right: 1px solid var(--color-border);
	}

	.slug-input-group input {
		border: none;
		flex: 1;
	}

	.field-help {
		margin: 0.5rem 0 0 0;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.btn-designer {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-designer:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary);
	}

	.editor-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.sidebar-section {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.sidebar-section h3 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		color: var(--color-text);
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.action-btn {
		padding: 0.75rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		text-align: left;
		text-decoration: none;
		color: var(--color-text);
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: var(--color-border);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.info-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.info-value {
		font-size: 0.85rem;
		color: var(--color-text);
		font-weight: 500;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.badge-draft {
		background: #e3f2fd;
		color: #1565c0;
	}

	.badge-published {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.badge-archived {
		background: #f5f5f5;
		color: #616161;
	}

	.danger-zone {
		border: 1px solid #fcc;
		background: #fff5f5;
	}

	.btn-danger-outline {
		width: 100%;
		padding: 0.75rem;
		background: white;
		color: #d32f2f;
		border: 1px solid #d32f2f;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-danger-outline:hover {
		background: #d32f2f;
		color: white;
	}

	@media (max-width: 1024px) {
		.editor-container {
			grid-template-columns: 1fr;
		}
	}
</style>

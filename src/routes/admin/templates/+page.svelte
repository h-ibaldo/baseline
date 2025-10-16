<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Template {
		id: string;
		name: string;
		description: string | null;
		category: string | null;
		content: string;
		thumbnail: string | null;
		version: number;
		createdAt: string;
		creator: {
			name: string;
			email: string;
		};
	}

	let templates: Template[] = [];
	let loading = true;
	let error = '';
	let deleteConfirmTemplate: Template | null = null;

	onMount(() => {
		loadTemplates();
	});

	async function loadTemplates() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			loading = true;
			const response = await fetch('/api/templates', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) throw new Error('Failed to load templates');

			const data = await response.json();
			templates = data.templates || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load templates';
		} finally {
			loading = false;
		}
	}

	async function deleteTemplate() {
		if (!deleteConfirmTemplate) return;

		const token = localStorage.getItem('access_token');
		try {
			const response = await fetch('/api/templates', {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: deleteConfirmTemplate.id })
			});

			if (!response.ok) throw new Error('Failed to delete template');

			deleteConfirmTemplate = null;
			await loadTemplates();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete template';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Templates - LineBasis Admin</title>
</svelte:head>

<div class="templates-page">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/admin" class="back-link">← Dashboard</a>
				<h1>Page Templates</h1>
			</div>
			<button class="btn-primary" on:click={() => goto('/')}>
				+ Create from Designer
			</button>
		</div>
	</header>

	{#if error}
		<div class="error-banner">
			{error}
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Loading templates...</div>
	{:else if templates.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📐</div>
			<h2>No templates yet</h2>
			<p>Create reusable page layouts in the designer, then save them as templates.</p>
			<button class="btn-primary" on:click={() => goto('/')}>Open Designer</button>
		</div>
	{:else}
		<div class="templates-grid">
			{#each templates as template (template.id)}
				<div class="template-card">
					<div class="template-preview">
						{#if template.thumbnail}
							<img src={template.thumbnail} alt={template.name} />
						{:else}
							<div class="placeholder">📄</div>
						{/if}
					</div>
					<div class="template-info">
						<h3>{template.name}</h3>
						{#if template.description}
							<p class="description">{template.description}</p>
						{/if}
						<div class="meta">
							<span class="category">{template.category || 'general'}</span>
							<span>•</span>
							<span>v{template.version}</span>
							<span>•</span>
							<span>{formatDate(template.createdAt)}</span>
						</div>
						<div class="creator">By {template.creator.name}</div>
					</div>
					<div class="template-actions">
						<button class="btn-secondary" title="Apply template">Use Template</button>
						<button
							class="btn-danger"
							on:click={() => (deleteConfirmTemplate = template)}
							title="Delete template"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if deleteConfirmTemplate}
	<div class="modal-overlay" on:click={() => (deleteConfirmTemplate = null)}>
		<div class="modal" on:click|stopPropagation>
			<h2>Delete Template</h2>
			<p>
				Are you sure you want to delete <strong>{deleteConfirmTemplate.name}</strong>? This cannot
				be undone.
			</p>
			<div class="modal-actions">
				<button class="btn-secondary" on:click={() => (deleteConfirmTemplate = null)}>
					Cancel
				</button>
				<button class="btn-danger" on:click={deleteTemplate}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.templates-page {
		min-height: 100vh;
		background: #f7fafc;
	}

	.header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 20px 0;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
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

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #667eea;
		color: white;
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-danger {
		background: #e53e3e;
		color: white;
	}

	.error-banner {
		max-width: 1400px;
		margin: 24px auto;
		padding: 12px 24px;
		background: #fed7d7;
		color: #c53030;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: #718096;
	}

	.empty-state {
		max-width: 600px;
		margin: 80px auto;
		text-align: center;
		padding: 0 24px;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.templates-grid {
		max-width: 1400px;
		margin: 24px auto;
		padding: 0 24px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 24px;
	}

	.template-card {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.template-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.template-preview {
		aspect-ratio: 16/9;
		background: #f7fafc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.template-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		font-size: 48px;
	}

	.template-info {
		padding: 16px;
	}

	.template-info h3 {
		margin: 0 0 8px 0;
		font-size: 18px;
		color: #1a202c;
	}

	.description {
		margin: 0 0 12px 0;
		font-size: 14px;
		color: #718096;
	}

	.meta {
		display: flex;
		gap: 8px;
		font-size: 13px;
		color: #718096;
		margin-bottom: 8px;
	}

	.category {
		background: #edf2f7;
		padding: 2px 8px;
		border-radius: 4px;
		text-transform: capitalize;
	}

	.creator {
		font-size: 12px;
		color: #a0aec0;
	}

	.template-actions {
		padding: 12px 16px;
		border-top: 1px solid #e2e8f0;
		display: flex;
		gap: 8px;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 8px;
		padding: 24px;
		max-width: 500px;
		width: 90%;
	}

	.modal h2 {
		margin: 0 0 16px 0;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 24px;
	}
</style>

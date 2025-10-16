<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface ContentBlock {
		id: string;
		name: string;
		description: string | null;
		category: string;
		content: string;
		thumbnail: string | null;
		usageCount: number;
		isPublic: boolean;
		version: number;
		createdAt: string;
		creator: {
			name: string;
			email: string;
		};
	}

	let blocks: ContentBlock[] = [];
	let loading = true;
	let error = '';
	let success = '';
	let deleteConfirmBlock: ContentBlock | null = null;
	let categoryFilter = 'all';

	onMount(() => {
		loadBlocks();
	});

	async function loadBlocks() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			loading = true;
			const url =
				categoryFilter === 'all'
					? '/api/content-blocks'
					: `/api/content-blocks?category=${categoryFilter}`;

			const response = await fetch(url, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) throw new Error('Failed to load blocks');

			const data = await response.json();
			blocks = data.blocks || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load blocks';
		} finally {
			loading = false;
		}
	}

	async function deleteBlock() {
		if (!deleteConfirmBlock) return;

		const token = localStorage.getItem('access_token');
		try {
			const response = await fetch('/api/content-blocks', {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: deleteConfirmBlock.id })
			});

			if (!response.ok) throw new Error('Failed to delete block');

			success = 'Block deleted successfully';
			deleteConfirmBlock = null;
			await loadBlocks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete block';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getCategoryIcon(category: string): string {
		const icons: Record<string, string> = {
			text: '📝',
			image: '🖼️',
			button: '🔘',
			card: '🃏',
			hero: '🎯',
			custom: '⚙️'
		};
		return icons[category] || '📦';
	}

	$: {
		loadBlocks();
	}
</script>

<svelte:head>
	<title>Content Blocks - LineBasis Admin</title>
</svelte:head>

<div class="blocks-page">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/admin" class="back-link">← Dashboard</a>
				<h1>Content Blocks</h1>
			</div>
			<button class="btn-primary" on:click={() => goto('/')}>+ Create Block</button>
		</div>
	</header>

	<div class="toolbar">
		<select bind:value={categoryFilter} class="filter-select">
			<option value="all">All Categories</option>
			<option value="text">Text</option>
			<option value="image">Image</option>
			<option value="button">Button</option>
			<option value="card">Card</option>
			<option value="hero">Hero</option>
			<option value="custom">Custom</option>
		</select>
	</div>

	{#if success}
		<div class="success-banner">
			{success}
			<button on:click={() => (success = '')}>✕</button>
		</div>
	{/if}

	{#if error}
		<div class="error-banner">
			{error}
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Loading blocks...</div>
	{:else if blocks.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📦</div>
			<h2>No content blocks yet</h2>
			<p>Create reusable blocks to build pages faster.</p>
			<button class="btn-primary" on:click={() => goto('/')}>Create Block</button>
		</div>
	{:else}
		<div class="blocks-grid">
			{#each blocks as block (block.id)}
				<div class="block-card">
					<div class="block-preview">
						{#if block.thumbnail}
							<img src={block.thumbnail} alt={block.name} />
						{:else}
							<div class="placeholder">{getCategoryIcon(block.category)}</div>
						{/if}
					</div>
					<div class="block-info">
						<h3>{block.name}</h3>
						{#if block.description}
							<p class="description">{block.description}</p>
						{/if}
						<div class="meta">
							<span class="category">{block.category}</span>
							<span>•</span>
							<span>Used {block.usageCount}x</span>
							<span>•</span>
							<span>{block.isPublic ? '🌐 Public' : '🔒 Private'}</span>
						</div>
						<div class="creator">By {block.creator.name}</div>
					</div>
					<div class="block-actions">
						<button class="btn-secondary">Edit</button>
						<button class="btn-danger" on:click={() => (deleteConfirmBlock = block)}>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if deleteConfirmBlock}
	<div class="modal-overlay" on:click={() => (deleteConfirmBlock = null)}>
		<div class="modal" on:click|stopPropagation>
			<h2>Delete Block</h2>
			<p>
				Delete <strong>{deleteConfirmBlock.name}</strong>? This cannot be undone.
			</p>
			<div class="modal-actions">
				<button class="btn-secondary" on:click={() => (deleteConfirmBlock = null)}>Cancel</button>
				<button class="btn-danger" on:click={deleteBlock}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.blocks-page {
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

	.toolbar {
		max-width: 1400px;
		margin: 24px auto 0;
		padding: 0 24px;
	}

	.filter-select {
		padding: 10px 16px;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		background: white;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
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

	.success-banner,
	.error-banner {
		max-width: 1400px;
		margin: 24px auto;
		padding: 12px 24px;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
	}

	.success-banner {
		background: #c6f6d5;
		color: #2f855a;
	}

	.error-banner {
		background: #fed7d7;
		color: #c53030;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 40px;
	}

	.empty-icon {
		font-size: 64px;
	}

	.blocks-grid {
		max-width: 1400px;
		margin: 24px auto;
		padding: 0 24px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 24px;
	}

	.block-card {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.block-preview {
		aspect-ratio: 16/9;
		background: #f7fafc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder {
		font-size: 48px;
	}

	.block-info {
		padding: 16px;
	}

	.block-info h3 {
		margin: 0 0 8px 0;
		font-size: 18px;
	}

	.description {
		font-size: 14px;
		color: #718096;
		margin: 0 0 12px 0;
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

	.block-actions {
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

<script lang="ts">
	import { onMount } from 'svelte';

	interface ContentBlock {
		id: string;
		name: string;
		description: string | null;
		category: string;
		content: string;
		thumbnail: string | null;
		usageCount: number;
		isPublic: boolean;
		creator: {
			name: string;
			email: string;
		};
	}

	export let onBlockSelect: (block: ContentBlock) => void = () => {};

	let blocks: ContentBlock[] = [];
	let filteredBlocks: ContentBlock[] = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let categoryFilter = 'all';

	const categories = [
		{ value: 'all', label: 'All Blocks', icon: '📦' },
		{ value: 'text', label: 'Text', icon: '📝' },
		{ value: 'image', label: 'Image', icon: '🖼️' },
		{ value: 'button', label: 'Button', icon: '🔘' },
		{ value: 'card', label: 'Card', icon: '🃏' },
		{ value: 'hero', label: 'Hero', icon: '🎯' },
		{ value: 'custom', label: 'Custom', icon: '⚙️' }
	];

	onMount(() => {
		loadBlocks();
	});

	async function loadBlocks() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			error = 'Authentication required';
			loading = false;
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

			if (!response.ok) throw new Error('Failed to load blocks');

			const data = await response.json();
			blocks = data.blocks || [];
			applyFilters();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load blocks';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		filteredBlocks = blocks.filter((block) => {
			const matchesSearch =
				searchQuery === '' ||
				block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				block.description?.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesSearch;
		});
	}

	function handleBlockClick(block: ContentBlock) {
		onBlockSelect(block);
	}

	function getCategoryIcon(category: string): string {
		const cat = categories.find((c) => c.value === category);
		return cat?.icon || '📦';
	}

	$: {
		categoryFilter;
		loadBlocks();
	}

	$: {
		searchQuery;
		applyFilters();
	}
</script>

<div class="block-panel">
	<div class="panel-header">
		<h3>Content Blocks</h3>
		<p class="subtitle">Insert reusable components</p>
	</div>

	<div class="panel-controls">
		<input
			type="text"
			class="search-input"
			placeholder="Search blocks..."
			bind:value={searchQuery}
		/>

		<select class="category-select" bind:value={categoryFilter}>
			{#each categories as cat}
				<option value={cat.value}>
					{cat.icon} {cat.label}
				</option>
			{/each}
		</select>
	</div>

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{:else if loading}
		<div class="loading">Loading blocks...</div>
	{:else if filteredBlocks.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📦</div>
			<p>No blocks found</p>
			{#if searchQuery}
				<button class="link-button" on:click={() => (searchQuery = '')}>Clear search</button>
			{/if}
		</div>
	{:else}
		<div class="blocks-list">
			{#each filteredBlocks as block (block.id)}
				<button class="block-item" on:click={() => handleBlockClick(block)}>
					<div class="block-preview">
						{#if block.thumbnail}
							<img src={block.thumbnail} alt={block.name} />
						{:else}
							<div class="placeholder">{getCategoryIcon(block.category)}</div>
						{/if}
					</div>
					<div class="block-info">
						<div class="block-name">{block.name}</div>
						{#if block.description}
							<div class="block-description">{block.description}</div>
						{/if}
						<div class="block-meta">
							<span class="category-badge">{block.category}</span>
							<span class="usage">Used {block.usageCount}x</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.block-panel {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: white;
		overflow: hidden;
	}

	.panel-header {
		padding: 16px;
		border-bottom: 1px solid #e2e8f0;
	}

	.panel-header h3 {
		margin: 0 0 4px 0;
		font-size: 16px;
		font-weight: 600;
		color: #1a202c;
	}

	.subtitle {
		margin: 0;
		font-size: 13px;
		color: #718096;
	}

	.panel-controls {
		padding: 12px 16px;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.search-input,
	.category-select {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 13px;
	}

	.search-input:focus,
	.category-select:focus {
		outline: none;
		border-color: #667eea;
	}

	.blocks-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}

	.block-item {
		width: 100%;
		display: flex;
		gap: 12px;
		padding: 12px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		margin-bottom: 8px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.block-item:hover {
		border-color: #667eea;
		background: #f7fafc;
		transform: translateX(4px);
	}

	.block-preview {
		width: 60px;
		height: 60px;
		flex-shrink: 0;
		background: #f7fafc;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.block-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		font-size: 28px;
	}

	.block-info {
		flex: 1;
		min-width: 0;
	}

	.block-name {
		font-weight: 600;
		font-size: 14px;
		color: #1a202c;
		margin-bottom: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.block-description {
		font-size: 12px;
		color: #718096;
		margin-bottom: 6px;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.block-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
	}

	.category-badge {
		background: #edf2f7;
		padding: 2px 6px;
		border-radius: 3px;
		color: #4a5568;
		text-transform: capitalize;
	}

	.usage {
		color: #a0aec0;
	}

	.error-message {
		padding: 16px;
		color: #e53e3e;
		font-size: 13px;
	}

	.loading,
	.empty-state {
		padding: 32px 16px;
		text-align: center;
		color: #718096;
		font-size: 13px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}

	.empty-state p {
		margin: 0 0 12px 0;
	}

	.link-button {
		background: none;
		border: none;
		color: #667eea;
		text-decoration: underline;
		cursor: pointer;
		font-size: 13px;
	}
</style>

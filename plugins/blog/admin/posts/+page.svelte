<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Post {
		id: string;
		slug: string;
		title: string;
		excerpt: string | null;
		status: 'draft' | 'published' | 'scheduled' | 'archived';
		author: {
			name: string;
		};
		categories: Array<{
			category: {
				name: string;
			};
		}>;
		tags: Array<{
			tag: {
				name: string;
			};
		}>;
		createdAt: string;
		updatedAt: string;
		publishedAt: string | null;
	}

	let posts: Post[] = [];
	let filteredPosts: Post[] = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let statusFilter: 'all' | 'draft' | 'published' | 'scheduled' | 'archived' = 'all';

	onMount(() => {
		loadPosts();
	});

	async function loadPosts() {
		try {
			loading = true;
			error = '';

			const token = localStorage.getItem('access_token');
			if (!token) {
				goto('/admin/login');
				return;
			}

			const params = new URLSearchParams({ limit: '100', offset: '0' });
			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}

			const response = await fetch(`/api/posts?${params}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to load posts');
			}

			const data = await response.json();
			posts = data.posts || [];
			applyFilters();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load posts';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		filteredPosts = posts.filter((post) => {
			const matchesSearch =
				searchQuery === '' ||
				post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesSearch;
		});
	}

	function handleSearchInput(e: Event) {
		searchQuery = (e.target as HTMLInputElement).value;
		applyFilters();
	}

	function handleStatusFilter(e: Event) {
		statusFilter = (e.target as HTMLSelectElement).value as typeof statusFilter;
		loadPosts();
	}

	async function togglePublish(post: Post) {
		try {
			const token = localStorage.getItem('access_token');
			const action = post.status === 'published' ? 'unpublish' : 'publish';

			const response = await fetch(`/api/posts/${post.id}/${action}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to ${action} post`);
			}

			await loadPosts();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update post';
		}
	}

	async function deletePost(post: Post) {
		if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
			return;
		}

		try {
			const token = localStorage.getItem('access_token');

			const response = await fetch(`/api/posts/${post.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to delete post');
			}

			await loadPosts();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete post';
		}
	}

	function getStatusBadge(status: string): string {
		switch (status) {
			case 'published':
				return 'badge-published';
			case 'draft':
				return 'badge-draft';
			case 'scheduled':
				return 'badge-scheduled';
			case 'archived':
				return 'badge-archived';
			default:
				return 'badge-default';
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="posts-page">
	<header class="page-header">
		<div class="header-content">
			<h1>Blog Posts</h1>
			<p class="subtitle">Manage your blog posts</p>
		</div>
		<button class="btn-primary" on:click={() => goto('/admin/posts/new')}>
			New Post
		</button>
	</header>

	{#if error}
		<div class="error-banner">
			<span>⚠️ {error}</span>
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	<div class="filters">
		<div class="search-box">
			<span class="search-icon">🔍</span>
			<input
				type="text"
				placeholder="Search posts..."
				value={searchQuery}
				on:input={handleSearchInput}
			/>
		</div>

		<select value={statusFilter} on:change={handleStatusFilter} class="filter-select">
			<option value="all">All Status</option>
			<option value="published">Published</option>
			<option value="draft">Draft</option>
			<option value="scheduled">Scheduled</option>
			<option value="archived">Archived</option>
		</select>
	</div>

	{#if loading}
		<div class="loading">Loading posts...</div>
	{:else if filteredPosts.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📝</div>
			<h3>No posts found</h3>
			<p>
				{searchQuery || statusFilter !== 'all'
					? 'Try adjusting your filters'
					: 'Get started by creating your first blog post'}
			</p>
			{#if !searchQuery && statusFilter === 'all'}
				<button class="btn-primary" on:click={() => goto('/admin/posts/new')}>
					Create First Post
				</button>
			{/if}
		</div>
	{:else}
		<div class="posts-table-container">
			<table class="posts-table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Author</th>
						<th>Categories</th>
						<th>Status</th>
						<th>Published</th>
						<th>Updated</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredPosts as post (post.id)}
						<tr>
							<td class="title-cell">
								<div class="title">{post.title}</div>
								{#if post.excerpt}
									<div class="excerpt">{post.excerpt.substring(0, 100)}...</div>
								{/if}
							</td>
							<td>{post.author.name}</td>
							<td>
								<div class="categories">
									{#each post.categories as { category }}
										<span class="category-badge">{category.name}</span>
									{/each}
									{#if post.categories.length === 0}
										<span class="text-muted">No categories</span>
									{/if}
								</div>
							</td>
							<td>
								<span class="badge {getStatusBadge(post.status)}">{post.status}</span>
							</td>
							<td>{formatDate(post.publishedAt)}</td>
							<td>{formatDate(post.updatedAt)}</td>
							<td class="actions-cell">
								<button
									class="btn-icon"
									title="Edit"
									on:click={() => goto(`/admin/posts/${post.id}/edit`)}
								>
									✏️
								</button>
								{#if post.status === 'published'}
									<button
										class="btn-icon"
										title="View"
										on:click={() => window.open(`/blog/${post.slug}`, '_blank')}
									>
										👁️
									</button>
								{/if}
								<button
									class="btn-icon"
									title={post.status === 'published' ? 'Unpublish' : 'Publish'}
									on:click={() => togglePublish(post)}
								>
									{post.status === 'published' ? '📤' : '📥'}
								</button>
								<button class="btn-icon btn-danger" title="Delete" on:click={() => deletePost(post)}>
									🗑️
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="table-footer">
			<p>Showing {filteredPosts.length} of {posts.length} posts</p>
		</div>
	{/if}
</div>

<style>
	.posts-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header-content h1 {
		margin: 0;
		font-size: 2rem;
		color: var(--color-text);
	}

	.subtitle {
		margin: 0.5rem 0 0 0;
		color: var(--color-text-muted);
	}

	.error-banner {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #c00;
	}

	.error-banner button {
		background: none;
		border: none;
		color: #c00;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0 0.5rem;
	}

	.filters {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		flex: 1;
		min-width: 250px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
	}

	.search-box input {
		width: 100%;
		padding: 0.75rem 0.75rem 0.75rem 2.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.filter-select {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: white;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-muted);
	}

	.empty-state {
		background: var(--color-bg-secondary);
		border-radius: 12px;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		color: var(--color-text);
	}

	.empty-state p {
		margin: 0 0 1.5rem 0;
	}

	.posts-table-container {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.posts-table {
		width: 100%;
		border-collapse: collapse;
	}

	.posts-table th {
		text-align: left;
		padding: 1rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		color: var(--color-text);
		background: var(--color-bg-secondary);
	}

	.posts-table td {
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.posts-table tbody tr:hover {
		background: var(--color-bg-secondary);
	}

	.title-cell {
		max-width: 400px;
	}

	.title {
		font-weight: 500;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.excerpt {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.categories {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.category-badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		background: #f0f0f0;
		border-radius: 4px;
		font-size: 0.75rem;
		color: var(--color-text);
	}

	.text-muted {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.badge-published {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.badge-draft {
		background: #e3f2fd;
		color: #1565c0;
	}

	.badge-scheduled {
		background: #fff3e0;
		color: #e65100;
	}

	.badge-archived {
		background: #f5f5f5;
		color: #616161;
	}

	.actions-cell {
		white-space: nowrap;
	}

	.btn-icon {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.4rem 0.6rem;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
		margin-right: 0.25rem;
	}

	.btn-icon:hover {
		background: var(--color-bg-secondary);
		transform: translateY(-1px);
	}

	.btn-danger:hover {
		background: #fee;
		border-color: #fcc;
	}

	.table-footer {
		padding: 1rem;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Page {
		id: string;
		slug: string;
		title: string;
		description: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
		publishedAt: string | null;
		author: {
			name: string;
			email: string;
		};
	}

	let pages: Page[] = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let statusFilter: 'all' | 'draft' | 'published' | 'archived' = 'all';

	// Pagination
	let currentPage = 1;
	let totalPages = 1;
	let itemsPerPage = 20;

	onMount(async () => {
		await loadPages();
	});

	async function loadPages() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		loading = true;
		error = '';

		try {
			const params = new URLSearchParams({
				limit: itemsPerPage.toString(),
				offset: ((currentPage - 1) * itemsPerPage).toString()
			});

			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}

			const response = await fetch(`/api/pages?${params}`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem('access_token');
					goto('/admin/login');
					return;
				}
				throw new Error('Failed to load pages');
			}

			const data = await response.json();
			pages = data.pages || [];
			totalPages = Math.ceil((data.total || 0) / itemsPerPage);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load pages';
		} finally {
			loading = false;
		}
	}

	async function deletePage(id: string, title: string) {
		if (!confirm(`Are you sure you want to delete "${title}"?`)) {
			return;
		}

		const token = localStorage.getItem('access_token');
		try {
			const response = await fetch(`/api/pages/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error('Failed to delete page');

			await loadPages();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete page');
		}
	}

	async function togglePublish(page: Page) {
		const token = localStorage.getItem('access_token');
		const action = page.status === 'published' ? 'unpublish' : 'publish';

		try {
			const response = await fetch(`/api/pages/${page.id}/${action}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error(`Failed to ${action} page`);

			await loadPages();
		} catch (err) {
			alert(err instanceof Error ? err.message : `Failed to ${action} page`);
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getStatusBadge(status: string): string {
		const badges = {
			draft: 'status-draft',
			published: 'status-published',
			archived: 'status-archived'
		};
		return badges[status as keyof typeof badges] || 'status-draft';
	}

	$: filteredPages = pages.filter((page) => {
		const matchesSearch =
			page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			page.slug.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});
</script>

<svelte:head>
	<title>Pages - LineBasis Admin</title>
</svelte:head>

<div class="page-manager">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/admin" class="back-link">← Dashboard</a>
				<h1>Pages</h1>
			</div>
			<a href="/" class="btn-primary">+ New Page</a>
		</div>
	</header>

	<div class="toolbar">
		<div class="search-box">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search pages..."
				class="search-input"
			/>
		</div>

		<div class="filters">
			<select bind:value={statusFilter} on:change={loadPages} class="filter-select">
				<option value="all">All Status</option>
				<option value="draft">Draft</option>
				<option value="published">Published</option>
				<option value="archived">Archived</option>
			</select>
		</div>
	</div>

	{#if loading}
		<div class="loading">Loading pages...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if filteredPages.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📄</div>
			<h2>No pages found</h2>
			<p>Create your first page to get started!</p>
			<a href="/" class="btn-primary">Create Page</a>
		</div>
	{:else}
		<div class="pages-table">
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Slug</th>
						<th>Status</th>
						<th>Author</th>
						<th>Updated</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredPages as page (page.id)}
						<tr>
							<td class="title-cell">
								<div class="title">{page.title}</div>
								{#if page.description}
									<div class="description">{page.description}</div>
								{/if}
							</td>
							<td class="slug-cell">
								<code>{page.slug}</code>
							</td>
							<td>
								<span class="status-badge {getStatusBadge(page.status)}">
									{page.status}
								</span>
							</td>
							<td>{page.author.name}</td>
							<td>{formatDate(page.updatedAt)}</td>
							<td class="actions-cell">
								<button class="btn-icon" title="Edit" on:click={() => goto(`/admin/pages/${page.id}/edit`)}>
									✏️
								</button>
								{#if page.status === 'published'}
									<button class="btn-icon" title="View" on:click={() => window.open(`/${page.slug}`, '_blank')}>
										👁️
									</button>
								{/if}
								<button
									class="btn-icon"
									title={page.status === 'published' ? 'Unpublish' : 'Publish'}
									on:click={() => togglePublish(page)}
								>
									{page.status === 'published' ? '📥' : '📤'}
								</button>
								<button
									class="btn-icon btn-danger"
									title="Delete"
									on:click={() => deletePage(page.id, page.title)}
								>
									🗑️
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button
					class="btn-pagination"
					disabled={currentPage === 1}
					on:click={() => {
						currentPage--;
						loadPages();
					}}
				>
					Previous
				</button>
				<span class="page-info">
					Page {currentPage} of {totalPages}
				</span>
				<button
					class="btn-pagination"
					disabled={currentPage === totalPages}
					on:click={() => {
						currentPage++;
						loadPages();
					}}
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page-manager {
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
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #5568d3;
	}

	h1 {
		margin: 0;
		font-size: 24px;
		color: #1a202c;
	}

	.btn-primary {
		padding: 10px 20px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: #5568d3;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.toolbar {
		max-width: 1400px;
		margin: 24px auto;
		padding: 0 24px;
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.search-box {
		flex: 1;
	}

	.search-input {
		width: 100%;
		padding: 10px 16px;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.filter-select {
		padding: 10px 16px;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		cursor: pointer;
		background: white;
	}

	.loading,
	.error {
		max-width: 1400px;
		margin: 40px auto;
		padding: 0 24px;
		text-align: center;
		color: #718096;
	}

	.error {
		color: #e53e3e;
	}

	.empty-state {
		max-width: 1400px;
		margin: 80px auto;
		padding: 0 24px;
		text-align: center;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.empty-state h2 {
		font-size: 24px;
		color: #1a202c;
		margin: 0 0 8px 0;
	}

	.empty-state p {
		color: #718096;
		margin: 0 0 24px 0;
	}

	.pages-table {
		max-width: 1400px;
		margin: 0 auto 24px;
		padding: 0 24px;
	}

	table {
		width: 100%;
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	thead {
		background: #f7fafc;
	}

	th {
		padding: 12px 16px;
		text-align: left;
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #718096;
	}

	td {
		padding: 16px;
		border-top: 1px solid #e2e8f0;
	}

	.title-cell .title {
		font-weight: 600;
		color: #1a202c;
		margin-bottom: 4px;
	}

	.title-cell .description {
		font-size: 14px;
		color: #718096;
	}

	.slug-cell code {
		background: #edf2f7;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 13px;
		color: #2d3748;
	}

	.status-badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: capitalize;
	}

	.status-draft {
		background: #fef5e7;
		color: #d68910;
	}

	.status-published {
		background: #d5f4e6;
		color: #27ae60;
	}

	.status-archived {
		background: #e8e8e8;
		color: #666;
	}

	.actions-cell {
		display: flex;
		gap: 8px;
	}

	.btn-icon {
		padding: 6px 10px;
		background: transparent;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 16px;
	}

	.btn-icon:hover {
		background: #f7fafc;
		border-color: #cbd5e0;
	}

	.btn-icon.btn-danger:hover {
		background: #fed7d7;
		border-color: #fc8181;
	}

	.pagination {
		max-width: 1400px;
		margin: 0 auto 40px;
		padding: 0 24px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16px;
	}

	.btn-pagination {
		padding: 8px 16px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-pagination:hover:not(:disabled) {
		background: #f7fafc;
		border-color: #cbd5e0;
	}

	.btn-pagination:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-info {
		color: #718096;
		font-size: 14px;
	}
</style>

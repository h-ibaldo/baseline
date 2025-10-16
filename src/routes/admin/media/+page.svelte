<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Media {
		id: string;
		filename: string;
		url: string;
		mimeType: string;
		size: number;
		width: number | null;
		height: number | null;
		altText: string | null;
		createdAt: string;
		uploader: {
			name: string;
		};
	}

	let media: Media[] = [];
	let loading = true;
	let error = '';
	let uploadError = '';
	let uploading = false;
	let uploadProgress = 0;
	let searchQuery = '';
	let typeFilter: 'all' | 'image' | 'video' | 'document' = 'all';
	let viewMode: 'grid' | 'list' = 'grid';
	let selectedItems = new Set<string>();
	let storageQuota = 1024 * 1024 * 1024; // 1GB default quota

	// Stats
	let stats = {
		totalFiles: 0,
		totalSize: 0,
		filesByType: {} as Record<string, number>
	};

	// File upload
	let fileInput: HTMLInputElement;

	onMount(async () => {
		await loadMedia();
		await loadStats();
	});

	async function loadMedia() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		loading = true;
		error = '';

		try {
			const params = new URLSearchParams({ limit: '100', offset: '0' });
			if (typeFilter !== 'all') {
				params.append('type', typeFilter);
			}

			const response = await fetch(`/api/media?${params}`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem('access_token');
					goto('/admin/login');
					return;
				}
				throw new Error('Failed to load media');
			}

			const data = await response.json();
			media = data.media || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load media';
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		const token = localStorage.getItem('access_token');
		try {
			const response = await fetch('/api/media/stats', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.ok) {
				stats = await response.json();
			}
		} catch (err) {
			console.error('Failed to load stats:', err);
		}
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0) return;

		await uploadFile(files[0]);
		target.value = ''; // Reset input
	}

	async function uploadFile(file: File) {
		const token = localStorage.getItem('access_token');
		uploadError = '';
		uploading = true;
		uploadProgress = 0;

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('optimize', 'true');

			// Simulate progress (real progress requires XMLHttpRequest or server-sent events)
			const progressInterval = setInterval(() => {
				uploadProgress = Math.min(uploadProgress + 10, 90);
			}, 200);

			const response = await fetch('/api/media/upload', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData
			});

			clearInterval(progressInterval);
			uploadProgress = 100;

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Upload failed');
			}

			await loadMedia();
			await loadStats();
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			setTimeout(() => {
				uploading = false;
				uploadProgress = 0;
			}, 500);
		}
	}

	async function deleteMedia(id: string, filename: string) {
		if (!confirm(`Delete "${filename}"?`)) return;

		const token = localStorage.getItem('access_token');
		try {
			const response = await fetch('/api/media', {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			if (!response.ok) throw new Error('Delete failed');

			await loadMedia();
			await loadStats();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Delete failed');
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function isImage(mimeType: string): boolean {
		return mimeType.startsWith('image/');
	}

	function getFileIcon(mimeType: string): string {
		if (mimeType.startsWith('image/')) return '🖼️';
		if (mimeType.startsWith('video/')) return '🎥';
		if (mimeType === 'application/pdf') return '📄';
		return '📎';
	}

	function copyUrl(url: string) {
		navigator.clipboard.writeText(url);
		alert('URL copied to clipboard!');
	}

	function toggleSelection(id: string) {
		const newSelection = new Set(selectedItems);
		if (newSelection.has(id)) {
			newSelection.delete(id);
		} else {
			newSelection.add(id);
		}
		selectedItems = newSelection;
	}

	function selectAll() {
		selectedItems = new Set(filteredMedia.map((item) => item.id));
	}

	function deselectAll() {
		selectedItems = new Set();
	}

	async function bulkDelete() {
		if (selectedItems.size === 0) return;

		if (!confirm(`Delete ${selectedItems.size} file(s)?`)) return;

		const token = localStorage.getItem('access_token');
		const failures: string[] = [];

		for (const id of selectedItems) {
			try {
				const response = await fetch('/api/media', {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ id })
				});

				if (!response.ok) throw new Error('Delete failed');
			} catch (err) {
				failures.push(id);
			}
		}

		if (failures.length > 0) {
			alert(`Failed to delete ${failures.length} file(s)`);
		}

		selectedItems = new Set();
		await loadMedia();
		await loadStats();
	}

	$: filteredMedia = media.filter((item) => {
		const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType =
			searchQuery.toLowerCase().includes('image') ||
			searchQuery.toLowerCase().includes('video') ||
			searchQuery.toLowerCase().includes('document');
		return matchesSearch || (matchesType && item.mimeType.toLowerCase().includes(searchQuery.toLowerCase()));
	});

	$: storagePercentage = Math.round((stats.totalSize / storageQuota) * 100);
</script>

<svelte:head>
	<title>Media Library - LineBasis Admin</title>
</svelte:head>

<div class="media-library">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/admin" class="back-link">← Dashboard</a>
				<h1>Media Library</h1>
			</div>
			<button class="btn-primary" on:click={() => fileInput.click()} disabled={uploading}>
				{uploading ? '⏳ Uploading...' : '📤 Upload File'}
			</button>
			<input
				type="file"
				bind:this={fileInput}
				on:change={handleFileSelect}
				accept="image/*,video/*,application/pdf"
				style="display: none"
			/>
		</div>
	</header>

	<div class="stats-bar">
		<div class="stat">
			<span class="stat-label">Total Files:</span>
			<span class="stat-value">{stats.totalFiles}</span>
		</div>
		<div class="stat">
			<span class="stat-label">Storage Used:</span>
			<span class="stat-value">{formatBytes(stats.totalSize)} / {formatBytes(storageQuota)}</span>
		</div>
		<div class="stat storage-quota">
			<div class="quota-bar">
				<div class="quota-fill" style="width: {storagePercentage}%"></div>
			</div>
			<span class="quota-text">{storagePercentage}% used</span>
		</div>
	</div>

	<div class="toolbar">
		<div class="search-box">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search files by name or type..."
				class="search-input"
			/>
		</div>

		<div class="filters">
			<select bind:value={typeFilter} on:change={loadMedia} class="filter-select">
				<option value="all">All Types</option>
				<option value="image">Images</option>
				<option value="video">Videos</option>
				<option value="document">Documents</option>
			</select>
		</div>

		<div class="view-toggle">
			<button
				class="view-btn"
				class:active={viewMode === 'grid'}
				on:click={() => (viewMode = 'grid')}
				title="Grid view"
			>
				⊞
			</button>
			<button
				class="view-btn"
				class:active={viewMode === 'list'}
				on:click={() => (viewMode = 'list')}
				title="List view"
			>
				☰
			</button>
		</div>

		{#if selectedItems.size > 0}
			<div class="bulk-actions">
				<span class="selected-count">{selectedItems.size} selected</span>
				<button class="btn-bulk" on:click={deselectAll}>Deselect All</button>
				<button class="btn-bulk btn-danger" on:click={bulkDelete}>🗑️ Delete</button>
			</div>
		{:else if filteredMedia.length > 0}
			<button class="btn-bulk" on:click={selectAll}>Select All</button>
		{/if}
	</div>

	{#if uploading}
		<div class="upload-progress">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {uploadProgress}%"></div>
			</div>
			<span class="progress-text">Uploading... {uploadProgress}%</span>
		</div>
	{/if}

	{#if uploadError}
		<div class="upload-error">
			{uploadError}
			<button on:click={() => (uploadError = '')}>×</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Loading media...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if filteredMedia.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🖼️</div>
			<h2>No media files</h2>
			<p>Upload your first image, video, or document!</p>
			<button class="btn-primary" on:click={() => fileInput.click()}>Upload File</button>
		</div>
	{:else}
		<div class="media-{viewMode}">
			{#each filteredMedia as item (item.id)}
				<div class="media-item" class:selected={selectedItems.has(item.id)}>
					<input
						type="checkbox"
						class="item-checkbox"
						checked={selectedItems.has(item.id)}
						on:change={() => toggleSelection(item.id)}
					/>
					<div class="media-preview">
						{#if isImage(item.mimeType)}
							<img src={item.url} alt={item.altText || item.filename} />
						{:else}
							<div class="file-icon">{getFileIcon(item.mimeType)}</div>
						{/if}
					</div>
					<div class="media-info">
						<div class="filename" title={item.filename}>{item.filename}</div>
						<div class="meta">
							{#if item.width && item.height}
								<span>{item.width}×{item.height}</span>
								<span>·</span>
							{/if}
							<span>{formatBytes(item.size)}</span>
							<span>·</span>
							<span>{formatDate(item.createdAt)}</span>
							{#if viewMode === 'list'}
								<span>·</span>
								<span>{item.uploader.name}</span>
							{/if}
						</div>
					</div>
					<div class="media-actions">
						<button
							class="btn-icon"
							title="Copy URL"
							on:click={() => copyUrl(window.location.origin + item.url)}
						>
							📋
						</button>
						{#if isImage(item.mimeType)}
							<button
								class="btn-icon"
								title="View"
								on:click={() => window.open(item.url, '_blank')}
							>
								👁️
							</button>
						{/if}
						<button
							class="btn-icon btn-danger"
							title="Delete"
							on:click={() => deleteMedia(item.id, item.filename)}
						>
							🗑️
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.media-library {
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
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.stats-bar {
		max-width: 1400px;
		margin: 24px auto 0;
		padding: 0 24px;
		display: flex;
		gap: 32px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.stat-label {
		color: #718096;
		font-size: 14px;
	}

	.stat-value {
		color: #1a202c;
		font-weight: 600;
		font-size: 16px;
	}

	.storage-quota {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		max-width: 300px;
	}

	.quota-bar {
		flex: 1;
		height: 8px;
		background: #e2e8f0;
		border-radius: 4px;
		overflow: hidden;
	}

	.quota-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		transition: width 0.3s ease;
	}

	.quota-text {
		color: #718096;
		font-size: 13px;
		white-space: nowrap;
	}

	.toolbar {
		max-width: 1400px;
		margin: 24px auto;
		padding: 0 24px;
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
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

	.view-toggle {
		display: flex;
		gap: 4px;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		overflow: hidden;
	}

	.view-btn {
		padding: 8px 14px;
		background: white;
		border: none;
		cursor: pointer;
		font-size: 18px;
		transition: all 0.2s;
		color: #718096;
	}

	.view-btn:hover {
		background: #f7fafc;
	}

	.view-btn.active {
		background: #667eea;
		color: white;
	}

	.bulk-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.selected-count {
		color: #667eea;
		font-weight: 600;
		font-size: 14px;
	}

	.btn-bulk {
		padding: 8px 16px;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-bulk:hover {
		border-color: #cbd5e0;
		background: #f7fafc;
	}

	.btn-bulk.btn-danger {
		color: #e53e3e;
		border-color: #fc8181;
	}

	.btn-bulk.btn-danger:hover {
		background: #fed7d7;
	}

	.upload-progress {
		max-width: 1400px;
		margin: 0 auto 24px;
		padding: 0 24px;
	}

	.progress-bar {
		height: 8px;
		background: #e2e8f0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		transition: width 0.3s ease;
	}

	.progress-text {
		color: #667eea;
		font-size: 14px;
		font-weight: 600;
	}

	.upload-error {
		max-width: 1400px;
		margin: 0 auto 24px;
		padding: 12px 24px;
		background: #fed7d7;
		color: #c53030;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.upload-error button {
		background: none;
		border: none;
		color: #c53030;
		font-size: 20px;
		cursor: pointer;
		padding: 0 8px;
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

	.media-grid {
		max-width: 1400px;
		margin: 0 auto 40px;
		padding: 0 24px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	.media-list {
		max-width: 1400px;
		margin: 0 auto 40px;
		padding: 0 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.media-list .media-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px;
	}

	.media-list .media-preview {
		width: 80px;
		height: 60px;
		flex-shrink: 0;
	}

	.media-list .media-info {
		flex: 1;
		padding: 0;
	}

	.media-list .media-actions {
		padding: 0;
		border: none;
	}

	.media-item {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		position: relative;
	}

	.media-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.media-item.selected {
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
	}

	.item-checkbox {
		position: absolute;
		top: 12px;
		left: 12px;
		width: 20px;
		height: 20px;
		cursor: pointer;
		z-index: 10;
		accent-color: #667eea;
	}

	.media-preview {
		aspect-ratio: 16/9;
		background: #f7fafc;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.media-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.file-icon {
		font-size: 48px;
	}

	.media-info {
		padding: 12px;
	}

	.filename {
		font-weight: 600;
		color: #1a202c;
		margin-bottom: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta {
		font-size: 12px;
		color: #718096;
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.media-actions {
		padding: 8px 12px;
		border-top: 1px solid #e2e8f0;
		display: flex;
		gap: 8px;
		justify-content: flex-end;
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
</style>

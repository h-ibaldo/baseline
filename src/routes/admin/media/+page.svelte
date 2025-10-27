<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	type Media = {
		id: string;
		filename: string;
		url: string;
		mimeType: string;
		size: number;
		width?: number;
		height?: number;
		altText?: string;
		createdAt: string;
		uploader: {
			name: string;
			email: string;
		};
	};

	let media: Media[] = [];
	let isLoading = true;
	let isUploading = false;
	let error = '';
	let selectedFiles: FileList | null = null;
	let uploadInput: HTMLInputElement;
	let filter = 'all'; // all, images, videos

	onMount(async () => {
		await loadMedia();
	});

	async function loadMedia() {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			const typeParam = filter === 'images' ? 'image/' : filter === 'videos' ? 'video/' : '';
			const response = await fetch(`/api/media?type=${typeParam}`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error('Failed to load media');

			const data = await response.json();
			media = data.media;
		} catch (err) {
			error = 'Failed to load media';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function handleUpload() {
		if (!selectedFiles || selectedFiles.length === 0) return;

		const token = localStorage.getItem('accessToken');
		isUploading = true;
		error = '';

		try {
			for (const file of Array.from(selectedFiles)) {
				const formData = new FormData();
				formData.append('file', file);

				const response = await fetch('/api/media/upload', {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
					body: formData
				});

				if (!response.ok) {
					const data = await response.json();
					error = data.error || 'Upload failed';
					break;
				}
			}

			// Reload media list
			await loadMedia();
			selectedFiles = null;
			if (uploadInput) uploadInput.value = '';
		} catch (err) {
			error = 'Upload failed';
			console.error(err);
		} finally {
			isUploading = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this media?')) return;

		const token = localStorage.getItem('accessToken');

		try {
			const response = await fetch(`/api/media/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error('Delete failed');

			await loadMedia();
		} catch (err) {
			error = 'Failed to delete media';
			console.error(err);
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	async function handleFilterChange(newFilter: string) {
		filter = newFilter;
		isLoading = true;
		await loadMedia();
	}
</script>

<!-- STYLE: Media library main page -->
<main class="media-library">
	<!-- STYLE: Page header with title and upload button -->
	<header class="media-header">
		<h1 class="page-title">Media Library</h1>
		<div class="header-actions">
			<label for="file-upload" class="button-upload">
				{isUploading ? 'Uploading...' : 'Upload Files'}
				<input
					type="file"
					id="file-upload"
					bind:this={uploadInput}
					bind:files={selectedFiles}
					on:change={handleUpload}
					multiple
					accept="image/*,video/*"
					disabled={isUploading}
					style="display: none;"
				/>
			</label>
		</div>
	</header>

	<!-- STYLE: Filter tabs -->
	<nav class="media-filters">
		<button
			class="filter-tab"
			class:active={filter === 'all'}
			on:click={() => handleFilterChange('all')}
		>
			All Media
		</button>
		<button
			class="filter-tab"
			class:active={filter === 'images'}
			on:click={() => handleFilterChange('images')}
		>
			Images
		</button>
		<button
			class="filter-tab"
			class:active={filter === 'videos'}
			on:click={() => handleFilterChange('videos')}
		>
			Videos
		</button>
	</nav>

	<!-- STYLE: Error message -->
	{#if error}
		<div class="error-message" role="alert">
			{error}
		</div>
	{/if}

	<!-- STYLE: Loading state -->
	{#if isLoading}
		<div class="loading-state">
			<p>Loading media...</p>
		</div>
	{:else if media.length === 0}
		<!-- STYLE: Empty state -->
		<div class="empty-state">
			<h2>No media files yet</h2>
			<p>Upload your first image or video to get started</p>
		</div>
	{:else}
		<!-- STYLE: Media grid - responsive grid layout -->
		<div class="media-grid">
			{#each media as item}
				<div class="media-item">
					<!-- STYLE: Media preview - image or video thumbnail -->
					<div class="media-preview">
						{#if item.mimeType.startsWith('image/')}
							<img src={item.url} alt={item.altText || item.filename} class="media-image" />
						{:else if item.mimeType.startsWith('video/')}
							<video src={item.url} class="media-video" controls>
								<track kind="captions" />
							</video>
						{/if}
					</div>

					<!-- STYLE: Media info -->
					<div class="media-info">
						<h3 class="media-filename">{item.filename}</h3>
						<div class="media-meta">
							{#if item.width && item.height}
								<span class="meta-item">{item.width} × {item.height}</span>
							{/if}
							<span class="meta-item">{formatFileSize(item.size)}</span>
						</div>
						<p class="media-uploader">Uploaded by {item.uploader.name}</p>
					</div>

					<!-- STYLE: Media actions -->
					<div class="media-actions">
						<button class="button-copy" on:click={() => navigator.clipboard.writeText(item.url)}>
							Copy URL
						</button>
						<button class="button-delete" on:click={() => handleDelete(item.id)}>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>

<!--
  NO STYLES - Ready for Ibaldo's design!

  Styling areas marked above with STYLE comments
  All class names are semantic and ready for CSS

  Functionality included:
  ✅ File upload with drag-and-drop ready
  ✅ Multi-file upload support
  ✅ Filter by type (all, images, videos)
  ✅ Image and video preview
  ✅ Delete confirmation
  ✅ Copy URL to clipboard
  ✅ File size formatting
  ✅ Loading and empty states
  ✅ Error handling
  ✅ Responsive grid ready
-->

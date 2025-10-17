<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import BlockPanel from '$lib/components/ui/BlockPanel.svelte';
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import {
		canvasState,
		addArtboard,
		insertBlock,
		selectedElementIds
	} from '$lib/stores/design-store';
	import { currentEvents, undo, redo, canUndo, canRedo } from '$lib/stores/event-store';

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

	let pageId = $page.url.searchParams.get('id');
	let loading = true;
	let saving = false;
	let autosaving = false;
	let error = '';
	let success = '';
	let showBlockPanel = true;
	let pageTitle = 'New Page';
	let pageSlug = '';
	let hasInitialArtboard = false;
	let lastSavedAt: Date | null = null;
	let hasUnsavedChanges = false;
	let autosaveTimer: number | null = null;
	let unsubscribeEvents: (() => void) | null = null;

	const AUTOSAVE_DELAY = 30000; // 30 seconds

	onMount(() => {
		checkAuth();
		initializeCanvas();
		loadDraft();
		watchForChanges();
	});

	onDestroy(() => {
		if (autosaveTimer) {
			clearTimeout(autosaveTimer);
		}
		if (unsubscribeEvents) {
			unsubscribeEvents();
		}
	});

	function checkAuth() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}
		loading = false;
	}

	function initializeCanvas() {
		// Create default artboard if none exists
		if ($canvasState.artboards.length === 0 && !hasInitialArtboard) {
			addArtboard({
				name: 'Main Page',
				x: 50,
				y: 50,
				width: 1200,
				height: 1600,
				backgroundColor: '#ffffff',
				showGrid: true,
				isPublishTarget: true
			});
			hasInitialArtboard = true;
		}
	}

	async function loadDraft() {
		if (!pageId) return;

		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch(`/api/pages/${pageId}/autosave`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.ok) {
				const data = await response.json();
				if (data.lastSavedAt) {
					lastSavedAt = new Date(data.lastSavedAt);
				}
				hasUnsavedChanges = data.hasUnsavedChanges || false;
			}
		} catch (err) {
			console.error('Failed to load draft:', err);
		}
	}

	function watchForChanges() {
		// Watch for changes in design events
		unsubscribeEvents = currentEvents.subscribe((events) => {
			if (events.length > 0 && pageId) {
				hasUnsavedChanges = true;
				scheduleAutosave();
			}
		});
	}

	function scheduleAutosave() {
		if (!pageId) return;

		if (autosaveTimer) {
			clearTimeout(autosaveTimer);
		}

		autosaveTimer = window.setTimeout(() => {
			performAutosave();
		}, AUTOSAVE_DELAY);
	}

	async function performAutosave() {
		if (!pageId || autosaving) return;

		autosaving = true;

		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch(`/api/pages/${pageId}/autosave`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					draftContent: JSON.stringify($canvasState)
				})
			});

			if (response.ok) {
				const data = await response.json();
				lastSavedAt = new Date(data.lastSavedAt);
				hasUnsavedChanges = false;
			}
		} catch (err) {
			console.error('Autosave failed:', err);
		} finally {
			autosaving = false;
		}
	}

	function formatLastSaved(): string {
		if (!lastSavedAt) return 'Never';

		const now = Date.now();
		const diff = now - lastSavedAt.getTime();
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);

		if (minutes === 0) return 'Just now';
		if (minutes === 1) return '1 minute ago';
		if (minutes < 60) return `${minutes} minutes ago`;

		const hours = Math.floor(minutes / 60);
		if (hours === 1) return '1 hour ago';
		return `${hours} hours ago`;
	}

	function handleBlockSelect(block: ContentBlock) {
		// Get first artboard (or create if needed)
		let artboardId = $canvasState.artboards[0]?.id;

		if (!artboardId) {
			artboardId = addArtboard({
				name: 'Main Page',
				x: 50,
				y: 50,
				width: 1200,
				height: 1600,
				backgroundColor: '#ffffff',
				showGrid: true,
				isPublishTarget: true
			});
		}

		// Insert block at center of artboard
		const artboard = $canvasState.artboards.find((a) => a.id === artboardId);
		if (artboard) {
			const x = 50;
			const y = $canvasState.elements.filter((el) => el.artboardId === artboardId).length * 120 + 50;

			const elementIds = insertBlock(
				block.id,
				block.name,
				block.content,
				artboardId,
				x,
				y
			);

			if (elementIds.length > 0) {
				success = `Inserted block: ${block.name}`;
				setTimeout(() => (success = ''), 3000);
			} else {
				error = 'Failed to insert block';
				setTimeout(() => (error = ''), 3000);
			}
		}
	}

	async function savePage() {
		if (!pageTitle.trim()) {
			error = 'Page title is required';
			return;
		}

		if (!pageSlug.trim()) {
			error = 'Page slug is required';
			return;
		}

		saving = true;
		error = '';

		try {
			const token = localStorage.getItem('access_token');
			const url = pageId ? `/api/pages/${pageId}` : '/api/pages';
			const method = pageId ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					slug: pageSlug.trim(),
					title: pageTitle.trim(),
					designEvents: JSON.stringify($canvasState),
					status: 'draft'
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to save page');
			}

			const data = await response.json();
			if (!pageId) {
				pageId = data.id;
				// Update URL without reload
				window.history.replaceState({}, '', `/admin/pages/editor?id=${pageId}`);
			}

			success = 'Page saved successfully!';
			setTimeout(() => (success = ''), 3000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save page';
		} finally {
			saving = false;
		}
	}

	function handleUndo() {
		if ($canUndo) {
			undo();
		}
	}

	function handleRedo() {
		if ($canRedo) {
			redo();
		}
	}

	function toggleBlockPanel() {
		showBlockPanel = !showBlockPanel;
	}

	// Auto-generate slug from title
	$: if (pageTitle && !pageSlug) {
		pageSlug = pageTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}
</script>

<svelte:head>
	<title>Page Editor - LineBasis Admin</title>
</svelte:head>

<div class="editor-container">
	<!-- Top Toolbar -->
	<div class="toolbar">
		<div class="toolbar-left">
			<a href="/admin/pages" class="back-link">← Pages</a>
			<div class="title-input-group">
				<input
					type="text"
					class="title-input"
					placeholder="Page Title"
					bind:value={pageTitle}
				/>
				<input type="text" class="slug-input" placeholder="page-slug" bind:value={pageSlug} />
			</div>
		</div>

		<div class="toolbar-center">
			<button class="toolbar-btn" on:click={handleUndo} disabled={!$canUndo} title="Undo">
				↶ Undo
			</button>
			<button class="toolbar-btn" on:click={handleRedo} disabled={!$canRedo} title="Redo">
				↷ Redo
			</button>
			<button
				class="toolbar-btn"
				class:active={showBlockPanel}
				on:click={toggleBlockPanel}
				title="Toggle Blocks Panel"
			>
				📦 Blocks
			</button>
			<div class="autosave-status" class:unsaved={hasUnsavedChanges}>
				{#if autosaving}
					<span class="status-indicator saving">Saving...</span>
				{:else if hasUnsavedChanges}
					<span class="status-indicator unsaved">● Unsaved changes</span>
				{:else}
					<span class="status-indicator saved">✓ Saved {formatLastSaved()}</span>
				{/if}
			</div>
		</div>

		<div class="toolbar-right">
			<button class="btn-secondary" on:click={savePage} disabled={saving}>
				{saving ? 'Saving...' : 'Save Draft'}
			</button>
		</div>
	</div>

	<!-- Notifications -->
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

	<!-- Editor Layout -->
	<div class="editor-layout">
		<!-- Block Panel (Sidebar) -->
		{#if showBlockPanel}
			<div class="block-panel-container">
				<BlockPanel onBlockSelect={handleBlockSelect} />
			</div>
		{/if}

		<!-- Canvas Area -->
		<div class="canvas-area">
			{#if loading}
				<div class="loading">Loading editor...</div>
			{:else}
				<Canvas />
			{/if}
		</div>
	</div>
</div>

<style>
	.editor-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f7fafc;
		overflow: hidden;
	}

	/* Toolbar */
	.toolbar {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-shrink: 0;
	}

	.toolbar-left,
	.toolbar-center,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.toolbar-left {
		flex: 1;
	}

	.toolbar-right {
		flex: 1;
		justify-content: flex-end;
	}

	.back-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
	}

	.title-input-group {
		display: flex;
		gap: 8px;
		flex: 1;
		max-width: 600px;
	}

	.title-input,
	.slug-input {
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 14px;
	}

	.title-input {
		flex: 2;
		font-weight: 600;
	}

	.slug-input {
		flex: 1;
		font-family: monospace;
		font-size: 13px;
	}

	.title-input:focus,
	.slug-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.toolbar-btn {
		padding: 6px 12px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 13px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.toolbar-btn:hover:not(:disabled) {
		border-color: #667eea;
		color: #667eea;
	}

	.toolbar-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar-btn.active {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}

	.btn-secondary {
		padding: 8px 16px;
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		font-size: 14px;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #667eea;
		color: white;
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Notifications */
	.success-banner,
	.error-banner {
		padding: 12px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		flex-shrink: 0;
	}

	.success-banner {
		background: #c6f6d5;
		color: #2f855a;
	}

	.error-banner {
		background: #fed7d7;
		color: #c53030;
	}

	.success-banner button,
	.error-banner button {
		background: none;
		border: none;
		font-size: 18px;
		cursor: pointer;
		padding: 0 8px;
		color: inherit;
	}

	/* Editor Layout */
	.editor-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.block-panel-container {
		width: 300px;
		border-right: 1px solid #e2e8f0;
		background: white;
		flex-shrink: 0;
		overflow: hidden;
	}

	.canvas-area {
		flex: 1;
		overflow: auto;
		background: #f7fafc;
		position: relative;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #718096;
		font-size: 14px;
	}

	/* Autosave Status */
	.autosave-status {
		padding: 6px 12px;
		border-radius: 4px;
		background: #f7fafc;
	}

	.status-indicator {
		font-size: 13px;
		font-weight: 500;
	}

	.status-indicator.saving {
		color: #667eea;
	}

	.status-indicator.unsaved {
		color: #f59e0b;
	}

	.status-indicator.saved {
		color: #10b981;
	}
</style>

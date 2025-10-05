<script lang="ts">
	/**
	 * Persistence Demo Page
	 * Demonstrates IndexedDB persistence with auto-save and project management
	 */
	import ProjectManager from '$lib/components/ui/ProjectManager.svelte';
	import HistoryPanel from '$lib/components/ui/HistoryPanel.svelte';
	import {
		canvasState,
		selectedElementIds,
		addArtboard,
		addElement,
		moveElement,
		resizeElement,
		deleteElement,
		updateElement
	} from '$lib/stores/design-store';
	import {
		currentProject,
		hasUnsavedChanges,
		lastSaved,
		autoSaveConfig
	} from '$lib/stores/project-store';
	import { currentEvents } from '$lib/stores/event-store';
	import { getStorageStats } from '$lib/utils/storage';

	// Storage stats
	let storageStats = { projectCount: 0, totalEvents: 0, estimatedSize: 0 };

	// Auto-save status
	let autoSaveStatus = 'Idle';
	let lastAutoSaveTime: number | null = null;

	// Refresh storage stats
	async function refreshStats() {
		storageStats = await getStorageStats();
	}

	// Watch for changes to update stats
	$: if ($currentProject) {
		refreshStats();
	}

	// Watch for auto-save
	$: if ($lastSaved && $lastSaved !== lastAutoSaveTime) {
		lastAutoSaveTime = $lastSaved;
		autoSaveStatus = 'Saved';
		setTimeout(() => {
			if (autoSaveStatus === 'Saved') {
				autoSaveStatus = 'Idle';
			}
		}, 2000);
	}

	$: if ($hasUnsavedChanges && autoSaveStatus === 'Idle') {
		autoSaveStatus = 'Saving...';
	}

	/**
	 * Demo actions
	 */
	function addDemoArtboard() {
		if (!$currentProject) {
			alert('Please create or open a project first');
			return;
		}

		addArtboard({
			name: `Artboard ${$canvasState.artboards.length + 1}`,
			x: 100 + $canvasState.artboards.length * 200,
			y: 100,
			width: 800,
			height: 600,
			backgroundColor: '#ffffff',
			showGrid: true,
			gridSize: 20,
			isPublishTarget: true
		});
	}

	function addDemoElement() {
		if ($canvasState.artboards.length === 0) {
			alert('Please add an artboard first');
			return;
		}

		const artboardId = $canvasState.artboards[0].id;
		const elementCount = $canvasState.elements.filter((e) => e.artboardId === artboardId).length;

		addElement({
			type: 'box',
			artboardId,
			x: 50 + elementCount * 20,
			y: 50 + elementCount * 20,
			width: 150,
			height: 100,
			rotation: 0,
			opacity: 1
		});
	}

	function moveDemoElement(elementId: string) {
		const element = $canvasState.elements.find((e) => e.id === elementId);
		if (element) {
			moveElement(elementId, element.x + 50, element.y + 50);
		}
	}

	function resizeDemoElement(elementId: string) {
		const element = $canvasState.elements.find((e) => e.id === elementId);
		if (element) {
			resizeElement(elementId, element.width + 20, element.height + 20);
		}
	}

	function deleteDemoElement(elementId: string) {
		deleteElement(elementId);
	}

	function updateOpacity(elementId: string) {
		const element = $canvasState.elements.find((e) => e.id === elementId);
		if (element) {
			const newOpacity = element.opacity && element.opacity > 0.3 ? element.opacity - 0.2 : 1;
			updateElement(elementId, { opacity: newOpacity });
		}
	}

	/**
	 * Get background color based on element index
	 */
	function getElementColor(index: number): string {
		const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
		return colors[index % colors.length];
	}

	/**
	 * Format file size
	 */
	function formatSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}
</script>

<svelte:head>
	<title>Persistence Demo - Baseline</title>
</svelte:head>

<main>
	<header>
		<h1>Persistence Demo</h1>
		<p>IndexedDB local storage with auto-save and project management</p>
	</header>

	<div class="demo-container">
		<!-- Left: Canvas & Controls -->
		<div class="canvas-section">
			<!-- Project Manager -->
			<ProjectManager />

			<!-- Canvas Controls -->
			{#if $currentProject}
				<div class="canvas-controls">
					<h2>Canvas Controls</h2>
					<div class="actions">
						<button on:click={addDemoArtboard}> + Add Artboard </button>
						<button on:click={addDemoElement}> + Add Element </button>
					</div>
				</div>

				<!-- Canvas Preview -->
				<div class="canvas-preview">
					{#if $canvasState.artboards.length === 0}
						<div class="empty-state">
							<p>No artboards yet. Click "Add Artboard" to get started!</p>
						</div>
					{:else}
						{#each $canvasState.artboards as artboard (artboard.id)}
							<div class="artboard" style="background-color: {artboard.backgroundColor};">
								<div class="artboard-header">
									<strong>{artboard.name}</strong>
									<span class="size">{artboard.width}×{artboard.height}</span>
								</div>

								<!-- Elements in this artboard -->
								{#each $canvasState.elements.filter((e) => e.artboardId === artboard.id) as element, index (element.id)}
									<div
										class="element"
										class:selected={$selectedElementIds.includes(element.id)}
										style="
										left: {element.x}px;
										top: {element.y + 40}px;
										width: {element.width}px;
										height: {element.height}px;
										background-color: {getElementColor(index)};
										opacity: {element.opacity ?? 1};
										transform: rotate({element.rotation ?? 0}deg);
									"
										role="button"
										tabindex="0"
									>
										<div class="element-id">{element.id.slice(0, 12)}</div>
										<div class="element-actions">
											<button on:click|stopPropagation={() => moveDemoElement(element.id)} title="Move">↗</button>
											<button on:click|stopPropagation={() => resizeDemoElement(element.id)} title="Resize">⤢</button>
											<button on:click|stopPropagation={() => updateOpacity(element.id)} title="Opacity">◐</button>
											<button on:click|stopPropagation={() => deleteDemoElement(element.id)} title="Delete">×</button>
										</div>
									</div>
								{/each}
							</div>
						{/each}
					{/if}
				</div>

				<!-- State Info -->
				<div class="state-info">
					<h3>Current State</h3>
					<div class="info-grid">
						<div class="info-item">
							<span class="label">Artboards:</span>
							<span class="value">{$canvasState.artboards.length}</span>
						</div>
						<div class="info-item">
							<span class="label">Elements:</span>
							<span class="value">{$canvasState.elements.length}</span>
						</div>
						<div class="info-item">
							<span class="label">Events:</span>
							<span class="value">{$currentEvents.length}</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="no-project-message">
					<p>Create a new project or open an existing one to start designing.</p>
				</div>
			{/if}
		</div>

		<!-- Right: Sidebar -->
		<div class="sidebar">
			<!-- Auto-Save Status -->
			{#if $currentProject}
				<div class="autosave-panel">
					<h3>Auto-Save</h3>
					<div class="status">
						<div class="status-indicator" class:active={$autoSaveConfig.enabled}>
							{#if $autoSaveConfig.enabled}
								<span class="dot saving" class:saved={autoSaveStatus === 'Saved'}></span>
								<span>{autoSaveStatus}</span>
							{:else}
								<span class="dot disabled"></span>
								<span>Disabled</span>
							{/if}
						</div>

						{#if $hasUnsavedChanges}
							<span class="unsaved">● Unsaved changes</span>
						{:else}
							<span class="saved-status">✓ All changes saved</span>
						{/if}
					</div>

					<div class="autosave-info">
						<div class="info-row">
							<span>Interval:</span>
							<span>{$autoSaveConfig.intervalMs / 1000}s</span>
						</div>
						<div class="info-row">
							<span>Debounce:</span>
							<span>{$autoSaveConfig.debounceMs / 1000}s</span>
						</div>
					</div>
				</div>

				<!-- History Panel -->
				<HistoryPanel />

				<!-- Storage Stats -->
				<div class="storage-panel">
					<h3>Storage Stats</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-label">Projects:</span>
							<span class="stat-value">{storageStats.projectCount}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Total Events:</span>
							<span class="stat-value">{storageStats.totalEvents}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Storage Used:</span>
							<span class="stat-value">{formatSize(storageStats.estimatedSize)}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	main {
		padding: 2rem;
		max-width: 1600px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #6c757d;
	}

	p {
		color: #666;
	}

	.demo-container {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 2rem;
	}

	/* Canvas Section */
	.canvas-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.canvas-controls {
		padding: 1rem;
		background: #fff;
		border: 2px solid #007bff;
		border-radius: 8px;
	}

	.canvas-controls h2 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #007bff;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s;
	}

	button:hover {
		background: #0056b3;
	}

	.canvas-preview {
		min-height: 400px;
		border: 2px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		background: #f5f5f5;
		overflow: auto;
	}

	.empty-state,
	.no-project-message {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 300px;
		color: #999;
		font-style: italic;
	}

	/* Artboard & Element Styles (similar to event-sourcing-demo) */
	.artboard {
		position: relative;
		display: inline-block;
		margin: 1rem;
		border: 2px solid #333;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		min-height: 400px;
		min-width: 500px;
	}

	.artboard-header {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: rgba(0, 0, 0, 0.05);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		font-size: 0.85rem;
	}

	.size {
		color: #666;
	}

	.element {
		position: absolute;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.75rem;
		padding: 0.5rem;
	}

	.element:hover {
		border-color: #007bff;
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
	}

	.element.selected {
		border-color: #28a745;
		border-width: 3px;
		box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
	}

	.element-id {
		font-family: monospace;
		font-size: 0.7rem;
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.element-actions {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.element:hover .element-actions {
		opacity: 1;
	}

	.element-actions button {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		background: rgba(0, 0, 0, 0.6);
	}

	.element-actions button:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.state-info {
		padding: 1rem;
		background: #fff;
		border: 2px solid #007bff;
		border-radius: 8px;
	}

	.state-info h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #007bff;
	}

	.info-grid {
		display: flex;
		gap: 2rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.85rem;
		color: #666;
	}

	.value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #333;
	}

	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.autosave-panel,
	.storage-panel {
		padding: 1.5rem;
		background: #fff;
		border: 2px solid #6c757d;
		border-radius: 8px;
	}

	.autosave-panel h3,
	.storage-panel h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #6c757d;
	}

	.status {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #ccc;
	}

	.dot.saving {
		background: #ffc107;
		animation: pulse 1.5s infinite;
	}

	.dot.saved {
		background: #28a745;
		animation: none;
	}

	.dot.disabled {
		background: #dc3545;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.unsaved {
		color: #ffc107;
		font-size: 0.85rem;
	}

	.saved-status {
		color: #28a745;
		font-size: 0.85rem;
	}

	.autosave-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
		font-size: 0.85rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
	}

	.stats-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
	}

	.stat-label {
		color: #666;
	}

	.stat-value {
		font-weight: 600;
		color: #333;
	}
</style>


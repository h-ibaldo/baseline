<script lang="ts">
	/**
	 * Project Manager Component
	 * UI for creating, loading, and managing projects
	 */
	import { onMount } from 'svelte';
	import {
		currentProject,
		currentProjectMetadata,
		hasUnsavedChanges,
		lastSaved,
		createProject,
		loadProject,
		saveCurrentProject,
		closeProject,
		deleteProject,
		listProjects,
		renameCurrentProject,
		saveManually
	} from '$lib/stores/project-store';
	import type { ProjectMetadata } from '$lib/types/project';

	// Component state
	let projects: ProjectMetadata[] = [];
	let showNewProjectDialog = false;
	let showProjectList = false;
	let newProjectName = '';
	let newProjectDescription = '';
	let isLoading = false;
	let error: string | null = null;

	/**
	 * Load project list on mount
	 */
	onMount(async () => {
		await refreshProjectList();
	});

	/**
	 * Refresh project list from IndexedDB
	 */
	async function refreshProjectList() {
		try {
			isLoading = true;
			error = null;
			projects = await listProjects();
			// Sort by most recently updated
			projects.sort((a, b) => b.updatedAt - a.updatedAt);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load projects';
			console.error('Failed to load projects:', err);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Create new project
	 */
	async function handleCreateProject() {
		if (!newProjectName.trim()) {
			error = 'Project name is required';
			return;
		}

		try {
			isLoading = true;
			error = null;

			await createProject({
				name: newProjectName.trim(),
				description: newProjectDescription.trim() || undefined
			});

			// Reset form
			newProjectName = '';
			newProjectDescription = '';
			showNewProjectDialog = false;

			// Refresh list
			await refreshProjectList();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create project';
			console.error('Failed to create project:', err);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Load existing project
	 */
	async function handleLoadProject(projectId: string) {
		try {
			isLoading = true;
			error = null;

			// Check for unsaved changes
			if ($hasUnsavedChanges) {
				const confirmed = confirm(
					'You have unsaved changes. Do you want to save before loading another project?'
				);
				if (confirmed) {
					await saveCurrentProject();
				}
			}

			// Close current project
			if ($currentProject) {
				await closeProject(false);
			}

			// Load new project
			await loadProject(projectId);

			// Close project list
			showProjectList = false;

			// Refresh list
			await refreshProjectList();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load project';
			console.error('Failed to load project:', err);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Delete project
	 */
	async function handleDeleteProject(projectId: string, projectName: string) {
		const confirmed = confirm(
			`Are you sure you want to delete "${projectName}"? This cannot be undone.`
		);

		if (!confirmed) return;

		try {
			isLoading = true;
			error = null;

			await deleteProject(projectId);

			// Refresh list
			await refreshProjectList();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete project';
			console.error('Failed to delete project:', err);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Save current project manually
	 */
	async function handleSave() {
		try {
			isLoading = true;
			error = null;
			await saveManually();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save project';
			console.error('Failed to save project:', err);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Format timestamp
	 */
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = Date.now();
		const diff = now - timestamp;

		// Less than 1 minute
		if (diff < 60000) {
			return 'Just now';
		}

		// Less than 1 hour
		if (diff < 3600000) {
			const minutes = Math.floor(diff / 60000);
			return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		}

		// Less than 1 day
		if (diff < 86400000) {
			const hours = Math.floor(diff / 3600000);
			return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		}

		// Default to date string
		return date.toLocaleDateString();
	}

	/**
	 * Format time for last saved
	 */
	function formatLastSaved(timestamp: number | null): string {
		if (!timestamp) return 'Never';
		return formatDate(timestamp);
	}
</script>

<div class="project-manager">
	<!-- Current Project Info -->
	{#if $currentProject}
		<div class="current-project">
			<div class="project-info">
				<h3>{$currentProject.name}</h3>
				{#if $currentProjectMetadata}
					<div class="metadata">
						<span class="event-count">{$currentProjectMetadata.eventCount} events</span>
						<span class="last-saved">Last saved: {formatLastSaved($lastSaved)}</span>
					</div>
				{/if}
			</div>

			<div class="actions">
				<button 
					on:click={handleSave} 
					disabled={isLoading || !$hasUnsavedChanges}
					class="save-button"
					class:has-changes={$hasUnsavedChanges}
					title="Save project (⌘S)"
				>
					{$hasUnsavedChanges ? '● Save' : '✓ Saved'}
				</button>

				<button on:click={() => (showProjectList = !showProjectList)} disabled={isLoading}>
					{showProjectList ? 'Close' : 'Projects'}
				</button>
			</div>
		</div>
	{:else}
		<div class="no-project">
			<p>No project loaded</p>
			<div class="actions">
				<button on:click={() => (showNewProjectDialog = true)}>New Project</button>
				<button on:click={() => (showProjectList = true)}>Open Project</button>
			</div>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="error-message">
			<span>⚠️ {error}</span>
			<button on:click={() => (error = null)}>×</button>
		</div>
	{/if}

	<!-- New Project Dialog -->
	{#if showNewProjectDialog}
		<div class="dialog-overlay" on:click={() => (showNewProjectDialog = false)} role="presentation">
			<div class="dialog" on:click|stopPropagation role="dialog" aria-labelledby="new-project-title">
				<h3 id="new-project-title">Create New Project</h3>

				<form on:submit|preventDefault={handleCreateProject}>
					<label>
						Project Name *
						<input
							type="text"
							bind:value={newProjectName}
							placeholder="My Design Project"
							required
							autofocus
						/>
					</label>

					<label>
						Description (optional)
						<textarea
							bind:value={newProjectDescription}
							placeholder="Describe your project..."
							rows="3"
						/>
					</label>

					<div class="dialog-actions">
						<button type="button" on:click={() => (showNewProjectDialog = false)}>Cancel</button>
						<button type="submit" disabled={isLoading || !newProjectName.trim()}>
							Create Project
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Project List Dialog -->
	{#if showProjectList}
		<div class="dialog-overlay" on:click={() => (showProjectList = false)} role="presentation">
			<div class="dialog wide" on:click|stopPropagation role="dialog" aria-labelledby="project-list-title">
				<div class="dialog-header">
					<h3 id="project-list-title">Your Projects</h3>
					<button on:click={() => (showNewProjectDialog = true)}>+ New Project</button>
				</div>

				<div class="project-list">
					{#if isLoading}
						<p class="loading">Loading projects...</p>
					{:else if projects.length === 0}
						<p class="empty">No projects yet. Create your first project!</p>
					{:else}
						{#each projects as project (project.id)}
							<div class="project-item" class:current={$currentProject?.id === project.id}>
								<div class="project-details">
									<h4>{project.name}</h4>
									{#if project.description}
										<p class="description">{project.description}</p>
									{/if}
									<div class="project-meta">
										<span>{project.eventCount} events</span>
										<span>Updated {formatDate(project.updatedAt)}</span>
									</div>
								</div>

								<div class="project-actions">
									{#if $currentProject?.id === project.id}
										<span class="current-badge">Current</span>
									{:else}
										<button on:click={() => handleLoadProject(project.id)}>Open</button>
									{/if}
									<button
										class="delete-button"
										on:click={() => handleDeleteProject(project.id, project.name)}
										title="Delete project"
									>
										×
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<div class="dialog-actions">
					<button on:click={() => (showProjectList = false)}>Close</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.project-manager {
		position: relative;
	}

	.current-project,
	.no-project {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #fff;
		border: 2px solid #6c757d;
		border-radius: 8px;
	}

	.project-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #333;
	}

	.metadata {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #666;
	}

	.no-project {
		flex-direction: column;
		text-align: center;
		padding: 2rem;
	}

	.no-project p {
		margin: 0 0 1rem 0;
		color: #666;
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

	button:hover:not(:disabled) {
		background: #0056b3;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.save-button.has-changes {
		background: #28a745;
		animation: pulse-save 2s infinite;
	}

	.save-button.has-changes:hover:not(:disabled) {
		background: #218838;
	}

	@keyframes pulse-save {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.85;
		}
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		color: #721c24;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.error-message button {
		background: none;
		color: #721c24;
		padding: 0 0.5rem;
		font-size: 1.2rem;
	}

	/* Dialog Styles */
	.dialog-overlay {
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

	.dialog {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}

	.dialog.wide {
		max-width: 800px;
	}

	.dialog h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		color: #333;
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.dialog-header h3 {
		margin: 0;
	}

	.dialog form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.dialog label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: #555;
	}

	.dialog input,
	.dialog textarea {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
	}

	.dialog input:focus,
	.dialog textarea:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
	}

	.dialog-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	/* Project List */
	.project-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.project-list .loading,
	.project-list .empty {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.project-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.project-item:hover {
		border-color: #007bff;
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
	}

	.project-item.current {
		border-color: #28a745;
		background: rgba(40, 167, 69, 0.05);
	}

	.project-details h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #333;
	}

	.project-details .description {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		color: #666;
	}

	.project-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #999;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.current-badge {
		padding: 0.25rem 0.75rem;
		background: #28a745;
		color: white;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.delete-button {
		background: #dc3545;
		padding: 0.25rem 0.75rem;
		font-size: 1.2rem;
	}

	.delete-button:hover:not(:disabled) {
		background: #c82333;
	}
</style>


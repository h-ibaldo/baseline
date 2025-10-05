/**
 * Project Store
 * Manages current project, auto-save, and project operations
 */

import { writable, derived, get } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { Project, CreateProjectInput, ProjectMetadata, AutoSaveConfig } from '$lib/types/project';
import { CURRENT_PROJECT_VERSION, DEFAULT_AUTOSAVE_CONFIG } from '$lib/types/project';
import { eventHistory, clearHistory } from './event-store';
import { canvasState } from './design-store';
import {
	saveProject as saveToIndexedDB,
	loadProject as loadFromIndexedDB,
	deleteProject as deleteFromIndexedDB,
	getAllProjectMetadata,
	updateProjectMetadata
} from '$lib/utils/storage';
import { applyEvents } from '$lib/utils/event-reducer';

/**
 * Current project state
 */
export const currentProject = writable<Project | null>(null);

/**
 * Auto-save configuration
 */
export const autoSaveConfig = writable<AutoSaveConfig>(DEFAULT_AUTOSAVE_CONFIG);

/**
 * Last save timestamp
 */
export const lastSaved = writable<number | null>(null);

/**
 * Unsaved changes indicator
 */
export const hasUnsavedChanges = derived(
	[currentProject, eventHistory, lastSaved],
	([$currentProject, $eventHistory, $lastSaved]) => {
		if (!$currentProject) return false;
		if (!$lastSaved) return $eventHistory.events.length > 0;

		// Check if there are events after last save
		const eventsAfterSave = $eventHistory.events.filter(
			(event) => event.timestamp > $lastSaved
		);

		return eventsAfterSave.length > 0;
	}
);

/**
 * Is project loaded
 */
export const isProjectLoaded = derived(currentProject, ($project) => $project !== null);

/**
 * Current project metadata
 */
export const currentProjectMetadata = derived(
	[currentProject, eventHistory],
	([$project, $history]) => {
		if (!$project) return null;

		return {
			id: $project.id,
			name: $project.name,
			description: $project.description,
			createdAt: $project.createdAt,
			updatedAt: $project.updatedAt,
			eventCount: $history.events.length,
			version: $project.version
		};
	}
);

/**
 * Auto-save timer
 */
let autoSaveTimer: number | null = null;
let debounceTimer: number | null = null;

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<string> {
	const projectId = `project-${nanoid()}`;
	const now = Date.now();

	const project: Project = {
		id: projectId,
		name: input.name,
		description: input.description,
		events: [],
		config: input.config || {
			backgroundColor: '#f0f0f0',
			maxArtboards: 10,
			showPerformanceWarning: true
		},
		createdAt: now,
		updatedAt: now,
		version: CURRENT_PROJECT_VERSION
	};

	// Clear current event history
	clearHistory();

	// Set as current project
	currentProject.set(project);

	// Save to IndexedDB
	await saveToIndexedDB(project);

	// Update last saved
	lastSaved.set(now);

	// Start auto-save
	startAutoSave();

	return projectId;
}

/**
 * Save current project
 */
export async function saveCurrentProject(): Promise<void> {
	const project = get(currentProject);
	const history = get(eventHistory);

	if (!project) {
		throw new Error('No project loaded');
	}

	const updatedProject: Project = {
		...project,
		events: history.events,
		updatedAt: Date.now()
	};

	await saveToIndexedDB(updatedProject);

	currentProject.set(updatedProject);
	lastSaved.set(Date.now());
}

/**
 * Load project from IndexedDB
 */
export async function loadProject(projectId: string): Promise<void> {
	const project = await loadFromIndexedDB(projectId);

	if (!project) {
		throw new Error(`Project not found: ${projectId}`);
	}

	// Clear current state
	clearHistory();

	// Load events into event history
	// The event store will handle adding events one by one
	for (const event of project.events) {
		// We need to manually restore the event history
		eventHistory.update((history) => ({
			events: [...history.events, event],
			currentIndex: history.currentIndex + 1
		}));
	}

	// Set as current project
	currentProject.set(project);
	lastSaved.set(project.updatedAt);

	// Start auto-save
	startAutoSave();
}

/**
 * Close current project
 */
export async function closeProject(saveBeforeClose = true): Promise<void> {
	if (saveBeforeClose) {
		const unsaved = get(hasUnsavedChanges);
		if (unsaved) {
			await saveCurrentProject();
		}
	}

	// Stop auto-save
	stopAutoSave();

	// Clear state
	currentProject.set(null);
	clearHistory();
	lastSaved.set(null);
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
	const current = get(currentProject);

	// If deleting current project, close it first
	if (current && current.id === projectId) {
		await closeProject(false); // Don't save before closing
	}

	await deleteFromIndexedDB(projectId);
}

/**
 * Rename current project
 */
export async function renameCurrentProject(newName: string): Promise<void> {
	const project = get(currentProject);

	if (!project) {
		throw new Error('No project loaded');
	}

	await updateProjectMetadata(project.id, { name: newName });

	currentProject.update((p) => {
		if (p) {
			return { ...p, name: newName, updatedAt: Date.now() };
		}
		return p;
	});
}

/**
 * Update current project description
 */
export async function updateCurrentProjectDescription(description: string): Promise<void> {
	const project = get(currentProject);

	if (!project) {
		throw new Error('No project loaded');
	}

	await updateProjectMetadata(project.id, { description });

	currentProject.update((p) => {
		if (p) {
			return { ...p, description, updatedAt: Date.now() };
		}
		return p;
	});
}

/**
 * Get all projects (metadata only)
 */
export async function listProjects(): Promise<ProjectMetadata[]> {
	return getAllProjectMetadata();
}

/**
 * Start auto-save
 */
function startAutoSave(): void {
	stopAutoSave(); // Clear any existing timers

	const config = get(autoSaveConfig);

	if (!config.enabled) return;

	// Subscribe to event history changes
	const unsubscribe = eventHistory.subscribe(() => {
		// Clear existing debounce timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Set new debounce timer
		debounceTimer = window.setTimeout(() => {
			const project = get(currentProject);
			if (project && get(hasUnsavedChanges)) {
				saveCurrentProject().catch((error) => {
					console.error('Auto-save failed:', error);
				});
			}
		}, config.debounceMs);
	});

	// Also set interval-based auto-save as backup
	autoSaveTimer = window.setInterval(() => {
		const project = get(currentProject);
		if (project && get(hasUnsavedChanges)) {
			saveCurrentProject().catch((error) => {
				console.error('Auto-save failed:', error);
			});
		}
	}, config.intervalMs);

	// Store unsubscribe function for cleanup
	(autoSaveTimer as any).unsubscribe = unsubscribe;
}

/**
 * Stop auto-save
 */
function stopAutoSave(): void {
	if (autoSaveTimer) {
		clearInterval(autoSaveTimer);
		if ((autoSaveTimer as any).unsubscribe) {
			(autoSaveTimer as any).unsubscribe();
		}
		autoSaveTimer = null;
	}

	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
}

/**
 * Configure auto-save
 */
export function configureAutoSave(config: Partial<AutoSaveConfig>): void {
	autoSaveConfig.update((current) => ({ ...current, ...config }));

	// Restart auto-save with new config
	if (get(isProjectLoaded)) {
		startAutoSave();
	}
}

/**
 * Manually trigger save (for UI button)
 */
export async function saveManually(): Promise<void> {
	const project = get(currentProject);

	if (!project) {
		throw new Error('No project loaded');
	}

	await saveCurrentProject();
}


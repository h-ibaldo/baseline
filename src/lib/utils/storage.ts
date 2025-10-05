/**
 * IndexedDB Storage Utility
 * Handles all interactions with browser's IndexedDB for local-first persistence
 */

import type { Project, ProjectMetadata } from '$lib/types/project';
import { DB_NAME, DB_VERSION, PROJECTS_STORE } from '$lib/types/project';

/**
 * Initialize IndexedDB database
 * Creates object stores and indexes
 */
export function initDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => {
			reject(new Error('Failed to open IndexedDB'));
		};

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// Create projects object store if it doesn't exist
			if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
				const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });

				// Create indexes for efficient queries
				projectStore.createIndex('name', 'name', { unique: false });
				projectStore.createIndex('createdAt', 'createdAt', { unique: false });
				projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
			}
		};
	});
}

/**
 * Get database connection
 */
async function getDB(): Promise<IDBDatabase> {
	return initDB();
}

/**
 * Save project to IndexedDB
 * Creates new project or updates existing one
 */
export async function saveProject(project: Project): Promise<void> {
	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
		const store = transaction.objectStore(PROJECTS_STORE);
		const request = store.put(project);

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(new Error(`Failed to save project: ${request.error?.message}`));
		};
	});
}

/**
 * Load project from IndexedDB
 */
export async function loadProject(projectId: string): Promise<Project | null> {
	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([PROJECTS_STORE], 'readonly');
		const store = transaction.objectStore(PROJECTS_STORE);
		const request = store.get(projectId);

		request.onsuccess = () => {
			resolve(request.result || null);
		};

		request.onerror = () => {
			reject(new Error(`Failed to load project: ${request.error?.message}`));
		};
	});
}

/**
 * Delete project from IndexedDB
 */
export async function deleteProject(projectId: string): Promise<void> {
	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
		const store = transaction.objectStore(PROJECTS_STORE);
		const request = store.delete(projectId);

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(new Error(`Failed to delete project: ${request.error?.message}`));
		};
	});
}

/**
 * Get all projects (full data)
 */
export async function getAllProjects(): Promise<Project[]> {
	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([PROJECTS_STORE], 'readonly');
		const store = transaction.objectStore(PROJECTS_STORE);
		const request = store.getAll();

		request.onsuccess = () => {
			resolve(request.result || []);
		};

		request.onerror = () => {
			reject(new Error(`Failed to get all projects: ${request.error?.message}`));
		};
	});
}

/**
 * Get all project metadata (lightweight, for listing)
 * Returns only metadata without full event history
 */
export async function getAllProjectMetadata(): Promise<ProjectMetadata[]> {
	const projects = await getAllProjects();

	return projects.map((project) => ({
		id: project.id,
		name: project.name,
		description: project.description,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
		eventCount: project.events.length,
		thumbnail: project.thumbnail,
		version: project.version
	}));
}

/**
 * Check if project exists
 */
export async function projectExists(projectId: string): Promise<boolean> {
	const project = await loadProject(projectId);
	return project !== null;
}

/**
 * Update project metadata (name, description)
 * Does not affect events
 */
export async function updateProjectMetadata(
	projectId: string,
	updates: { name?: string; description?: string }
): Promise<void> {
	const project = await loadProject(projectId);

	if (!project) {
		throw new Error(`Project not found: ${projectId}`);
	}

	const updatedProject: Project = {
		...project,
		...updates,
		updatedAt: Date.now()
	};

	await saveProject(updatedProject);
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
	projectCount: number;
	totalEvents: number;
	estimatedSize: number;
}> {
	const projects = await getAllProjects();

	const totalEvents = projects.reduce((sum, project) => sum + project.events.length, 0);

	// Rough estimation of storage size (not exact, but useful)
	const estimatedSize = new Blob([JSON.stringify(projects)]).size;

	return {
		projectCount: projects.length,
		totalEvents,
		estimatedSize
	};
}

/**
 * Clear all data (USE WITH CAUTION)
 * Deletes all projects from IndexedDB
 */
export async function clearAllData(): Promise<void> {
	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
		const store = transaction.objectStore(PROJECTS_STORE);
		const request = store.clear();

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(new Error(`Failed to clear data: ${request.error?.message}`));
		};
	});
}

/**
 * Export project as JSON
 * Useful for backup or sharing
 */
export async function exportProjectAsJSON(projectId: string): Promise<string> {
	const project = await loadProject(projectId);

	if (!project) {
		throw new Error(`Project not found: ${projectId}`);
	}

	return JSON.stringify(project, null, 2);
}

/**
 * Import project from JSON
 * Validates and imports a project
 */
export async function importProjectFromJSON(jsonString: string): Promise<string> {
	try {
		const project = JSON.parse(jsonString) as Project;

		// Basic validation
		if (!project.id || !project.name || !Array.isArray(project.events)) {
			throw new Error('Invalid project format');
		}

		// Update timestamps
		project.updatedAt = Date.now();

		await saveProject(project);

		return project.id;
	} catch (error) {
		throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}


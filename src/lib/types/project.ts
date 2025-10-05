/**
 * Project Type Definitions
 * Defines types for persisted projects in IndexedDB
 */

import type { DesignEvent } from './events';
import type { CanvasConfig } from './canvas';

/**
 * Persisted project structure
 * Stored in IndexedDB for local-first architecture
 */
export interface Project {
	id: string; // Unique project ID
	name: string; // User-defined project name
	description?: string; // Optional description
	events: DesignEvent[]; // Complete event history
	config: CanvasConfig; // Initial canvas configuration
	createdAt: number; // Unix timestamp (ms)
	updatedAt: number; // Unix timestamp (ms)
	thumbnail?: string; // Base64 encoded thumbnail image (future)
	version: string; // Schema version for migrations
}

/**
 * Project metadata (lightweight, for listing projects)
 */
export interface ProjectMetadata {
	id: string;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	eventCount: number; // Number of events in project
	thumbnail?: string;
	version: string;
}

/**
 * Project creation input
 */
export interface CreateProjectInput {
	name: string;
	description?: string;
	config?: CanvasConfig;
}

/**
 * Project update input
 */
export interface UpdateProjectInput {
	name?: string;
	description?: string;
}

/**
 * Current schema version
 * Increment when making breaking changes to support migrations
 */
export const CURRENT_PROJECT_VERSION = '1.0.0';

/**
 * IndexedDB configuration
 */
export const DB_NAME = 'baseline-db';
export const DB_VERSION = 1;
export const PROJECTS_STORE = 'projects';

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
	enabled: boolean;
	intervalMs: number; // Auto-save interval in milliseconds
	debounceMs: number; // Debounce time for rapid changes
}

/**
 * Default auto-save configuration
 */
export const DEFAULT_AUTOSAVE_CONFIG: AutoSaveConfig = {
	enabled: true,
	intervalMs: 30000, // Auto-save every 30 seconds
	debounceMs: 1000 // Wait 1 second after last change
};


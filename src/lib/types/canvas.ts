/**
 * Canvas Type Definitions
 * Defines the core types for the DOM-based canvas system with infinite canvas + artboards
 */

/**
 * Main canvas configuration (infinite viewport)
 */
export interface CanvasConfig {
	backgroundColor?: string; // Canvas background (not artboard)
	maxArtboards?: number; // Maximum artboards allowed (default: 10)
	showPerformanceWarning?: boolean; // Show warning when performance degrades
}

/**
 * Artboard (Frame/Page) - Fixed-size design area within infinite canvas
 */
export interface Artboard {
	id: string;
	name: string;
	x: number; // Position on infinite canvas
	y: number;
	width: number;
	height: number;
	backgroundColor: string;
	showGrid: boolean; // Per-artboard grid
	gridSize?: number; // Grid cell size in pixels (default: 20)
	gridColor?: string; // Grid line color
	isPublishTarget: boolean; // Mark for export/publish
}

/**
 * Element - Design element (box, text, image, etc.)
 */
export interface CanvasElement {
	id: string;
	type: 'box' | 'text' | 'image';
	artboardId: string | null; // null = loose element (outside artboards)
	x: number; // Position relative to artboard (or canvas if loose)
	y: number;
	width: number;
	height: number;
	rotation?: number;
	opacity?: number;
	// Baseline settings (per-element override)
	snapToBaseline?: boolean; // Override global baseline snap
	// Type-specific properties added later
}

/**
 * Complete canvas state
 */
export interface CanvasState {
	config: CanvasConfig;
	artboards: Artboard[];
	elements: CanvasElement[];
}

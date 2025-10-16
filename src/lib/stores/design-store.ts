/**
 * Design Store
 * Main state management for canvas design using event sourcing
 * 
 * This store:
 * - Derives current state from events
 * - Provides methods to dispatch design actions
 * - Automatically updates when events change (undo/redo)
 */

import { derived, get, type Readable } from 'svelte/store';
import type { CanvasState, Artboard, CanvasElement, CanvasConfig } from '$lib/types/canvas';
import type { DesignEvent } from '$lib/types/events';
import { currentEvents, addEvent } from './event-store';
import { applyEvents } from '$lib/utils/event-reducer';
import { nanoid } from 'nanoid';

/**
 * Initial canvas state (empty canvas)
 */
const initialState: CanvasState = {
	config: {
		backgroundColor: '#f0f0f0',
		maxArtboards: 10,
		showPerformanceWarning: true
	},
	artboards: [],
	elements: []
};

/**
 * Current canvas state derived from events
 * This automatically updates when events change (including undo/redo)
 */
export const canvasState: Readable<CanvasState> = derived(
	currentEvents,
	($events) => applyEvents(initialState, $events)
);

/**
 * Selection state (not part of canvas state, UI-only)
 */
import { writable } from 'svelte/store';
export const selectedElementIds = writable<string[]>([]);

/**
 * Helper to generate unique IDs
 */
function generateId(prefix: string): string {
	return `${prefix}-${nanoid(8)}`;
}

/**
 * Design Actions
 * These are the public API for modifying the canvas
 */

// ============================================================================
// Canvas Configuration Actions
// ============================================================================

export function updateCanvasConfig(config: Partial<CanvasConfig>): void {
	addEvent({
		type: 'CANVAS_CONFIG_UPDATED',
		config
	});
}

// ============================================================================
// Artboard Actions
// ============================================================================

export function addArtboard(artboard: Omit<Artboard, 'id'>): string {
	const id = generateId('artboard');
	const fullArtboard: Artboard = {
		...artboard,
		id
	};

	addEvent({
		type: 'ARTBOARD_ADDED',
		artboard: fullArtboard
	});

	return id;
}

export function updateArtboard(artboardId: string, changes: Partial<Artboard>): void {
	addEvent({
		type: 'ARTBOARD_UPDATED',
		artboardId,
		changes
	});
}

export function deleteArtboard(artboardId: string): void {
	addEvent({
		type: 'ARTBOARD_DELETED',
		artboardId
	});
}

export function moveArtboard(artboardId: string, x: number, y: number): void {
	addEvent({
		type: 'ARTBOARD_MOVED',
		artboardId,
		x,
		y
	});
}

export function resizeArtboard(artboardId: string, width: number, height: number): void {
	addEvent({
		type: 'ARTBOARD_RESIZED',
		artboardId,
		width,
		height
	});
}

// ============================================================================
// Element Actions
// ============================================================================

export function addElement(element: Omit<CanvasElement, 'id'>): string {
	const id = generateId('element');
	const fullElement: CanvasElement = {
		...element,
		id
	};

	addEvent({
		type: 'ELEMENT_ADDED',
		element: fullElement
	});

	return id;
}

export function updateElement(elementId: string, changes: Partial<CanvasElement>): void {
	addEvent({
		type: 'ELEMENT_UPDATED',
		elementId,
		changes
	});
}

export function deleteElement(elementId: string): void {
	addEvent({
		type: 'ELEMENT_DELETED',
		elementId
	});

	// Clear selection if deleted element was selected
	selectedElementIds.update((ids) => ids.filter((id) => id !== elementId));
}

export function moveElement(elementId: string, x: number, y: number): void {
	addEvent({
		type: 'ELEMENT_MOVED',
		elementId,
		x,
		y
	});
}

export function resizeElement(elementId: string, width: number, height: number): void {
	addEvent({
		type: 'ELEMENT_RESIZED',
		elementId,
		width,
		height
	});
}

export function moveElements(elementIds: string[], deltaX: number, deltaY: number): void {
	if (elementIds.length === 0) return;

	addEvent({
		type: 'ELEMENTS_MOVED',
		elementIds,
		deltaX,
		deltaY
	});
}

export function deleteElements(elementIds: string[]): void {
	if (elementIds.length === 0) return;

	addEvent({
		type: 'ELEMENTS_DELETED',
		elementIds
	});

	// Clear selection
	selectedElementIds.set([]);
}

// ============================================================================
// Selection Actions
// ============================================================================

export function selectElement(elementId: string, addToSelection = false): void {
	let newSelection: string[];

	if (addToSelection) {
		const current = get(selectedElementIds);
		if (current.includes(elementId)) {
			newSelection = current.filter((id) => id !== elementId);
		} else {
			newSelection = [...current, elementId];
		}
		selectedElementIds.set(newSelection);
	} else {
		newSelection = [elementId];
		selectedElementIds.set(newSelection);
	}

	// Track selection change in history for undo/redo
	addEvent({
		type: 'SELECTION_CHANGED',
		elementIds: newSelection
	} as any);
}

export function clearSelection(): void {
	selectedElementIds.set([]);
	
	addEvent({
		type: 'SELECTION_CHANGED',
		elementIds: []
	} as any);
}

export function selectMultiple(elementIds: string[]): void {
	selectedElementIds.set(elementIds);

	addEvent({
		type: 'SELECTION_CHANGED',
		elementIds
	} as any);
}

// ============================================================================
// Content Block Actions
// ============================================================================

export function insertBlock(
	blockId: string,
	blockName: string,
	blockContent: string,
	artboardId: string,
	x: number,
	y: number
): string[] {
	try {
		// Parse block content JSON
		const content = JSON.parse(blockContent);

		// Convert block content to canvas elements
		const elements: CanvasElement[] = [];

		// Handle different block structures
		if (Array.isArray(content)) {
			// Block contains multiple elements
			content.forEach((item, index) => {
				const elementId = generateId('element');
				elements.push({
					id: elementId,
					type: item.type || 'box',
					artboardId,
					x: x + (item.x || 0),
					y: y + (item.y || (index * 100)),
					width: item.width || 200,
					height: item.height || 100
				});
			});
		} else if (content.type) {
			// Single element block
			const elementId = generateId('element');
			elements.push({
				id: elementId,
				type: content.type || 'box',
				artboardId,
				x: x + (content.x || 0),
				y: y + (content.y || 0),
				width: content.width || 200,
				height: content.height || 100
			});
		} else {
			// Fallback: create a placeholder element
			const elementId = generateId('element');
			elements.push({
				id: elementId,
				type: 'box',
				artboardId,
				x,
				y,
				width: 200,
				height: 100
			});
		}

		// Dispatch block inserted event
		addEvent({
			type: 'BLOCK_INSERTED',
			blockId,
			blockName,
			artboardId,
			x,
			y,
			elements
		});

		// Increment usage count via API
		incrementBlockUsage(blockId).catch(console.error);

		return elements.map(el => el.id);
	} catch (error) {
		console.error('Failed to insert block:', error);
		return [];
	}
}

async function incrementBlockUsage(blockId: string): Promise<void> {
	const token = localStorage.getItem('access_token');
	if (!token) return;

	try {
		await fetch(`/api/content-blocks/${blockId}/increment`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` }
		});
	} catch (error) {
		console.error('Failed to increment block usage:', error);
	}
}


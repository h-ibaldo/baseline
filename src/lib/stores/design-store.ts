/**
 * Design Store - Svelte store wrapping the event sourcing system
 *
 * This is the main API for interacting with the design system.
 * It provides a reactive Svelte store and action dispatchers.
 */

import { writable, derived, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import type { DesignEvent, DesignState, Element, Page, Component } from '$lib/types/events';
import {
	initDB,
	appendEvent,
	getAllEvents,
	clearEvents,
	exportEvents,
	importEvents
} from './event-store';
import { reduceEvents, getInitialState } from './event-reducer';

// ============================================================================
// Store State
// ============================================================================

interface StoreState {
	designState: DesignState;
	events: DesignEvent[];
	currentEventIndex: number; // For undo/redo
	isInitialized: boolean;
	isSaving: boolean;
	lastSavedAt: number | null;
}

const initialStoreState: StoreState = {
	designState: getInitialState(),
	events: [],
	currentEventIndex: -1,
	isInitialized: false,
	isSaving: false,
	lastSavedAt: null
};

// ============================================================================
// Core Store
// ============================================================================

const storeState: Writable<StoreState> = writable(initialStoreState);

// Derived stores for convenience
export const designState: Readable<DesignState> = derived(
	storeState,
	($state) => $state.designState
);

export const currentPage: Readable<Page | null> = derived(designState, ($state) => {
	return $state.currentPageId ? $state.pages[$state.currentPageId] : null;
});

export const selectedElements: Readable<Element[]> = derived(designState, ($state) => {
	return $state.selectedElementIds.map((id) => $state.elements[id]).filter(Boolean);
});

export const canUndo: Readable<boolean> = derived(
	storeState,
	($state) => $state.currentEventIndex > -1
);

export const canRedo: Readable<boolean> = derived(
	storeState,
	($state) => $state.currentEventIndex < $state.events.length - 1
);

export const isInitialized: Readable<boolean> = derived(
	storeState,
	($state) => $state.isInitialized
);

export const isSaving: Readable<boolean> = derived(storeState, ($state) => $state.isSaving);

export const lastSavedAt: Readable<number | null> = derived(
	storeState,
	($state) => $state.lastSavedAt
);

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the store by loading events from IndexedDB
 */
export async function initialize(): Promise<void> {
	await initDB();
	const events = await getAllEvents();

	const designState = reduceEvents(events);

	storeState.update((state) => ({
		...state,
		events,
		designState,
		currentEventIndex: events.length - 1,
		isInitialized: true
	}));
}

/**
 * Reset the store to initial state (clear all events)
 */
export async function reset(): Promise<void> {
	await clearEvents();

	storeState.set({
		...initialStoreState,
		isInitialized: true
	});
}

// ============================================================================
// Event Dispatching
// ============================================================================

/**
 * Dispatch a new event and update the design state
 */
async function dispatch(event: DesignEvent): Promise<void> {
	const state = get(storeState);

	// If we're not at the end of the event log, remove future events (they're undone)
	let newEvents = state.events;
	if (state.currentEventIndex < state.events.length - 1) {
		newEvents = state.events.slice(0, state.currentEventIndex + 1);
	}

	// Add the new event
	newEvents = [...newEvents, event];

	// Recompute design state
	const newDesignState = reduceEvents(newEvents);

	// Update store
	storeState.update((s) => ({
		...s,
		events: newEvents,
		designState: newDesignState,
		currentEventIndex: newEvents.length - 1,
		isSaving: true
	}));

	// Persist to IndexedDB
	try {
		await appendEvent(event);
		storeState.update((s) => ({
			...s,
			isSaving: false,
			lastSavedAt: Date.now()
		}));
	} catch (error) {
		console.error('Failed to save event:', error);
		storeState.update((s) => ({
			...s,
			isSaving: false
		}));
		throw error;
	}
}

// ============================================================================
// Undo/Redo
// ============================================================================

/**
 * Undo the last event
 */
export function undo(): void {
	const state = get(storeState);

	if (state.currentEventIndex <= -1) {
		return; // Nothing to undo
	}

	const newEventIndex = state.currentEventIndex - 1;
	const eventsToApply = state.events.slice(0, newEventIndex + 1);
	const newDesignState = reduceEvents(eventsToApply);

	storeState.update((s) => ({
		...s,
		designState: newDesignState,
		currentEventIndex: newEventIndex
	}));
}

/**
 * Redo the next event
 */
export function redo(): void {
	const state = get(storeState);

	if (state.currentEventIndex >= state.events.length - 1) {
		return; // Nothing to redo
	}

	const newEventIndex = state.currentEventIndex + 1;
	const eventsToApply = state.events.slice(0, newEventIndex + 1);
	const newDesignState = reduceEvents(eventsToApply);

	storeState.update((s) => ({
		...s,
		designState: newDesignState,
		currentEventIndex: newEventIndex
	}));
}

// ============================================================================
// Page Actions
// ============================================================================

export async function createPage(name: string, slug?: string): Promise<string> {
	const pageId = uuidv4();

	await dispatch({
		id: uuidv4(),
		type: 'CREATE_PAGE',
		timestamp: Date.now(),
		payload: {
			pageId,
			name,
			slug
		}
	});

	return pageId;
}

export async function updatePage(
	pageId: string,
	changes: { name?: string; slug?: string; width?: number; height?: number }
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'UPDATE_PAGE',
		timestamp: Date.now(),
		payload: {
			pageId,
			changes
		}
	});
}

export async function deletePage(pageId: string): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'DELETE_PAGE',
		timestamp: Date.now(),
		payload: {
			pageId
		}
	});
}

export async function reorderPages(pageIds: string[]): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'REORDER_PAGES',
		timestamp: Date.now(),
		payload: {
			pageIds
		}
	});
}

export function setCurrentPage(pageId: string): void {
	storeState.update((state) => ({
		...state,
		designState: {
			...state.designState,
			currentPageId: pageId
		}
	}));
}

// ============================================================================
// Element Actions
// ============================================================================

export async function createElement(data: {
	parentId: string | null;
	pageId: string;
	elementType: Element['type'];
	position: { x: number; y: number };
	size: { width: number; height: number };
	styles?: Partial<Element['styles']>;
	content?: string;
}): Promise<string> {
	const elementId = uuidv4();

	await dispatch({
		id: uuidv4(),
		type: 'CREATE_ELEMENT',
		timestamp: Date.now(),
		payload: {
			elementId,
			...data
		}
	});

	return elementId;
}

export async function updateElement(
	elementId: string,
	changes: {
		content?: string;
		alt?: string;
		href?: string;
		src?: string;
	}
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'UPDATE_ELEMENT',
		timestamp: Date.now(),
		payload: {
			elementId,
			changes
		}
	});
}

export async function deleteElement(elementId: string): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'DELETE_ELEMENT',
		timestamp: Date.now(),
		payload: {
			elementId
		}
	});
}

export async function moveElement(
	elementId: string,
	position: { x: number; y: number },
	snapToBaseline = false
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'MOVE_ELEMENT',
		timestamp: Date.now(),
		payload: {
			elementId,
			position,
			snapToBaseline
		}
	});
}

export async function resizeElement(
	elementId: string,
	size: { width: number; height: number },
	position?: { x: number; y: number }
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'RESIZE_ELEMENT',
		timestamp: Date.now(),
		payload: {
			elementId,
			size,
			position
		}
	});
}

export async function reorderElement(
	elementId: string,
	newParentId: string | null,
	newIndex: number
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'REORDER_ELEMENT',
		timestamp: Date.now(),
		payload: {
			elementId,
			newParentId,
			newIndex
		}
	});
}

export async function updateElementStyles(
	elementId: string,
	styles: Partial<Element['styles']>
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'UPDATE_STYLES',
		timestamp: Date.now(),
		payload: {
			elementId,
			styles
		}
	});
}

export async function updateElementTypography(
	elementId: string,
	typography: Partial<Element['typography']>
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'UPDATE_TYPOGRAPHY',
		timestamp: Date.now(),
		payload: {
			elementId,
			typography
		}
	});
}

export async function updateElementSpacing(
	elementId: string,
	spacing: Partial<Element['spacing']>
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'UPDATE_SPACING',
		timestamp: Date.now(),
		payload: {
			elementId,
			spacing
		}
	});
}

// ============================================================================
// Selection
// ============================================================================

export function selectElement(elementId: string): void {
	storeState.update((state) => ({
		...state,
		designState: {
			...state.designState,
			selectedElementIds: [elementId]
		}
	}));
}

export function selectElements(elementIds: string[]): void {
	storeState.update((state) => ({
		...state,
		designState: {
			...state.designState,
			selectedElementIds: elementIds
		}
	}));
}

export function addToSelection(elementId: string): void {
	storeState.update((state) => ({
		...state,
		designState: {
			...state.designState,
			selectedElementIds: [...state.designState.selectedElementIds, elementId]
		}
	}));
}

export function removeFromSelection(elementId: string): void {
	storeState.update((state) => ({
		...state,
		designState: {
			...state.designState,
			selectedElementIds: state.designState.selectedElementIds.filter((id) => id !== elementId)
		}
	}));
}

export function clearSelection(): void {
	storeState.update((state) => ({
		...state,
		designState: {
			...state.designState,
			selectedElementIds: []
		}
	}));
}

// ============================================================================
// Component Actions
// ============================================================================

export async function createComponent(name: string, elementIds: string[]): Promise<string> {
	const componentId = uuidv4();

	await dispatch({
		id: uuidv4(),
		type: 'CREATE_COMPONENT',
		timestamp: Date.now(),
		payload: {
			componentId,
			name,
			elementIds
		}
	});

	return componentId;
}

export async function updateComponent(
	componentId: string,
	changes: { name?: string }
): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'UPDATE_COMPONENT',
		timestamp: Date.now(),
		payload: {
			componentId,
			changes
		}
	});
}

export async function deleteComponent(componentId: string): Promise<void> {
	await dispatch({
		id: uuidv4(),
		type: 'DELETE_COMPONENT',
		timestamp: Date.now(),
		payload: {
			componentId
		}
	});
}

export async function instanceComponent(
	componentId: string,
	pageId: string,
	position: { x: number; y: number }
): Promise<string> {
	const instanceId = uuidv4();

	await dispatch({
		id: uuidv4(),
		type: 'INSTANCE_COMPONENT',
		timestamp: Date.now(),
		payload: {
			componentId,
			instanceId,
			pageId,
			position
		}
	});

	return instanceId;
}

// ============================================================================
// Import/Export
// ============================================================================

export async function exportDesign(): Promise<string> {
	return await exportEvents();
}

export async function importDesign(json: string): Promise<void> {
	await importEvents(json);
	await initialize();
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

/**
 * Setup keyboard shortcuts for undo/redo
 * Call this in your root layout
 */
export function setupKeyboardShortcuts(): (() => void) | undefined {
	if (typeof window === 'undefined') return;

	const handleKeyDown = (e: KeyboardEvent) => {
		// Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
		if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			undo();
		}
		// Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows/Linux)
		else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
			e.preventDefault();
			redo();
		}
		// Cmd+Y (alternative redo)
		else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
			e.preventDefault();
			redo();
		}
		// Delete or Backspace - delete selected elements
		else if (e.key === 'Delete' || e.key === 'Backspace') {
			// Don't delete if user is typing in an input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

			e.preventDefault();
			const selected = get(selectedElements);
			if (selected.length > 0) {
				// Delete all selected elements
				selected.forEach((element) => {
					deleteElement(element.id);
				});
			}
		}
	};

	window.addEventListener('keydown', handleKeyDown);

	// Cleanup function
	return () => {
		window.removeEventListener('keydown', handleKeyDown);
	};
}

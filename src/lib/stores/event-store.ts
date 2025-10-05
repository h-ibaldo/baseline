/**
 * Event Store
 * Manages the event history for the canvas design system
 * 
 * This store maintains:
 * - All design events in chronological order
 * - Current position in history (for undo/redo)
 * - Methods to add events and navigate history
 */

import { writable, derived, get } from 'svelte/store';
import type { DesignEvent, EventHistory } from '$lib/types/events';
import { nanoid } from 'nanoid';

/**
 * Initial event history state
 */
const initialHistory: EventHistory = {
	events: [],
	currentIndex: -1 // -1 means no events yet
};

/**
 * Event history store
 * Contains all events and current position
 */
export const eventHistory = writable<EventHistory>(initialHistory);

/**
 * Helper to generate unique event ID
 */
function generateEventId(): string {
	return nanoid();
}

/**
 * Add a new event to history
 * If we're in the middle of history (after undo), this will truncate future events
 * 
 * @param event - Event to add (without id and timestamp)
 */
export function addEvent(event: Omit<DesignEvent, 'id' | 'timestamp'> & { type: DesignEvent['type'] }): void {
	eventHistory.update((history) => {
		const newEvent: DesignEvent = {
			...event,
			id: generateEventId(),
			timestamp: Date.now()
		} as DesignEvent;

		// If we're in the middle of history, truncate future events
		const newEvents =
			history.currentIndex < history.events.length - 1
				? [...history.events.slice(0, history.currentIndex + 1), newEvent]
				: [...history.events, newEvent];

		return {
			events: newEvents,
			currentIndex: newEvents.length - 1
		};
	});
}

/**
 * Undo - move back one event in history
 * @returns true if undo was successful, false if at beginning
 */
export function undo(): boolean {
	const history = get(eventHistory);
	
	if (history.currentIndex <= -1) {
		return false; // Nothing to undo
	}

	eventHistory.update((h) => ({
		...h,
		currentIndex: h.currentIndex - 1
	}));

	return true;
}

/**
 * Redo - move forward one event in history
 * @returns true if redo was successful, false if at end
 */
export function redo(): boolean {
	const history = get(eventHistory);
	
	if (history.currentIndex >= history.events.length - 1) {
		return false; // Nothing to redo
	}

	eventHistory.update((h) => ({
		...h,
		currentIndex: h.currentIndex + 1
	}));

	return true;
}

/**
 * Check if undo is available
 */
export const canUndo = derived(
	eventHistory,
	($history) => $history.currentIndex > -1
);

/**
 * Check if redo is available
 */
export const canRedo = derived(
	eventHistory,
	($history) => $history.currentIndex < $history.events.length - 1
);

/**
 * Get current events (up to currentIndex)
 * This is what should be used to derive the current state
 */
export const currentEvents = derived(
	eventHistory,
	($history) => $history.events.slice(0, $history.currentIndex + 1)
);

/**
 * Clear all history
 * USE WITH CAUTION - this is destructive
 */
export function clearHistory(): void {
	eventHistory.set(initialHistory);
}

/**
 * Get history statistics (useful for debugging)
 */
export const historyStats = derived(eventHistory, ($history) => ({
	totalEvents: $history.events.length,
	currentIndex: $history.currentIndex,
	canUndo: $history.currentIndex > -1,
	canRedo: $history.currentIndex < $history.events.length - 1,
	undoSteps: $history.currentIndex + 1,
	redoSteps: $history.events.length - $history.currentIndex - 1
}));


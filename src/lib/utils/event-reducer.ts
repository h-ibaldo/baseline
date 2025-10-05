/**
 * Event Reducer
 * Applies events to derive the current canvas state
 * 
 * This is the core of event sourcing:
 * currentState = events.reduce(applyEvent, initialState)
 */

import type { CanvasState } from '$lib/types/canvas';
import type { DesignEvent } from '$lib/types/events';

/**
 * Apply a single event to the current state
 * Pure function - does not mutate state
 * 
 * @param state - Current state
 * @param event - Event to apply
 * @returns New state after applying event
 */
export function applyEvent(state: CanvasState, event: DesignEvent): CanvasState {
	switch (event.type) {
		case 'CANVAS_CONFIG_UPDATED':
			return {
				...state,
				config: {
					...state.config,
					...event.config
				}
			};

		case 'ARTBOARD_ADDED':
			return {
				...state,
				artboards: [...state.artboards, event.artboard]
			};

		case 'ARTBOARD_UPDATED':
			return {
				...state,
				artboards: state.artboards.map((artboard) =>
					artboard.id === event.artboardId
						? { ...artboard, ...event.changes }
						: artboard
				)
			};

		case 'ARTBOARD_DELETED':
			return {
				...state,
				artboards: state.artboards.filter((artboard) => artboard.id !== event.artboardId),
				// Also remove elements on the deleted artboard
				elements: state.elements.filter((element) => element.artboardId !== event.artboardId)
			};

		case 'ARTBOARD_MOVED':
			return {
				...state,
				artboards: state.artboards.map((artboard) =>
					artboard.id === event.artboardId
						? { ...artboard, x: event.x, y: event.y }
						: artboard
				)
			};

		case 'ARTBOARD_RESIZED':
			return {
				...state,
				artboards: state.artboards.map((artboard) =>
					artboard.id === event.artboardId
						? { ...artboard, width: event.width, height: event.height }
						: artboard
				)
			};

		case 'ELEMENT_ADDED':
			return {
				...state,
				elements: [...state.elements, event.element]
			};

		case 'ELEMENT_UPDATED':
			return {
				...state,
				elements: state.elements.map((element) =>
					element.id === event.elementId ? { ...element, ...event.changes } : element
				)
			};

		case 'ELEMENT_DELETED':
			return {
				...state,
				elements: state.elements.filter((element) => element.id !== event.elementId)
			};

		case 'ELEMENT_MOVED':
			return {
				...state,
				elements: state.elements.map((element) =>
					element.id === event.elementId
						? { ...element, x: event.x, y: event.y }
						: element
				)
			};

		case 'ELEMENT_RESIZED':
			return {
				...state,
				elements: state.elements.map((element) =>
					element.id === event.elementId
						? { ...element, width: event.width, height: event.height }
						: element
				)
			};

		case 'ELEMENTS_MOVED':
			return {
				...state,
				elements: state.elements.map((element) =>
					event.elementIds.includes(element.id)
						? { ...element, x: element.x + event.deltaX, y: element.y + event.deltaY }
						: element
				)
			};

		case 'ELEMENTS_DELETED':
			return {
				...state,
				elements: state.elements.filter((element) => !event.elementIds.includes(element.id))
			};

		case 'SELECTION_CHANGED':
			// Selection is UI state, not persisted in canvas state
			// This event is tracked for history but doesn't modify state
			return state;

		default:
			// TypeScript exhaustiveness check
			const _exhaustive: never = event;
			return state;
	}
}

/**
 * Apply multiple events to derive state
 * 
 * @param initialState - Starting state
 * @param events - Array of events to apply
 * @returns Final state after applying all events
 */
export function applyEvents(initialState: CanvasState, events: DesignEvent[]): CanvasState {
	return events.reduce(applyEvent, initialState);
}

/**
 * Replay events up to a specific index (for undo/redo)
 * 
 * @param initialState - Starting state
 * @param events - All events in history
 * @param endIndex - Index to replay up to (inclusive)
 * @returns State at the specified point in history
 */
export function replayEvents(
	initialState: CanvasState,
	events: DesignEvent[],
	endIndex: number
): CanvasState {
	const eventsToReplay = events.slice(0, endIndex + 1);
	return applyEvents(initialState, eventsToReplay);
}


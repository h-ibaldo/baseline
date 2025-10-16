/**
 * Event Sourcing Type Definitions
 * Defines all event types for the design canvas state management system
 * 
 * Event Sourcing allows:
 * - Perfect undo/redo functionality
 * - Time-travel debugging
 * - Complete history of design changes
 * - Easy sync across devices (future)
 */

import type { Artboard, CanvasElement, CanvasConfig } from './canvas';

/**
 * Base event structure
 * All events extend this base type
 */
export interface BaseEvent {
	id: string; // Unique event ID
	timestamp: number; // Unix timestamp in milliseconds
	type: string; // Event type discriminator
}

/**
 * Canvas Configuration Events
 */
export interface CanvasConfigUpdatedEvent extends BaseEvent {
	type: 'CANVAS_CONFIG_UPDATED';
	config: Partial<CanvasConfig>;
}

/**
 * Artboard Events
 */
export interface ArtboardAddedEvent extends BaseEvent {
	type: 'ARTBOARD_ADDED';
	artboard: Artboard;
}

export interface ArtboardUpdatedEvent extends BaseEvent {
	type: 'ARTBOARD_UPDATED';
	artboardId: string;
	changes: Partial<Artboard>;
}

export interface ArtboardDeletedEvent extends BaseEvent {
	type: 'ARTBOARD_DELETED';
	artboardId: string;
}

export interface ArtboardMovedEvent extends BaseEvent {
	type: 'ARTBOARD_MOVED';
	artboardId: string;
	x: number;
	y: number;
}

export interface ArtboardResizedEvent extends BaseEvent {
	type: 'ARTBOARD_RESIZED';
	artboardId: string;
	width: number;
	height: number;
}

/**
 * Element Events
 */
export interface ElementAddedEvent extends BaseEvent {
	type: 'ELEMENT_ADDED';
	element: CanvasElement;
}

export interface ElementUpdatedEvent extends BaseEvent {
	type: 'ELEMENT_UPDATED';
	elementId: string;
	changes: Partial<CanvasElement>;
}

export interface ElementDeletedEvent extends BaseEvent {
	type: 'ELEMENT_DELETED';
	elementId: string;
}

export interface ElementMovedEvent extends BaseEvent {
	type: 'ELEMENT_MOVED';
	elementId: string;
	x: number;
	y: number;
}

export interface ElementResizedEvent extends BaseEvent {
	type: 'ELEMENT_RESIZED';
	elementId: string;
	width: number;
	height: number;
}

export interface ElementsMovedEvent extends BaseEvent {
	type: 'ELEMENTS_MOVED';
	elementIds: string[];
	deltaX: number;
	deltaY: number;
}

export interface ElementsDeletedEvent extends BaseEvent {
	type: 'ELEMENTS_DELETED';
	elementIds: string[];
}

/**
 * Selection Events (for history tracking)
 */
export interface SelectionChangedEvent extends BaseEvent {
	type: 'SELECTION_CHANGED';
	elementIds: string[];
}

/**
 * Content Block Events
 */
export interface BlockInsertedEvent extends BaseEvent {
	type: 'BLOCK_INSERTED';
	blockId: string;
	blockName: string;
	artboardId: string;
	x: number;
	y: number;
	elements: CanvasElement[];
}

/**
 * Union type of all possible events
 * This is what gets stored in the event history
 */
export type DesignEvent =
	| CanvasConfigUpdatedEvent
	| ArtboardAddedEvent
	| ArtboardUpdatedEvent
	| ArtboardDeletedEvent
	| ArtboardMovedEvent
	| ArtboardResizedEvent
	| ElementAddedEvent
	| ElementUpdatedEvent
	| ElementDeletedEvent
	| ElementMovedEvent
	| ElementResizedEvent
	| ElementsMovedEvent
	| ElementsDeletedEvent
	| SelectionChangedEvent
	| BlockInsertedEvent;

/**
 * Event history state
 */
export interface EventHistory {
	events: DesignEvent[]; // All events in chronological order
	currentIndex: number; // Current position in history (for undo/redo)
}

/**
 * Helper type to extract event payload by type
 */
export type EventPayload<T extends DesignEvent['type']> = Extract<
	DesignEvent,
	{ type: T }
>;


/**
 * Event Store Tests
 * Tests for event history management and undo/redo
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	eventHistory,
	addEvent,
	undo,
	redo,
	clearHistory,
	canUndo,
	canRedo,
	currentEvents,
	historyStats
} from './event-store';
import type { DesignEvent } from '$lib/types/events';

// Reset history before each test
beforeEach(() => {
	clearHistory();
});

describe('Event Store - Basic Operations', () => {
	it('should start with empty history', () => {
		const history = get(eventHistory);
		expect(history.events).toHaveLength(0);
		expect(history.currentIndex).toBe(-1);
	});

	it('should add event to history', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		const history = get(eventHistory);
		expect(history.events).toHaveLength(1);
		expect(history.currentIndex).toBe(0);
		expect(history.events[0].type).toBe('ELEMENT_ADDED');
		expect(history.events[0].id).toBeDefined();
		expect(history.events[0].timestamp).toBeDefined();
	});

	it('should add multiple events', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		const history = get(eventHistory);
		expect(history.events).toHaveLength(2);
		expect(history.currentIndex).toBe(1);
	});
});

describe('Event Store - Undo/Redo', () => {
	it('should undo last event', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		const undoSuccess = undo();

		expect(undoSuccess).toBe(true);
		const history = get(eventHistory);
		expect(history.currentIndex).toBe(0);
		expect(history.events).toHaveLength(2); // Events still there
	});

	it('should not undo beyond beginning', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		undo(); // Back to -1
		const undoSuccess = undo(); // Try to undo past beginning

		expect(undoSuccess).toBe(false);
		const history = get(eventHistory);
		expect(history.currentIndex).toBe(-1);
	});

	it('should redo undone event', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		undo(); // currentIndex = 0
		const redoSuccess = redo(); // currentIndex = 1

		expect(redoSuccess).toBe(true);
		const history = get(eventHistory);
		expect(history.currentIndex).toBe(1);
	});

	it('should not redo beyond end', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		const redoSuccess = redo(); // Already at end

		expect(redoSuccess).toBe(false);
		const history = get(eventHistory);
		expect(history.currentIndex).toBe(0);
	});

	it('should truncate history when adding event after undo', () => {
		// Add 3 events
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 100,
			y: 100
		} as any);

		// Undo twice (currentIndex = 0)
		undo();
		undo();

		// Add new event - should truncate future history
		addEvent({
			type: 'ELEMENT_DELETED',
			elementId: 'element-1'
		} as any);

		const history = get(eventHistory);
		expect(history.events).toHaveLength(2); // First event + new event
		expect(history.currentIndex).toBe(1);
		expect(history.events[1].type).toBe('ELEMENT_DELETED');
	});
});

describe('Event Store - Derived Stores', () => {
	it('should indicate when undo is available', () => {
		expect(get(canUndo)).toBe(false);

		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		expect(get(canUndo)).toBe(true);

		undo();
		expect(get(canUndo)).toBe(false);
	});

	it('should indicate when redo is available', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		expect(get(canRedo)).toBe(false);

		undo();
		expect(get(canRedo)).toBe(true);

		redo();
		expect(get(canRedo)).toBe(false);
	});

	it('should provide current events up to index', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 100,
			y: 100
		} as any);

		let events = get(currentEvents);
		expect(events).toHaveLength(3);

		undo(); // currentIndex = 1
		events = get(currentEvents);
		expect(events).toHaveLength(2);

		undo(); // currentIndex = 0
		events = get(currentEvents);
		expect(events).toHaveLength(1);

		undo(); // currentIndex = -1
		events = get(currentEvents);
		expect(events).toHaveLength(0);
	});

	it('should provide accurate history stats', () => {
		let stats = get(historyStats);
		expect(stats.totalEvents).toBe(0);
		expect(stats.currentIndex).toBe(-1);
		expect(stats.canUndo).toBe(false);
		expect(stats.canRedo).toBe(false);
		expect(stats.undoSteps).toBe(0);
		expect(stats.redoSteps).toBe(0);

		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		stats = get(historyStats);
		expect(stats.totalEvents).toBe(2);
		expect(stats.currentIndex).toBe(1);
		expect(stats.canUndo).toBe(true);
		expect(stats.canRedo).toBe(false);
		expect(stats.undoSteps).toBe(2);
		expect(stats.redoSteps).toBe(0);

		undo();
		stats = get(historyStats);
		expect(stats.currentIndex).toBe(0);
		expect(stats.canUndo).toBe(true);
		expect(stats.canRedo).toBe(true);
		expect(stats.undoSteps).toBe(1);
		expect(stats.redoSteps).toBe(1);
	});
});

describe('Event Store - Clear History', () => {
	it('should clear all history', () => {
		addEvent({
			type: 'ELEMENT_ADDED',
			element: {
				id: 'element-1',
				type: 'box',
				artboardId: 'artboard-1',
				x: 0,
				y: 0,
				width: 100,
				height: 100
			}
		} as any);

		addEvent({
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 50,
			y: 50
		} as any);

		clearHistory();

		const history = get(eventHistory);
		expect(history.events).toHaveLength(0);
		expect(history.currentIndex).toBe(-1);
	});
});


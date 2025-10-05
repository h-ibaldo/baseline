/**
 * Event Reducer Tests
 * Tests for the event sourcing reducer/applier
 */

import { describe, it, expect } from 'vitest';
import { applyEvent, applyEvents, replayEvents } from './event-reducer';
import type { CanvasState } from '$lib/types/canvas';
import type { DesignEvent } from '$lib/types/events';

// Helper to create initial state
function createInitialState(): CanvasState {
	return {
		config: {
			backgroundColor: '#f0f0f0',
			maxArtboards: 10,
			showPerformanceWarning: true
		},
		artboards: [],
		elements: []
	};
}

// Helper to create test artboard
function createTestArtboard(id = 'artboard-1') {
	return {
		id,
		name: 'Test Artboard',
		x: 100,
		y: 100,
		width: 800,
		height: 600,
		backgroundColor: '#ffffff',
		showGrid: true,
		gridSize: 20,
		isPublishTarget: true
	};
}

// Helper to create test element
function createTestElement(id = 'element-1', artboardId = 'artboard-1') {
	return {
		id,
		type: 'box' as const,
		artboardId,
		x: 50,
		y: 50,
		width: 100,
		height: 100,
		rotation: 0,
		opacity: 1
	};
}

describe('Event Reducer - Canvas Config', () => {
	it('should update canvas config', () => {
		const state = createInitialState();
		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'CANVAS_CONFIG_UPDATED',
			config: { backgroundColor: '#000000' }
		};

		const newState = applyEvent(state, event);

		expect(newState.config.backgroundColor).toBe('#000000');
		expect(newState.config.maxArtboards).toBe(10); // Unchanged
	});
});

describe('Event Reducer - Artboards', () => {
	it('should add artboard', () => {
		const state = createInitialState();
		const artboard = createTestArtboard();
		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ARTBOARD_ADDED',
			artboard
		};

		const newState = applyEvent(state, event);

		expect(newState.artboards).toHaveLength(1);
		expect(newState.artboards[0]).toEqual(artboard);
	});

	it('should update artboard', () => {
		const artboard = createTestArtboard();
		const state: CanvasState = {
			...createInitialState(),
			artboards: [artboard]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ARTBOARD_UPDATED',
			artboardId: 'artboard-1',
			changes: { name: 'Updated Name', backgroundColor: '#ff0000' }
		};

		const newState = applyEvent(state, event);

		expect(newState.artboards[0].name).toBe('Updated Name');
		expect(newState.artboards[0].backgroundColor).toBe('#ff0000');
		expect(newState.artboards[0].width).toBe(800); // Unchanged
	});

	it('should delete artboard', () => {
		const artboard = createTestArtboard();
		const state: CanvasState = {
			...createInitialState(),
			artboards: [artboard]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ARTBOARD_DELETED',
			artboardId: 'artboard-1'
		};

		const newState = applyEvent(state, event);

		expect(newState.artboards).toHaveLength(0);
	});

	it('should delete artboard and its elements', () => {
		const artboard = createTestArtboard();
		const element = createTestElement('element-1', 'artboard-1');
		const state: CanvasState = {
			...createInitialState(),
			artboards: [artboard],
			elements: [element]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ARTBOARD_DELETED',
			artboardId: 'artboard-1'
		};

		const newState = applyEvent(state, event);

		expect(newState.artboards).toHaveLength(0);
		expect(newState.elements).toHaveLength(0); // Elements deleted too
	});

	it('should move artboard', () => {
		const artboard = createTestArtboard();
		const state: CanvasState = {
			...createInitialState(),
			artboards: [artboard]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ARTBOARD_MOVED',
			artboardId: 'artboard-1',
			x: 200,
			y: 300
		};

		const newState = applyEvent(state, event);

		expect(newState.artboards[0].x).toBe(200);
		expect(newState.artboards[0].y).toBe(300);
	});

	it('should resize artboard', () => {
		const artboard = createTestArtboard();
		const state: CanvasState = {
			...createInitialState(),
			artboards: [artboard]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ARTBOARD_RESIZED',
			artboardId: 'artboard-1',
			width: 1200,
			height: 900
		};

		const newState = applyEvent(state, event);

		expect(newState.artboards[0].width).toBe(1200);
		expect(newState.artboards[0].height).toBe(900);
	});
});

describe('Event Reducer - Elements', () => {
	it('should add element', () => {
		const state = createInitialState();
		const element = createTestElement();
		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENT_ADDED',
			element
		};

		const newState = applyEvent(state, event);

		expect(newState.elements).toHaveLength(1);
		expect(newState.elements[0]).toEqual(element);
	});

	it('should update element', () => {
		const element = createTestElement();
		const state: CanvasState = {
			...createInitialState(),
			elements: [element]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENT_UPDATED',
			elementId: 'element-1',
			changes: { opacity: 0.5, rotation: 45 }
		};

		const newState = applyEvent(state, event);

		expect(newState.elements[0].opacity).toBe(0.5);
		expect(newState.elements[0].rotation).toBe(45);
		expect(newState.elements[0].width).toBe(100); // Unchanged
	});

	it('should delete element', () => {
		const element = createTestElement();
		const state: CanvasState = {
			...createInitialState(),
			elements: [element]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENT_DELETED',
			elementId: 'element-1'
		};

		const newState = applyEvent(state, event);

		expect(newState.elements).toHaveLength(0);
	});

	it('should move element', () => {
		const element = createTestElement();
		const state: CanvasState = {
			...createInitialState(),
			elements: [element]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENT_MOVED',
			elementId: 'element-1',
			x: 150,
			y: 200
		};

		const newState = applyEvent(state, event);

		expect(newState.elements[0].x).toBe(150);
		expect(newState.elements[0].y).toBe(200);
	});

	it('should resize element', () => {
		const element = createTestElement();
		const state: CanvasState = {
			...createInitialState(),
			elements: [element]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENT_RESIZED',
			elementId: 'element-1',
			width: 200,
			height: 150
		};

		const newState = applyEvent(state, event);

		expect(newState.elements[0].width).toBe(200);
		expect(newState.elements[0].height).toBe(150);
	});

	it('should move multiple elements', () => {
		const element1 = createTestElement('element-1');
		const element2 = createTestElement('element-2');
		const state: CanvasState = {
			...createInitialState(),
			elements: [element1, element2]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENTS_MOVED',
			elementIds: ['element-1', 'element-2'],
			deltaX: 50,
			deltaY: 100
		};

		const newState = applyEvent(state, event);

		expect(newState.elements[0].x).toBe(100); // 50 + 50
		expect(newState.elements[0].y).toBe(150); // 50 + 100
		expect(newState.elements[1].x).toBe(100);
		expect(newState.elements[1].y).toBe(150);
	});

	it('should delete multiple elements', () => {
		const element1 = createTestElement('element-1');
		const element2 = createTestElement('element-2');
		const element3 = createTestElement('element-3');
		const state: CanvasState = {
			...createInitialState(),
			elements: [element1, element2, element3]
		};

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'ELEMENTS_DELETED',
			elementIds: ['element-1', 'element-3']
		};

		const newState = applyEvent(state, event);

		expect(newState.elements).toHaveLength(1);
		expect(newState.elements[0].id).toBe('element-2');
	});
});

describe('Event Reducer - Multiple Events', () => {
	it('should apply multiple events in sequence', () => {
		const initialState = createInitialState();
		const artboard = createTestArtboard();
		const element = createTestElement();

		const events: DesignEvent[] = [
			{
				id: 'evt-1',
				timestamp: Date.now(),
				type: 'ARTBOARD_ADDED',
				artboard
			},
			{
				id: 'evt-2',
				timestamp: Date.now(),
				type: 'ELEMENT_ADDED',
				element
			},
			{
				id: 'evt-3',
				timestamp: Date.now(),
				type: 'ELEMENT_MOVED',
				elementId: 'element-1',
				x: 200,
				y: 200
			}
		];

		const finalState = applyEvents(initialState, events);

		expect(finalState.artboards).toHaveLength(1);
		expect(finalState.elements).toHaveLength(1);
		expect(finalState.elements[0].x).toBe(200);
		expect(finalState.elements[0].y).toBe(200);
	});

	it('should replay events up to specific index', () => {
		const initialState = createInitialState();
		const element = createTestElement();

		const events: DesignEvent[] = [
			{
				id: 'evt-1',
				timestamp: Date.now(),
				type: 'ELEMENT_ADDED',
				element
			},
			{
				id: 'evt-2',
				timestamp: Date.now(),
				type: 'ELEMENT_MOVED',
				elementId: 'element-1',
				x: 100,
				y: 100
			},
			{
				id: 'evt-3',
				timestamp: Date.now(),
				type: 'ELEMENT_MOVED',
				elementId: 'element-1',
				x: 200,
				y: 200
			}
		];

		// Replay only first two events
		const state = replayEvents(initialState, events, 1);

		expect(state.elements).toHaveLength(1);
		expect(state.elements[0].x).toBe(100);
		expect(state.elements[0].y).toBe(100);
	});
});

describe('Event Reducer - Immutability', () => {
	it('should not mutate original state', () => {
		const state = createInitialState();
		const originalArtboards = state.artboards;
		const originalElements = state.elements;
		const originalConfig = state.config;

		const event: DesignEvent = {
			id: 'evt-1',
			timestamp: Date.now(),
			type: 'CANVAS_CONFIG_UPDATED',
			config: { backgroundColor: '#000000' }
		};

		applyEvent(state, event);

		// Original state should be unchanged
		expect(state.artboards).toBe(originalArtboards);
		expect(state.elements).toBe(originalElements);
		expect(state.config).toBe(originalConfig);
		expect(state.config.backgroundColor).toBe('#f0f0f0');
	});
});


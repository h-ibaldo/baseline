/**
 * Interaction Store - Tracks active drag/resize state
 *
 * This store allows SelectionOverlay to broadcast pending transforms
 * so CanvasElement can show live preview during interaction
 */

import { writable } from 'svelte/store';

export interface InteractionState {
	activeElementId: string | null;
	mode: 'idle' | 'dragging' | 'resizing';
	pendingPosition: { x: number; y: number } | null;
	pendingSize: { width: number; height: number } | null;
}

const initialState: InteractionState = {
	activeElementId: null,
	mode: 'idle',
	pendingPosition: null,
	pendingSize: null
};

export const interactionState = writable<InteractionState>(initialState);

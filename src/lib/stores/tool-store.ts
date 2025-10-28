/**
 * Tool Store - Manages the currently selected tool
 *
 * Tools:
 * - move: Select and move elements (default)
 * - hand: Pan around canvas
 * - scale: Resize elements
 * - div: Draw div container
 * - text: Draw text element
 * - media: Draw media (image/video)
 */

import { writable } from 'svelte/store';

export type Tool = 'move' | 'hand' | 'scale' | 'div' | 'text' | 'media';

// Current selected tool
export const currentTool = writable<Tool>('move');

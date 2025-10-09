/**
 * Baseline Grid Store
 * Global state management for baseline grid configuration
 */

import { writable } from 'svelte/store';
import type { BaselineConfig } from '$lib/types/baseline';

/**
 * Default baseline configuration
 */
const defaultConfig: BaselineConfig = {
	enabled: false, // Start disabled, user can enable
	height: 8, // 8px baseline (common for web)
	color: '#0066ff',
	opacity: 0.15,
	showGrid: false
};

/**
 * Global baseline configuration store
 */
export const baselineConfig = writable<BaselineConfig>(defaultConfig);

/**
 * Helper to update baseline height
 */
export function setBaselineHeight(height: number) {
	baselineConfig.update(config => ({ ...config, height }));
}

/**
 * Helper to toggle baseline snap
 */
export function toggleBaselineSnap() {
	baselineConfig.update(config => ({ ...config, enabled: !config.enabled }));
}

/**
 * Helper to toggle grid visibility
 */
export function toggleBaselineGrid() {
	baselineConfig.update(config => ({ ...config, showGrid: !config.showGrid }));
}

/**
 * Helper to update grid appearance
 */
export function updateBaselineAppearance(color: string, opacity: number) {
	baselineConfig.update(config => ({ ...config, color, opacity }));
}

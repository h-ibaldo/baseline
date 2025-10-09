/**
 * Baseline Grid Calculation Engine
 * Handles all mathematical operations for baseline grid snapping and alignment
 */

import type { BaselineConfig, SnapResult } from '$lib/types/baseline';

/**
 * Snap a value to the nearest baseline grid line
 * @param value - The value to snap (e.g., y position or height)
 * @param baselineHeight - The baseline grid height
 * @returns Snapped value
 */
export function snapToBaseline(value: number, baselineHeight: number): number {
	return Math.round(value / baselineHeight) * baselineHeight;
}

/**
 * Snap a value to baseline with detailed metadata
 * @param value - The value to snap
 * @param config - Baseline configuration
 * @returns SnapResult with snapped value and metadata
 */
export function snapToBaselineDetailed(
	value: number,
	config: BaselineConfig
): SnapResult {
	if (!config.enabled) {
		return {
			snappedValue: value,
			originalValue: value,
			linesFromOrigin: 0,
			wasSnapped: false
		};
	}

	const snappedValue = snapToBaseline(value, config.height);
	const linesFromOrigin = Math.round(snappedValue / config.height);

	return {
		snappedValue,
		originalValue: value,
		linesFromOrigin,
		wasSnapped: snappedValue !== value
	};
}

/**
 * Convert a pixel value to baseline units (fractions)
 * @param pixels - Pixel value
 * @param baselineHeight - Baseline grid height
 * @returns Number of baseline units (e.g., 2.5 means 2.5 baseline heights)
 */
export function pixelsToBaselineUnits(pixels: number, baselineHeight: number): number {
	return pixels / baselineHeight;
}

/**
 * Convert baseline units to pixels
 * @param units - Baseline units
 * @param baselineHeight - Baseline grid height
 * @returns Pixel value
 */
export function baselineUnitsToPixels(units: number, baselineHeight: number): number {
	return units * baselineHeight;
}

/**
 * Check if a value is aligned to baseline
 * @param value - Value to check
 * @param baselineHeight - Baseline grid height
 * @param tolerance - Tolerance in pixels (default: 0.5)
 * @returns True if aligned within tolerance
 */
export function isAlignedToBaseline(
	value: number,
	baselineHeight: number,
	tolerance = 0.5
): boolean {
	const remainder = value % baselineHeight;
	return remainder < tolerance || remainder > baselineHeight - tolerance;
}

/**
 * Get the nearest baseline grid lines (above and below)
 * @param value - Value to check
 * @param baselineHeight - Baseline grid height
 * @returns Object with lineAbove and lineBelow
 */
export function getNearestBaselineLines(
	value: number,
	baselineHeight: number
): { lineAbove: number; lineBelow: number; distance: number } {
	const lineBelow = Math.floor(value / baselineHeight) * baselineHeight;
	const lineAbove = lineBelow + baselineHeight;
	const distance = Math.min(value - lineBelow, lineAbove - value);

	return {
		lineAbove,
		lineBelow,
		distance
	};
}

/**
 * Snap a dimension (width/height) to baseline multiples
 * Ensures minimum size and rounds to nearest baseline
 * @param dimension - Width or height value
 * @param baselineHeight - Baseline grid height
 * @param minSize - Minimum size in pixels (default: 1 baseline unit)
 * @returns Snapped dimension
 */
export function snapDimensionToBaseline(
	dimension: number,
	baselineHeight: number,
	minSize?: number
): number {
	const min = minSize ?? baselineHeight;
	const snapped = Math.max(min, snapToBaseline(dimension, baselineHeight));
	return snapped;
}

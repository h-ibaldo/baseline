/**
 * Baseline Grid Type Definitions
 * Defines types for the baseline grid system (InDesign-style typography alignment)
 */

/**
 * Baseline grid configuration
 */
export interface BaselineConfig {
	enabled: boolean; // Global baseline snap toggle
	height: number; // Baseline height in pixels (e.g., 8, 12, 16)
	color: string; // Grid line color
	opacity: number; // Grid line opacity (0-1)
	showGrid: boolean; // Show visual grid overlay
}

/**
 * Element baseline settings (per-component override)
 */
export interface BaselineSettings {
	snapToBaseline: boolean; // Whether this element snaps to baseline
	baselineMultiplier?: number; // Custom multiplier (e.g., 2 = snap to every 2nd line)
}

/**
 * Snapping result with metadata
 */
export interface SnapResult {
	snappedValue: number; // The snapped value
	originalValue: number; // The original value before snapping
	linesFromOrigin: number; // Number of baseline lines from origin
	wasSnapped: boolean; // Whether snapping was applied
}

import { describe, it, expect } from 'vitest';
import {
	snapToBaseline,
	pixelsToBaselineUnits,
	baselineUnitsToPixels,
	isAlignedToBaseline,
	getNearestBaselineLines,
	snapDimensionToBaseline
} from './baseline';

describe('Baseline Grid Calculation Engine (LineBasis Grid System)', () => {
	const baselineHeight = 8;

	describe('snapToBaseline', () => {
		it('should snap to nearest baseline', () => {
			expect(snapToBaseline(0, baselineHeight)).toBe(0);
			expect(snapToBaseline(4, baselineHeight)).toBe(8); // 4/8 = 0.5, rounds to 1 * 8 = 8
			expect(snapToBaseline(3, baselineHeight)).toBe(0); // 3/8 = 0.375, rounds to 0
			expect(snapToBaseline(5, baselineHeight)).toBe(8); // Rounds up
			expect(snapToBaseline(12, baselineHeight)).toBe(16); // 12/8 = 1.5, rounds to 2 * 8 = 16
			expect(snapToBaseline(16, baselineHeight)).toBe(16); // Exactly on line
		});

		it('should handle negative values', () => {
			expect(snapToBaseline(-5, baselineHeight)).toBe(-8);
			expect(snapToBaseline(-12, baselineHeight)).toBe(-8); // -12/8 = -1.5, rounds to -1 * 8 = -8
		});
	});

	describe('pixelsToBaselineUnits', () => {
		it('should convert pixels to baseline units', () => {
			expect(pixelsToBaselineUnits(8, baselineHeight)).toBe(1);
			expect(pixelsToBaselineUnits(16, baselineHeight)).toBe(2);
			expect(pixelsToBaselineUnits(12, baselineHeight)).toBe(1.5);
		});
	});

	describe('baselineUnitsToPixels', () => {
		it('should convert baseline units to pixels', () => {
			expect(baselineUnitsToPixels(1, baselineHeight)).toBe(8);
			expect(baselineUnitsToPixels(2, baselineHeight)).toBe(16);
			expect(baselineUnitsToPixels(1.5, baselineHeight)).toBe(12);
		});
	});

	describe('isAlignedToBaseline', () => {
		it('should detect aligned values', () => {
			expect(isAlignedToBaseline(0, baselineHeight)).toBe(true);
			expect(isAlignedToBaseline(8, baselineHeight)).toBe(true);
			expect(isAlignedToBaseline(16, baselineHeight)).toBe(true);
		});

		it('should detect misaligned values', () => {
			expect(isAlignedToBaseline(5, baselineHeight)).toBe(false);
			expect(isAlignedToBaseline(10, baselineHeight)).toBe(false);
		});

		it('should respect tolerance', () => {
			expect(isAlignedToBaseline(8.3, baselineHeight, 0.5)).toBe(true);
			expect(isAlignedToBaseline(8.6, baselineHeight, 0.5)).toBe(false);
		});
	});

	describe('getNearestBaselineLines', () => {
		it('should find nearest lines', () => {
			const result = getNearestBaselineLines(10, baselineHeight);
			expect(result.lineBelow).toBe(8);
			expect(result.lineAbove).toBe(16);
			expect(result.distance).toBe(2);
		});
	});

	describe('snapDimensionToBaseline', () => {
		it('should snap dimensions to baseline', () => {
			expect(snapDimensionToBaseline(10, baselineHeight)).toBe(8);
			expect(snapDimensionToBaseline(12, baselineHeight)).toBe(16); // 12/8 = 1.5, rounds to 2 * 8 = 16
			expect(snapDimensionToBaseline(20, baselineHeight)).toBe(24); // 20/8 = 2.5, rounds to 3 * 8 = 24
		});

		it('should respect minimum size', () => {
			expect(snapDimensionToBaseline(2, baselineHeight, 16)).toBe(16);
		});
	});
});

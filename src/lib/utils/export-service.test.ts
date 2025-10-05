import { describe, it, expect } from 'vitest';
import { createDefaultExportConfig, validateExportConfig, estimateExportSize } from './export-service';
import type { CanvasState } from '../types/canvas';

describe('Export Service', () => {
	const sampleState: CanvasState = {
		config: { backgroundColor: '#fff', maxArtboards: 10 },
		artboards: [
			{
				id: 'ab1',
				name: 'Test Page',
				x: 0,
				y: 0,
				width: 1200,
				height: 800,
				backgroundColor: '#fff',
				showGrid: true,
				isPublishTarget: true
			}
		],
		elements: []
	};

	describe('createDefaultExportConfig', () => {
		it('should create default export configuration', () => {
			const config = createDefaultExportConfig();
			
			expect(config).toBeDefined();
			expect(config.codeOptions).toBeDefined();
			expect(config.codeOptions.format).toBe('html');
			expect(config.codeOptions.prettyPrint).toBe(true);
			expect(config.fileStructure).toBeDefined();
		});
	});

	describe('validateExportConfig', () => {
		it('should validate a valid configuration', () => {
			const config = createDefaultExportConfig();
			const result = validateExportConfig(config);
			
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect invalid format', () => {
			const config = createDefaultExportConfig();
			config.codeOptions.format = 'invalid' as any;
			
			const result = validateExportConfig(config);
			
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});

	describe('estimateExportSize', () => {
		it('should estimate export size', () => {
			const config = createDefaultExportConfig();
			const size = estimateExportSize(sampleState, config);
			
			expect(size.bytes).toBeGreaterThan(0);
			expect(size.kb).toBeGreaterThan(0);
		});
	});
});


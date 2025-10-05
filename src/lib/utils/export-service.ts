/**
 * Export Service
 * 
 * Handles exporting designs as downloadable files
 * Supports ZIP archives with HTML, CSS, and assets
 */

import JSZip from 'jszip';
import type { CanvasState } from '$lib/types/canvas';
import type { ExportConfig, GeneratedFile } from '$lib/types/ast';
import { parseDesignToAST, validateAST, optimizeAST } from './ast-parser';
import { generateHTML } from './html-generator';
import { generateCSS } from './css-generator';

/**
 * Export design as ZIP file
 * @param state - Current design state
 * @param config - Export configuration
 * @param baselineConfig - Baseline grid configuration
 * @returns Blob containing ZIP file
 */
export async function exportAsZip(
	state: CanvasState,
	config: ExportConfig,
	baselineConfig?: { enabled: boolean; height: number }
): Promise<Blob> {
	// Generate AST
	const ast = parseDesignToAST(state, baselineConfig);
	
	// Validate AST
	const validation = validateAST(ast);
	if (!validation.valid) {
		throw new Error(`AST validation failed: ${validation.errors.join(', ')}`);
	}

	// Optimize AST
	const optimizedAST = optimizeAST(ast);

	// Generate code
	const result = generateHTML(optimizedAST, config.codeOptions);

	// Create ZIP archive
	const zip = new JSZip();

	// Add generated files to ZIP
	result.files.forEach((file) => {
		const folder = getFileFolderPath(file, config);
		zip.file(folder + file.path, file.content);
	});

	// Add README if requested
	if (config.includeAssets !== false) {
		const readme = generateReadme(state, config);
		zip.file('README.md', readme);
	}

	// Generate ZIP blob
	const blob = await zip.generateAsync({
		type: 'blob',
		compression: 'DEFLATE',
		compressionOptions: {
			level: 9
		}
	});

	return blob;
}

/**
 * Export single page as HTML file
 * @param state - Current design state
 * @param config - Export configuration
 * @param baselineConfig - Baseline grid configuration
 * @returns HTML string
 */
export function exportAsHTML(
	state: CanvasState,
	config: ExportConfig,
	baselineConfig?: { enabled: boolean; height: number }
): string {
	const ast = parseDesignToAST(state, baselineConfig);
	const validation = validateAST(ast);
	
	if (!validation.valid) {
		throw new Error(`AST validation failed: ${validation.errors.join(', ')}`);
	}

	const optimizedAST = optimizeAST(ast);
	const result = generateHTML(optimizedAST, config.codeOptions);

	// Return first HTML file
	const htmlFile = result.files.find((f) => f.type === 'html');
	return htmlFile?.content || '';
}

/**
 * Export CSS as separate file
 * @param state - Current design state
 * @param config - Export configuration
 * @param baselineConfig - Baseline grid configuration
 * @returns CSS string
 */
export function exportAsCSS(
	state: CanvasState,
	config: ExportConfig,
	baselineConfig?: { enabled: boolean; height: number }
): string {
	const ast = parseDesignToAST(state, baselineConfig);
	const optimizedAST = optimizeAST(ast);
	return generateCSS(optimizedAST, config.codeOptions);
}

/**
 * Download blob as file
 * @param blob - Blob to download
 * @param filename - Filename for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.style.display = 'none';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Download text as file
 * @param content - Text content
 * @param filename - Filename for download
 * @param mimeType - MIME type (default: text/plain)
 */
export function downloadText(
	content: string,
	filename: string,
	mimeType: string = 'text/plain'
): void {
	const blob = new Blob([content], { type: mimeType });
	downloadBlob(blob, filename);
}

/**
 * Get folder path for file based on export config
 */
function getFileFolderPath(file: GeneratedFile, config: ExportConfig): string {
	const structure = config.fileStructure || {};

	switch (file.type) {
		case 'html':
			return structure.htmlDir ? `${structure.htmlDir}/` : '';
		case 'css':
			return structure.cssDir ? `${structure.cssDir}/` : 'css/';
		case 'js':
			return structure.jsDir ? `${structure.jsDir}/` : 'js/';
		default:
			return structure.assetsDir ? `${structure.assetsDir}/` : 'assets/';
	}
}

/**
 * Generate README.md for exported project
 */
function generateReadme(state: CanvasState, config: ExportConfig): string {
	const pageCount = state.artboards.filter((a) => a.isPublishTarget).length;
	const elementCount = state.elements.length;

	return `# Exported from Baseline

## Project Information

- **Generated**: ${new Date().toLocaleString()}
- **Pages**: ${pageCount}
- **Elements**: ${elementCount}
- **Format**: ${config.codeOptions.format}

## Structure

\`\`\`
${config.fileStructure?.htmlDir || '.'}/ - HTML pages
${config.fileStructure?.cssDir || 'css'}/ - CSS stylesheets
${config.fileStructure?.jsDir || 'js'}/ - JavaScript files (if any)
${config.fileStructure?.assetsDir || 'assets'}/ - Images and other assets
\`\`\`

## Pages

${state.artboards
	.filter((a) => a.isPublishTarget)
	.map((a) => `- **${a.name}** (${a.width}x${a.height}px)`)
	.join('\n')}

## Opening the Project

1. Extract this ZIP file
2. Open any HTML file in your web browser
3. That's it! No build step required.

## Baseline Grid

This design was created with Baseline's baseline grid system.
${state.artboards.some((a) => a.showGrid) ? 'Grid settings were applied to maintain vertical rhythm.' : ''}

## Next Steps

- Upload to any web host
- Customize the HTML/CSS as needed
- Add your own JavaScript for interactivity
- Deploy to Netlify, Vercel, or any static host

---

Created with [Baseline](https://baseline.dev) - Open-source design tool
`;
}

/**
 * Create default export configuration
 */
export function createDefaultExportConfig(): ExportConfig {
	return {
		includePages: [], // Empty = all published pages
		includeAssets: true,
		codeOptions: {
			format: 'html',
			htmlVersion: 'html5',
			includeDoctype: true,
			includeMetaTags: true,
			prettyPrint: true,
			indentation: 'spaces',
			indentSize: 2,
			cssFormat: 'external',
			cssMinify: false,
			cssPrefix: false,
			cssVariables: true,
			includeJs: false,
			jsMinify: false,
			optimizeImages: true,
			removeComments: false,
			removeDuplicateStyles: true,
			includeAriaLabels: true,
			includeSemanticHtml: true
		},
		cssNaming: 'component',
		outputFormat: 'zip',
		fileStructure: {
			htmlDir: '',
			cssDir: 'css',
			jsDir: 'js',
			assetsDir: 'assets'
		}
	};
}

/**
 * Estimate export size (before compression)
 */
export function estimateExportSize(
	state: CanvasState,
	config: ExportConfig,
	baselineConfig?: { enabled: boolean; height: number }
): { bytes: number; kb: number; mb: number } {
	try {
		const html = exportAsHTML(state, config, baselineConfig);
		const css = exportAsCSS(state, config, baselineConfig);
		const readme = generateReadme(state, config);

		const bytes = html.length + css.length + readme.length;

		return {
			bytes,
			kb: Math.round(bytes / 1024),
			mb: Math.round((bytes / 1024 / 1024) * 100) / 100
		};
	} catch {
		return { bytes: 0, kb: 0, mb: 0 };
	}
}

/**
 * Validate export configuration
 */
export function validateExportConfig(config: ExportConfig): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check required fields
	if (!config.codeOptions) {
		errors.push('Code options are required');
	}

	if (!config.codeOptions.format) {
		errors.push('Output format is required');
	}

	// Validate format
	const validFormats = ['html', 'svelte', 'react', 'vue'];
	if (config.codeOptions.format && !validFormats.includes(config.codeOptions.format)) {
		errors.push(`Invalid format: ${config.codeOptions.format}`);
	}

	// Warnings
	if (config.codeOptions.cssMinify && config.codeOptions.prettyPrint) {
		warnings.push('CSS minification and pretty print are both enabled');
	}

	if (config.codeOptions.cssFormat === 'inline' && config.fileStructure?.cssDir) {
		warnings.push('CSS directory specified but using inline CSS');
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}


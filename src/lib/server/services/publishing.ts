/**
 * Publishing Service
 * 
 * Handles the complete flow: Design → AST → HTML/CSS → Database → Live Page
 * Server-side only
 */

import type { CanvasState } from '$lib/types/canvas';
import type { ExportConfig } from '$lib/types/ast';
import { parseDesignToAST, validateAST, optimizeAST } from '$lib/utils/ast-parser';
import { generateHTML } from '$lib/utils/html-generator';
import { generateCSS } from '$lib/utils/css-generator';
import { createPage, updatePage, publishPage, getPageById } from './pages';

export interface PublishOptions {
	baselineConfig?: {
		enabled: boolean;
		height: number;
	};
	exportConfig?: ExportConfig;
}

export interface PublishResult {
	success: boolean;
	pageId: string;
	slug: string;
	url: string;
	errors?: string[];
	warnings?: string[];
}

/**
 * Create a new page from design state
 * Saves design events to database but doesn't publish yet
 */
export async function createPageFromDesign(
	designState: CanvasState,
	metadata: {
		slug: string;
		title: string;
		description?: string;
		authorId: string;
	}
): Promise<{ pageId: string; slug: string }> {
	// Serialize design events for storage
	const designEvents = JSON.stringify(designState);

	// Create page in database
	const page = await createPage({
		...metadata,
		designEvents
	});

	return {
		pageId: page.id,
		slug: page.slug
	};
}

/**
 * Update existing page with new design state
 */
export async function updatePageDesign(
	pageId: string,
	designState: CanvasState
): Promise<void> {
	const designEvents = JSON.stringify(designState);

	await updatePage(pageId, {
		designEvents,
		designState: JSON.stringify(designState) // Store current state for quick access
	});
}

/**
 * Publish a page - generate HTML/CSS and make it live
 */
export async function publishPageFromDesign(
	pageId: string,
	options: PublishOptions = {}
): Promise<PublishResult> {
	const errors: string[] = [];
	const warnings: string[] = [];

	try {
		// 1. Get page from database
		const page = await getPageById(pageId);
		if (!page) {
			return {
				success: false,
				pageId,
				slug: '',
				url: '',
				errors: ['Page not found']
			};
		}

		// 2. Parse design events to state
		const designState: CanvasState = JSON.parse(page.designEvents);

		// 3. Generate AST
		const ast = parseDesignToAST(
			designState,
			options.baselineConfig || { enabled: true, height: 8 }
		);

		// 4. Validate AST
		const validation = validateAST(ast);
		if (!validation.valid) {
			return {
				success: false,
				pageId,
				slug: page.slug,
				url: '',
				errors: validation.errors
			};
		}

		// 5. Optimize AST
		const optimizedAST = optimizeAST(ast);

		// 6. Generate HTML/CSS
		const exportConfig = options.exportConfig || getDefaultExportConfig();
		const result = generateHTML(optimizedAST, exportConfig.codeOptions);
		const css = generateCSS(optimizedAST, exportConfig.codeOptions);

		// Get HTML content
		const htmlFile = result.files.find(f => f.type === 'html');
		if (!htmlFile) {
			return {
				success: false,
				pageId,
				slug: page.slug,
				url: '',
				errors: ['Failed to generate HTML']
			};
		}

		// 7. Store published HTML/CSS in database
		await publishPage(pageId, {
			html: htmlFile.content,
			css: css
		});

		// 8. Return success with URL
		return {
			success: true,
			pageId,
			slug: page.slug,
			url: `/${page.slug}`,
			warnings: validation.errors.length > 0 ? validation.errors : undefined
		};
	} catch (error) {
		errors.push(error instanceof Error ? error.message : 'Unknown error');
		return {
			success: false,
			pageId,
			slug: '',
			url: '',
			errors
		};
	}
}

/**
 * Publish multiple pages at once
 */
export async function publishMultiplePages(
	pageIds: string[],
	options: PublishOptions = {}
): Promise<PublishResult[]> {
	return Promise.all(
		pageIds.map(pageId => publishPageFromDesign(pageId, options))
	);
}

/**
 * Get default export configuration for publishing
 */
function getDefaultExportConfig(): ExportConfig {
	return {
		includePages: [],
		includeAssets: true,
		codeOptions: {
			format: 'html',
			includeDoctype: true,
			includeMetaTags: true,
			prettyPrint: false, // Minified for production
			indentation: 'spaces',
			indentSize: 2,
			cssFormat: 'embedded', // Embed CSS in HTML for SSR
			cssMinify: true,
			cssPrefix: false,
			cssVariables: true,
			includeJs: false,
			jsMinify: false,
			optimizeImages: true,
			removeComments: true,
			removeDuplicateStyles: true,
			includeAriaLabels: true,
			includeSemanticHtml: true
		},
		cssNaming: 'component',
		outputFormat: 'files',
		fileStructure: {
			htmlDir: '',
			cssDir: 'css',
			jsDir: 'js',
			assetsDir: 'assets'
		}
	};
}

/**
 * Preview page without publishing
 * Generates HTML/CSS but doesn't save to database
 */
export async function previewPage(
	designState: CanvasState,
	options: PublishOptions = {}
): Promise<{ html: string; css: string; errors?: string[] }> {
	try {
		// Generate AST
		const ast = parseDesignToAST(
			designState,
			options.baselineConfig || { enabled: true, height: 8 }
		);

		// Validate
		const validation = validateAST(ast);
		if (!validation.valid) {
			return {
				html: '',
				css: '',
				errors: validation.errors
			};
		}

		// Optimize and generate
		const optimizedAST = optimizeAST(ast);
		const exportConfig = options.exportConfig || getDefaultExportConfig();
		const result = generateHTML(optimizedAST, exportConfig.codeOptions);
		const css = generateCSS(optimizedAST, exportConfig.codeOptions);

		const htmlFile = result.files.find(f => f.type === 'html');

		return {
			html: htmlFile?.content || '',
			css
		};
	} catch (error) {
		return {
			html: '',
			css: '',
			errors: [error instanceof Error ? error.message : 'Unknown error']
		};
	}
}


/**
 * AST Parser
 * 
 * Converts design state (from event sourcing) into an Abstract Syntax Tree (AST)
 * that can be used for code generation.
 * 
 * Flow: CanvasState → AST → HTML/CSS/Svelte
 */

import { nanoid } from 'nanoid';
import type { CanvasState, Artboard, CanvasElement } from '$lib/types/canvas';
import type { ComponentProps } from '$lib/types/components';
import type {
	ASTRoot,
	ASTPage,
	ASTElement,
	ASTMetadata,
	ASTStyles,
	PageMetadata
} from '$lib/types/ast';

/**
 * Parse design state into AST
 * @param state - Current design state
 * @param baselineConfig - Baseline grid configuration
 * @returns AST root node
 */
export function parseDesignToAST(
	state: CanvasState,
	baselineConfig?: { enabled: boolean; height: number }
): ASTRoot {
	// Filter artboards marked for publishing
	const publishableArtboards = state.artboards.filter((ab) => ab.isPublishTarget);

	// Convert each artboard to a page
	const pages = publishableArtboards.map((artboard) =>
		parseArtboardToPage(artboard, state.elements)
	);

	// Generate metadata
	const metadata: ASTMetadata = {
		generator: 'Baseline',
		version: '0.1.0', // TODO: Read from package.json
		generatedAt: new Date().toISOString(),
		baselineConfig: baselineConfig || { enabled: false, height: 8 },
		cssVariables: extractCSSVariables(state)
	};

	return {
		id: nanoid(),
		type: 'root',
		pages,
		metadata
	};
}

/**
 * Convert an artboard to a page node
 */
function parseArtboardToPage(artboard: Artboard, allElements: CanvasElement[]): ASTPage {
	// Get elements that belong to this artboard
	const artboardElements = allElements.filter((el) => el.artboardId === artboard.id);

	// Convert elements to AST nodes
	const astElements = artboardElements.map((el) => parseElementToAST(el));

	// Generate slug from name
	const slug = generateSlug(artboard.name);

	// Generate page metadata
	const metadata: PageMetadata = {
		title: artboard.name,
		description: `Page generated from ${artboard.name}`,
		language: 'en'
	};

	return {
		id: artboard.id,
		type: 'page',
		name: artboard.name,
		slug,
		width: artboard.width,
		height: artboard.height,
		backgroundColor: artboard.backgroundColor,
		metadata,
		children: astElements
	};
}

/**
 * Convert a canvas element to an AST element
 */
function parseElementToAST(element: CanvasElement): ASTElement {
	// Convert element to component props
	// For now, we only support 'box' type, so we'll convert it to a Container
	const componentProps = convertElementToComponentProps(element);

	// Extract styles from element
	const styles = extractElementStyles(element);

	return {
		id: element.id,
		type: 'element',
		componentType: componentProps.type,
		props: componentProps,
		styles
	};
}

/**
 * Convert canvas element to component props
 * This maps our basic canvas elements to design components
 */
function convertElementToComponentProps(element: CanvasElement): ComponentProps {
	// For now, we only have basic 'box' elements
	// In the future, this will recognize component types
	switch (element.type) {
		case 'box':
			// Convert box to Container component
			return {
				id: element.id,
				name: `Container ${element.id.slice(0, 8)}`,
				type: 'container',
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height,
				rotation: element.rotation,
				opacity: element.opacity,
				snapToBaseline: element.snapToBaseline,
				// Default container styling
				backgroundColor: '#ffffff',
				borderColor: '#e5e5e5',
				borderWidth: 1,
				borderRadius: 4
			};

		case 'text':
			// Convert to Text component
			return {
				id: element.id,
				name: `Text ${element.id.slice(0, 8)}`,
				type: 'text',
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height,
				text: 'Text content', // TODO: Store actual text content
				fontSize: 16,
				lineHeight: 24,
				snapToBaseline: element.snapToBaseline
			};

		case 'image':
			// TODO: Implement image component
			// For now, treat as container
			return {
				id: element.id,
				name: `Image ${element.id.slice(0, 8)}`,
				type: 'container',
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height
			};

		default:
			// Fallback to container
			return {
				id: element.id,
				name: `Element ${element.id.slice(0, 8)}`,
				type: 'container',
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height
			};
	}
}

/**
 * Extract CSS styles from element
 */
function extractElementStyles(element: CanvasElement): ASTStyles {
	const styles: ASTStyles = {
		position: 'absolute', // Elements are positioned absolutely within artboard
		left: `${element.x}px`,
		top: `${element.y}px`,
		width: `${element.width}px`,
		height: `${element.height}px`
	};

	// Add optional styles
	if (element.rotation !== undefined && element.rotation !== 0) {
		styles.transform = `rotate(${element.rotation}deg)`;
	}

	if (element.opacity !== undefined && element.opacity !== 1) {
		styles.opacity = element.opacity;
	}

	return styles;
}

/**
 * Extract global CSS variables from design state
 * This will be expanded to include theme colors, fonts, etc.
 */
function extractCSSVariables(state: CanvasState): Record<string, string> {
	// For now, return basic variables
	// In the future, this will analyze the design and extract common values
	return {
		'--baseline-height': '8px', // TODO: Get from actual baseline config
		'--canvas-background': state.config.backgroundColor || '#f5f5f5',
		'--font-family-base': 'system-ui, -apple-system, sans-serif',
		'--color-text': '#000000',
		'--color-background': '#ffffff'
	};
}

/**
 * Generate URL-friendly slug from name
 */
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove non-word chars
		.replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate AST structure
 * Ensures the AST is well-formed before code generation
 */
export function validateAST(ast: ASTRoot): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check root
	if (!ast.pages || ast.pages.length === 0) {
		errors.push('AST must contain at least one page');
	}

	// Check pages
	ast.pages.forEach((page, index) => {
		if (!page.name) {
			errors.push(`Page ${index} is missing a name`);
		}
		if (!page.slug) {
			errors.push(`Page ${index} is missing a slug`);
		}
		if (page.width <= 0 || page.height <= 0) {
			errors.push(`Page ${index} has invalid dimensions`);
		}

		// Check for duplicate slugs
		const duplicateSlugs = ast.pages.filter((p) => p.slug === page.slug);
		if (duplicateSlugs.length > 1) {
			errors.push(`Duplicate slug found: "${page.slug}"`);
		}
	});

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Optimize AST before code generation
 * - Removes empty containers
 * - Merges similar styles
 * - Optimizes nested structures
 */
export function optimizeAST(ast: ASTRoot): ASTRoot {
	// Clone the AST to avoid mutations
	const optimized = JSON.parse(JSON.stringify(ast)) as ASTRoot;

	// Optimize each page
	optimized.pages = optimized.pages.map((page) => ({
		...page,
		children: page.children ? optimizeElements(page.children) : []
	}));

	return optimized;
}

/**
 * Optimize array of elements
 */
function optimizeElements(elements: ASTElement[]): ASTElement[] {
	return elements
		.filter((el) => {
			// Remove empty containers with no children
			if (el.componentType === 'container' && (!el.children || el.children.length === 0)) {
				return false;
			}
			return true;
		})
		.map((el) => ({
			...el,
			children: el.children ? optimizeElements(el.children) : undefined
		}));
}

/**
 * Debug utility: Print AST structure
 */
export function printAST(ast: ASTRoot, indent = 0): string {
	const spaces = '  '.repeat(indent);
	let output = `${spaces}Root (${ast.pages.length} pages)\n`;

	ast.pages.forEach((page) => {
		output += `${spaces}  Page: ${page.name} (${page.slug})\n`;
		output += `${spaces}    Dimensions: ${page.width}x${page.height}\n`;
		output += `${spaces}    Elements: ${page.children?.length || 0}\n`;

		page.children?.forEach((el) => {
			output += `${spaces}      - ${el.componentType} (${el.id.slice(0, 8)})\n`;
		});
	});

	return output;
}


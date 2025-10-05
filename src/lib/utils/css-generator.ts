/**
 * CSS Generator
 * 
 * Generates optimized CSS from AST
 * Supports CSS Variables, deduplication, minification, and vendor prefixes
 */

import type { ASTRoot, ASTPage, ASTElement, ASTStyles, CodeGenerationOptions } from '$lib/types/ast';

/**
 * Generate CSS from AST
 * @param ast - AST root node
 * @param options - Code generation options
 * @returns CSS string
 */
export function generateCSS(ast: ASTRoot, options: CodeGenerationOptions): string {
	const nl = options.prettyPrint ? '\n' : '';
	const indent = options.prettyPrint ? (options.indentation === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2)) : '';

	let css = '';

	// Generate CSS variables if enabled
	if (options.cssVariables && ast.metadata.cssVariables) {
		css += generateCSSVariables(ast.metadata.cssVariables, indent, nl);
		css += nl;
	}

	// Global reset
	css += generateReset(indent, nl);
	css += nl;

	// Base styles
	css += generateBaseStyles(ast, indent, nl);
	css += nl;

	// Component styles
	css += generateComponentStyles(ast, options, indent, nl);

	// Minify if requested
	if (options.cssMinify) {
		css = minifyCSS(css);
	}

	return css;
}

/**
 * Generate CSS custom properties (variables)
 */
function generateCSSVariables(variables: Record<string, string>, indent: string, nl: string): string {
	let css = `:root {${nl}`;

	Object.entries(variables).forEach(([key, value]) => {
		css += `${indent}${key}: ${value};${nl}`;
	});

	css += `}`;
	return css;
}

/**
 * Generate CSS reset
 */
function generateReset(indent: string, nl: string): string {
	return `* {${nl}${indent}margin: 0;${nl}${indent}padding: 0;${nl}${indent}box-sizing: border-box;${nl}}`;
}

/**
 * Generate base styles
 */
function generateBaseStyles(ast: ASTRoot, indent: string, nl: string): string {
	let css = '';

	// Body styles
	css += `body {${nl}`;
	css += `${indent}font-family: var(--font-family-base, system-ui, -apple-system, sans-serif);${nl}`;
	css += `${indent}line-height: 1.5;${nl}`;
	css += `${indent}color: var(--color-text, #000000);${nl}`;
	css += `${indent}background-color: var(--color-background, #ffffff);${nl}`;
	
	// Add baseline grid support if enabled
	if (ast.metadata.baselineConfig?.enabled) {
		const baselineHeight = ast.metadata.baselineConfig.height;
		css += `${indent}/* Baseline grid: ${baselineHeight}px */${nl}`;
	}
	
	css += `}${nl}${nl}`;

	// Page container
	css += `.page {${nl}`;
	css += `${indent}position: relative;${nl}`;
	css += `${indent}margin: 0 auto;${nl}`;
	css += `${indent}overflow: hidden;${nl}`;
	css += `}`;

	return css;
}

/**
 * Generate component-specific styles
 */
function generateComponentStyles(
	ast: ASTRoot,
	options: CodeGenerationOptions,
	indent: string,
	nl: string
): string {
	const styleMap = new Map<string, ASTStyles[]>();

	// Collect all styles grouped by component type
	ast.pages.forEach((page) => {
		collectStyles(page.children || [], styleMap);
	});

	let css = '';

	// Generate styles for each component type
	styleMap.forEach((styles, componentType) => {
		css += generateComponentTypeCSS(componentType, styles, options, indent, nl);
		css += nl;
	});

	return css;
}

/**
 * Collect styles from elements
 */
function collectStyles(elements: ASTElement[], styleMap: Map<string, ASTStyles[]>): void {
	elements.forEach((el) => {
		const className = getClassName(el.componentType);
		
		if (!styleMap.has(className)) {
			styleMap.set(className, []);
		}
		
		styleMap.get(className)!.push(el.styles);

		// Recursively collect from children
		if (el.children) {
			collectStyles(el.children, styleMap);
		}
	});
}

/**
 * Generate CSS for a specific component type
 */
function generateComponentTypeCSS(
	componentType: string,
	styles: ASTStyles[],
	options: CodeGenerationOptions,
	indent: string,
	nl: string
): string {
	const className = `.${componentType}`;
	
	// Merge common styles (if deduplication is enabled)
	const commonStyles = options.removeDuplicateStyles 
		? extractCommonStyles(styles)
		: styles[0] || {};

	let css = `${className} {${nl}`;

	// Convert styles object to CSS properties
	Object.entries(commonStyles).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			const cssKey = camelToKebab(key);
			const cssValue = formatCSSValue(key, value);
			css += `${indent}${cssKey}: ${cssValue};${nl}`;
		}
	});

	css += `}`;

	return css;
}

/**
 * Extract common styles from multiple style objects
 * Returns styles that appear in all objects with the same value
 */
function extractCommonStyles(styles: ASTStyles[]): ASTStyles {
	if (styles.length === 0) return {};
	if (styles.length === 1) return styles[0];

	const common: ASTStyles = {};
	const firstStyle = styles[0];

	// Check each property in the first style
	Object.entries(firstStyle).forEach(([key, value]) => {
		// Check if all other styles have the same value for this key
		const isCommon = styles.every((style) => style[key as keyof ASTStyles] === value);
		
		if (isCommon) {
			common[key as keyof ASTStyles] = value as any;
		}
	});

	return common;
}

/**
 * Get CSS class name for component type
 */
function getClassName(componentType: string): string {
	return `baseline-${componentType.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
	return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Format CSS value (add units, handle special cases)
 */
function formatCSSValue(key: string, value: any): string {
	// Already a string with units or keyword
	if (typeof value === 'string') {
		return value;
	}

	// Number properties that need units
	const pxProperties = [
		'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
		'top', 'right', 'bottom', 'left',
		'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
		'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
		'borderWidth', 'borderRadius',
		'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'
	];

	if (typeof value === 'number') {
		// Unitless properties
		if (key === 'opacity' || key === 'zIndex' || key === 'fontWeight' || 
		    key === 'flexGrow' || key === 'flexShrink') {
			return value.toString();
		}

		// Add px unit
		if (pxProperties.includes(key)) {
			return `${value}px`;
		}

		return value.toString();
	}

	return String(value);
}

/**
 * Minify CSS by removing whitespace and comments
 */
function minifyCSS(css: string): string {
	return css
		.replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
		.replace(/\s+/g, ' ') // Collapse whitespace
		.replace(/\s*{\s*/g, '{') // Remove space around {
		.replace(/\s*}\s*/g, '}') // Remove space around }
		.replace(/\s*:\s*/g, ':') // Remove space around :
		.replace(/\s*;\s*/g, ';') // Remove space around ;
		.replace(/;\}/g, '}') // Remove last semicolon
		.trim();
}

/**
 * Generate responsive CSS with media queries
 * TODO: Implement when we add breakpoint support
 */
export function generateResponsiveCSS(
	ast: ASTRoot,
	breakpoints: Record<string, number>,
	options: CodeGenerationOptions
): string {
	// Future implementation for responsive design
	return '';
}

/**
 * Generate CSS Grid specific styles
 */
export function generateGridCSS(element: ASTElement, indent: string, nl: string): string {
	const props = element.props as any;
	let css = '';

	if (element.componentType === 'grid') {
		css += `${indent}display: grid;${nl}`;
		
		if (props.columns) {
			css += `${indent}grid-template-columns: ${props.columns};${nl}`;
		}
		if (props.rows) {
			css += `${indent}grid-template-rows: ${props.rows};${nl}`;
		}
		if (props.gap) {
			css += `${indent}gap: ${props.gap}px;${nl}`;
		}
	}

	return css;
}

/**
 * Generate Flexbox specific styles
 */
export function generateFlexCSS(element: ASTElement, indent: string, nl: string): string {
	const props = element.props as any;
	let css = '';

	if (element.componentType === 'flex') {
		css += `${indent}display: flex;${nl}`;
		
		if (props.direction) {
			css += `${indent}flex-direction: ${props.direction};${nl}`;
		}
		if (props.justifyContent) {
			css += `${indent}justify-content: ${props.justifyContent};${nl}`;
		}
		if (props.alignItems) {
			css += `${indent}align-items: ${props.alignItems};${nl}`;
		}
		if (props.gap) {
			css += `${indent}gap: ${props.gap}px;${nl}`;
		}
		if (props.wrap) {
			css += `${indent}flex-wrap: ${props.wrap ? 'wrap' : 'nowrap'};${nl}`;
		}
	}

	return css;
}

/**
 * Add vendor prefixes for CSS properties
 * TODO: Implement autoprefixer-like functionality
 */
export function addVendorPrefixes(css: string, options: CodeGenerationOptions): string {
	if (!options.cssPrefix) {
		return css;
	}

	// Properties that need prefixes
	const prefixMap: Record<string, string[]> = {
		'transform': ['-webkit-transform', '-moz-transform', '-ms-transform'],
		'transition': ['-webkit-transition', '-moz-transition'],
		'animation': ['-webkit-animation', '-moz-animation'],
		'flex': ['-webkit-flex', '-ms-flex'],
		'user-select': ['-webkit-user-select', '-moz-user-select', '-ms-user-select']
	};

	let prefixed = css;

	Object.entries(prefixMap).forEach(([property, prefixes]) => {
		const regex = new RegExp(`(\\s|^)${property}:`, 'g');
		prefixed = prefixed.replace(regex, (match, whitespace) => {
			const allPrefixes = prefixes.map((prefix) => `${whitespace}${prefix}:`).join('\n');
			return `${allPrefixes}\n${match}`;
		});
	});

	return prefixed;
}

/**
 * Optimize CSS by removing duplicate rules
 */
export function optimizeCSS(css: string): string {
	// Split into rules
	const rules = css.split('}').filter((rule) => rule.trim());
	const uniqueRules = new Map<string, string>();

	rules.forEach((rule) => {
		const [selector, ...declarations] = rule.split('{');
		if (selector && declarations.length > 0) {
			const cleanSelector = selector.trim();
			const cleanDeclarations = declarations.join('{').trim();
			
			// Keep only the last occurrence of each selector
			uniqueRules.set(cleanSelector, cleanDeclarations);
		}
	});

	// Rebuild CSS
	let optimized = '';
	uniqueRules.forEach((declarations, selector) => {
		optimized += `${selector} { ${declarations} }\n`;
	});

	return optimized;
}


/**
 * HTML Generator
 * 
 * Generates clean, semantic HTML from AST
 * Supports various HTML generation options and optimization
 */

import type {
	ASTRoot,
	ASTPage,
	ASTElement,
	CodeGenerationOptions,
	GeneratedCode,
	GeneratedFile
} from '$lib/types/ast';

/**
 * Generate HTML from AST
 * @param ast - AST root node
 * @param options - Code generation options
 * @returns Generated code with HTML files
 */
export function generateHTML(ast: ASTRoot, options: CodeGenerationOptions): GeneratedCode {
	const files: GeneratedFile[] = [];
	const warnings: string[] = [];
	const errors: string[] = [];

	// Generate HTML for each page
	ast.pages.forEach((page) => {
		try {
			const html = generatePageHTML(page, ast, options);
			files.push({
				path: page.slug === 'index' || page.slug === 'home' ? 'index.html' : `${page.slug}.html`,
				content: html,
				type: 'html',
				encoding: 'utf-8'
			});
		} catch (error) {
			errors.push(`Failed to generate HTML for page "${page.name}": ${error}`);
		}
	});

	// Generate CSS file if external CSS is requested
	if (options.cssFormat === 'external') {
		const css = generateCSS(ast, options);
		files.push({
			path: 'styles.css',
			content: css,
			type: 'css',
			encoding: 'utf-8'
		});
	}

	// Calculate total size
	const totalSize = files.reduce((sum, file) => sum + file.content.length, 0);

	return {
		format: 'html',
		files,
		metadata: {
			generatedAt: new Date().toISOString(),
			pageCount: ast.pages.length,
			fileCount: files.length,
			totalSize,
			warnings: warnings.length > 0 ? warnings : undefined,
			errors: errors.length > 0 ? errors : undefined
		}
	};
}

/**
 * Generate HTML for a single page
 */
function generatePageHTML(page: ASTPage, ast: ASTRoot, options: CodeGenerationOptions): string {
	const indent = options.prettyPrint ? (options.indentation === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2)) : '';
	const nl = options.prettyPrint ? '\n' : '';

	let html = '';

	// DOCTYPE
	if (options.includeDoctype !== false) {
		html += `<!DOCTYPE html>${nl}`;
	}

	// HTML tag
	const lang = page.metadata?.language || 'en';
	html += `<html lang="${lang}">${nl}`;

	// Head
	html += `${indent}<head>${nl}`;
	html += `${indent}${indent}<meta charset="UTF-8">${nl}`;
	html += `${indent}${indent}<meta name="viewport" content="width=device-width, initial-scale=1.0">${nl}`;

	// Meta tags
	if (options.includeMetaTags !== false) {
		const title = page.metadata?.title || page.name;
		html += `${indent}${indent}<title>${escapeHTML(title)}</title>${nl}`;

		if (page.metadata?.description) {
			html += `${indent}${indent}<meta name="description" content="${escapeHTML(page.metadata.description)}">${nl}`;
		}

		if (page.metadata?.keywords) {
			html += `${indent}${indent}<meta name="keywords" content="${page.metadata.keywords.join(', ')}">${nl}`;
		}

		// Open Graph tags
		if (page.metadata?.ogTitle) {
			html += `${indent}${indent}<meta property="og:title" content="${escapeHTML(page.metadata.ogTitle)}">${nl}`;
		}
		if (page.metadata?.ogDescription) {
			html += `${indent}${indent}<meta property="og:description" content="${escapeHTML(page.metadata.ogDescription)}">${nl}`;
		}
		if (page.metadata?.ogImage) {
			html += `${indent}${indent}<meta property="og:image" content="${page.metadata.ogImage}">${nl}`;
		}
	}

	// CSS
	if (options.cssFormat === 'embedded' || !options.cssFormat) {
		const css = generateCSS(ast, options);
		html += `${indent}${indent}<style>${nl}`;
		html += css;
		html += `${indent}${indent}</style>${nl}`;
	} else if (options.cssFormat === 'external') {
		html += `${indent}${indent}<link rel="stylesheet" href="styles.css">${nl}`;
	}

	html += `${indent}</head>${nl}`;

	// Body
	html += `${indent}<body>${nl}`;

	// Page container
	html += `${indent}${indent}<div class="page" style="width: ${page.width}px; height: ${page.height}px; background-color: ${page.backgroundColor}; position: relative; margin: 0 auto;">${nl}`;

	// Generate elements
	if (page.children && page.children.length > 0) {
		html += generateElements(page.children, options, indent + indent + indent);
	}

	html += `${indent}${indent}</div>${nl}`;
	html += `${indent}</body>${nl}`;
	html += `</html>`;

	return html;
}

/**
 * Generate HTML for elements
 */
function generateElements(elements: ASTElement[], options: CodeGenerationOptions, indent: string): string {
	const nl = options.prettyPrint ? '\n' : '';
	let html = '';

	elements.forEach((element) => {
		html += generateElementHTML(element, options, indent) + nl;
	});

	return html;
}

/**
 * Generate HTML for a single element
 */
function generateElementHTML(element: ASTElement, options: CodeGenerationOptions, indent: string): string {
	const nl = options.prettyPrint ? '\n' : '';
	const tag = getHTMLTag(element, options);
	const className = getElementClassName(element);
	const inlineStyles = options.cssFormat === 'inline' ? generateInlineStyles(element) : '';

	let html = indent;

	// Opening tag
	html += `<${tag}`;
	if (className) {
		html += ` class="${className}"`;
	}
	if (inlineStyles) {
		html += ` style="${inlineStyles}"`;
	}
	if (options.includeAriaLabels) {
		const ariaLabel = getAriaLabel(element);
		if (ariaLabel) {
			html += ` aria-label="${ariaLabel}"`;
		}
	}
	html += `>`;

	// Content
	const content = getElementContent(element);
	if (content) {
		html += escapeHTML(content);
	}

	// Children
	if (element.children && element.children.length > 0) {
		html += nl;
		html += generateElements(element.children, options, indent + (options.indentation === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2)));
		html += indent;
	}

	// Closing tag
	html += `</${tag}>`;

	return html;
}

/**
 * Get appropriate HTML tag for element
 */
function getHTMLTag(element: ASTElement, options: CodeGenerationOptions): string {
	if (!options.includeSemanticHtml) {
		return 'div';
	}

	// Use semantic HTML5 tags where appropriate
	switch (element.componentType) {
		case 'heading':
			const level = (element.props as any).level || 1;
			return `h${level}`;
		case 'paragraph':
			return 'p';
		case 'text':
			return 'span';
		case 'button':
			return 'button';
		case 'container':
		case 'grid':
		case 'flex':
			return 'div';
		default:
			return 'div';
	}
}

/**
 * Get CSS class name for element
 */
function getElementClassName(element: ASTElement): string {
	// Generate class based on component type
	const baseClass = element.componentType.replace(/([A-Z])/g, '-$1').toLowerCase();
	return `baseline-${baseClass}`;
}

/**
 * Generate inline styles string
 */
function generateInlineStyles(element: ASTElement): string {
	const styles = element.styles;
	const parts: string[] = [];

	// Convert style object to CSS string
	Object.entries(styles).forEach(([key, value]) => {
		if (value !== undefined) {
			const cssKey = camelToKebab(key);
			parts.push(`${cssKey}: ${value}`);
		}
	});

	return parts.join('; ');
}

/**
 * Get element content (text content for text elements)
 */
function getElementContent(element: ASTElement): string {
	const props = element.props as any;

	switch (element.componentType) {
		case 'heading':
		case 'paragraph':
		case 'text':
			return props.text || '';
		case 'button':
			return props.text || props.label || 'Button';
		default:
			return '';
	}
}

/**
 * Get ARIA label for accessibility
 */
function getAriaLabel(element: ASTElement): string | null {
	const props = element.props as any;

	switch (element.componentType) {
		case 'button':
			return props.text || props.label || 'Button';
		case 'heading':
			return null; // Headings are self-describing
		default:
			return null;
	}
}

/**
 * Generate CSS from AST
 * This will be expanded with more sophisticated CSS generation
 */
function generateCSS(ast: ASTRoot, options: CodeGenerationOptions): string {
	let css = '';
	const nl = options.prettyPrint ? '\n' : '';
	const indent = options.prettyPrint ? '  ' : '';

	// Global reset
	css += `* {${nl}`;
	css += `${indent}margin: 0;${nl}`;
	css += `${indent}padding: 0;${nl}`;
	css += `${indent}box-sizing: border-box;${nl}`;
	css += `}${nl}${nl}`;

	// Body styles
	css += `body {${nl}`;
	css += `${indent}font-family: system-ui, -apple-system, sans-serif;${nl}`;
	css += `${indent}line-height: 1.5;${nl}`;
	css += `}${nl}${nl}`;

	// Page container
	css += `.page {${nl}`;
	css += `${indent}position: relative;${nl}`;
	css += `${indent}margin: 0 auto;${nl}`;
	css += `}${nl}${nl}`;

	// Generate styles for each component type
	const componentTypes = new Set<string>();
	ast.pages.forEach((page) => {
		collectComponentTypes(page.children || [], componentTypes);
	});

	componentTypes.forEach((type) => {
		css += generateComponentCSS(type, options);
	});

	return css;
}

/**
 * Collect unique component types from elements
 */
function collectComponentTypes(elements: ASTElement[], types: Set<string>): void {
	elements.forEach((el) => {
		types.add(el.componentType);
		if (el.children) {
			collectComponentTypes(el.children, types);
		}
	});
}

/**
 * Generate CSS for a component type
 */
function generateComponentCSS(componentType: string, options: CodeGenerationOptions): string {
	const nl = options.prettyPrint ? '\n' : '';
	const indent = options.prettyPrint ? '  ' : '';
	const className = `baseline-${componentType.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

	let css = `.${className} {${nl}`;

	// Add default styles based on component type
	switch (componentType) {
		case 'heading':
			css += `${indent}font-weight: 700;${nl}`;
			break;
		case 'paragraph':
			css += `${indent}display: block;${nl}`;
			break;
		case 'text':
			css += `${indent}display: inline;${nl}`;
			break;
		case 'button':
			css += `${indent}cursor: pointer;${nl}`;
			css += `${indent}border: none;${nl}`;
			css += `${indent}outline: none;${nl}`;
			break;
		case 'container':
		case 'grid':
		case 'flex':
			css += `${indent}display: block;${nl}`;
			break;
	}

	css += `}${nl}${nl}`;

	return css;
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
	return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (char) => map[char] || char);
}


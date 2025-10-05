/**
 * Abstract Syntax Tree (AST) Type Definitions
 * 
 * Defines the intermediate representation used for code generation.
 * The AST is a tree structure that represents the design in a format
 * that can be easily converted to HTML, CSS, Svelte, React, etc.
 * 
 * Flow: Design State → AST → HTML/CSS/Svelte
 */

import type { ComponentProps } from './components';

/**
 * Base AST Node
 * All AST nodes extend this base type
 */
export interface ASTNode {
	id: string; // Unique identifier
	type: string; // Node type discriminator
	children?: ASTNode[]; // Child nodes (for containers)
}

/**
 * Root node - represents the entire design
 */
export interface ASTRoot extends ASTNode {
	type: 'root';
	pages: ASTPage[]; // Multiple pages (one per artboard marked for publish)
	metadata: ASTMetadata; // Global metadata
}

/**
 * Page node - represents a single publishable page (from an artboard)
 */
export interface ASTPage extends ASTNode {
	type: 'page';
	name: string; // Page name (from artboard name)
	slug: string; // URL slug (generated from name)
	width: number; // Page dimensions
	height: number;
	backgroundColor: string;
	metadata?: PageMetadata; // SEO metadata
	children: ASTElement[]; // Elements on this page
}

/**
 * Element node - represents a design component
 */
export interface ASTElement extends ASTNode {
	type: 'element';
	componentType: ComponentProps['type']; // Component type (heading, paragraph, etc.)
	props: ComponentProps; // Component properties
	styles: ASTStyles; // Computed styles
	children?: ASTElement[]; // Child elements (for containers)
}

/**
 * Style information extracted from design
 */
export interface ASTStyles {
	// Layout
	position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
	display?: 'block' | 'inline-block' | 'flex' | 'grid' | 'inline';
	width?: string; // e.g., "100%", "300px"
	height?: string;
	minWidth?: string;
	minHeight?: string;
	maxWidth?: string;
	maxHeight?: string;

	// Positioning
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
	zIndex?: number;

	// Flexbox (if parent is flex)
	flex?: string;
	flexGrow?: number;
	flexShrink?: number;
	flexBasis?: string;
	alignSelf?: string;

	// Grid (if parent is grid)
	gridColumn?: string;
	gridRow?: string;
	gridArea?: string;

	// Spacing
	margin?: string;
	marginTop?: string;
	marginRight?: string;
	marginBottom?: string;
	marginLeft?: string;
	padding?: string;
	paddingTop?: string;
	paddingRight?: string;
	paddingBottom?: string;
	paddingLeft?: string;

	// Visual
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: string;
	borderStyle?: string;
	borderRadius?: string;
	boxShadow?: string;
	opacity?: number;

	// Typography (for text elements)
	fontFamily?: string;
	fontSize?: string;
	fontWeight?: string | number;
	lineHeight?: string;
	color?: string;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	textDecoration?: string;
	textTransform?: string;
	letterSpacing?: string;
	wordSpacing?: string;

	// Transform
	transform?: string;
	transformOrigin?: string;

	// Other
	overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
	cursor?: string;
	pointerEvents?: 'auto' | 'none';
}

/**
 * Global metadata for the entire design
 */
export interface ASTMetadata {
	generator: string; // "Baseline"
	version: string; // Baseline version
	generatedAt: string; // ISO timestamp
	baselineConfig?: {
		enabled: boolean;
		height: number; // Baseline grid height
	};
	cssVariables?: Record<string, string>; // Global CSS variables (colors, fonts, etc.)
}

/**
 * Page-specific metadata (SEO, etc.)
 */
export interface PageMetadata {
	title?: string; // Page title
	description?: string; // Meta description
	keywords?: string[]; // Keywords
	ogImage?: string; // Open Graph image
	ogTitle?: string;
	ogDescription?: string;
	canonicalUrl?: string;
	language?: string; // Language code (e.g., "en", "pt-BR")
}

/**
 * Code generation options
 */
export interface CodeGenerationOptions {
	// Output format
	format: 'html' | 'svelte' | 'react' | 'vue';

	// HTML options
	htmlVersion?: 'html5'; // Future: xhtml, etc.
	includeDoctype?: boolean; // Include <!DOCTYPE html>
	includeMetaTags?: boolean; // Include meta tags
	prettyPrint?: boolean; // Format with indentation
	indentation?: 'tabs' | 'spaces';
	indentSize?: number; // Spaces per indent level

	// CSS options
	cssFormat?: 'inline' | 'embedded' | 'external'; // How to include CSS
	cssMinify?: boolean; // Minify CSS
	cssPrefix?: boolean; // Add vendor prefixes
	cssVariables?: boolean; // Use CSS custom properties
	
	// JavaScript options
	includeJs?: boolean; // Include JavaScript
	jsMinify?: boolean;

	// Optimization
	optimizeImages?: boolean; // Optimize image URLs
	removeComments?: boolean; // Strip comments
	removeDuplicateStyles?: boolean; // Deduplicate CSS

	// Accessibility
	includeAriaLabels?: boolean; // Add ARIA attributes
	includeSemanticHtml?: boolean; // Use semantic HTML5 tags

	// Framework-specific options
	svelteTypeScript?: boolean; // Generate TypeScript for Svelte
	reactTypeScript?: boolean; // Generate TypeScript for React
	vueCompositionApi?: boolean; // Use Composition API for Vue
}

/**
 * Generated code output
 */
export interface GeneratedCode {
	format: CodeGenerationOptions['format'];
	files: GeneratedFile[]; // Array of files to output
	metadata: GenerationMetadata;
}

/**
 * A single generated file
 */
export interface GeneratedFile {
	path: string; // Relative path (e.g., "index.html", "styles.css")
	content: string; // File content
	type: 'html' | 'css' | 'js' | 'svelte' | 'tsx' | 'vue' | 'json'; // File type
	encoding?: 'utf-8' | 'base64'; // Encoding (default: utf-8)
}

/**
 * Metadata about the generated code
 */
export interface GenerationMetadata {
	generatedAt: string; // ISO timestamp
	pageCount: number; // Number of pages generated
	fileCount: number; // Number of files generated
	totalSize: number; // Total size in bytes
	warnings?: string[]; // Generation warnings
	errors?: string[]; // Generation errors
}

/**
 * CSS class naming strategy
 */
export type CSSNamingStrategy = 
	| 'bem' // Block Element Modifier
	| 'atomic' // Atomic/utility classes
	| 'semantic' // Semantic names based on content
	| 'component'; // Component-based (e.g., .heading-1)

/**
 * Export configuration for entire project
 */
export interface ExportConfig {
	// What to export
	includePages?: string[]; // Page IDs to export (empty = all published pages)
	includeAssets?: boolean; // Include media assets

	// Code generation options
	codeOptions: CodeGenerationOptions;

	// CSS strategy
	cssNaming?: CSSNamingStrategy;

	// Output format
	outputFormat?: 'zip' | 'files'; // ZIP archive or separate files

	// File structure
	fileStructure?: {
		htmlDir?: string; // Directory for HTML files (default: root)
		cssDir?: string; // Directory for CSS (default: "css")
		jsDir?: string; // Directory for JS (default: "js")
		assetsDir?: string; // Directory for images, etc. (default: "assets")
	};
}


/**
 * Component Type Definitions
 * Defines all component types for the Baseline design system
 */

import type { BaselineConfig } from './baseline';

/**
 * Base properties shared by all components
 */
export interface BaseComponentProps {
	id: string;
	type: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation?: number;
	opacity?: number;
	zIndex?: number;
	
	// Baseline grid integration
	snapToBaseline?: boolean;
	baselineOffset?: number; // Offset in baseline units
	
	// Styling
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
	borderRadius?: number;
	padding?: SpacingValue;
	margin?: SpacingValue;
	
	// Interaction
	onClick?: string; // Event handler (future)
	className?: string;
	customStyles?: Record<string, string>;
}

/**
 * Spacing value (can be number or baseline units)
 */
export type SpacingValue = number | {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	baseline?: boolean; // If true, values are in baseline units
};

/**
 * Typography Components
 */

export interface HeadingProps extends BaseComponentProps {
	type: 'heading';
	level: 1 | 2 | 3 | 4 | 5 | 6; // h1-h6
	text: string;
	fontFamily?: string;
	fontSize?: number; // In baseline units if snapToBaseline is true
	fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	lineHeight?: number; // In baseline units
	color?: string;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	letterSpacing?: number;
	textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ParagraphProps extends BaseComponentProps {
	type: 'paragraph';
	text: string;
	fontFamily?: string;
	fontSize?: number; // In baseline units if snapToBaseline is true
	fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	lineHeight?: number; // In baseline units (should be multiple of baseline)
	color?: string;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	letterSpacing?: number;
	maxWidth?: number;
}

export interface TextProps extends BaseComponentProps {
	type: 'text';
	text: string;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	lineHeight?: number;
	color?: string;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	letterSpacing?: number;
	textDecoration?: 'none' | 'underline' | 'line-through';
	fontStyle?: 'normal' | 'italic' | 'oblique';
}

/**
 * Layout Components
 */

export interface ContainerProps extends BaseComponentProps {
	type: 'container';
	maxWidth?: number;
	minWidth?: number;
	display?: 'block' | 'flex' | 'grid';
	alignItems?: 'start' | 'center' | 'end' | 'stretch';
	justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
	gap?: number; // In baseline units if snapToBaseline is true
	children?: string[]; // Array of child component IDs
}

export interface GridProps extends BaseComponentProps {
	type: 'grid';
	columns: number;
	rows?: number;
	columnGap?: number; // In baseline units
	rowGap?: number; // In baseline units
	autoFlow?: 'row' | 'column' | 'dense';
	alignItems?: 'start' | 'center' | 'end' | 'stretch';
	justifyItems?: 'start' | 'center' | 'end' | 'stretch';
	children?: string[];
}

export interface FlexProps extends BaseComponentProps {
	type: 'flex';
	direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
	alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
	justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
	gap?: number;
	children?: string[];
}

/**
 * Form Components
 */

export interface ButtonProps extends BaseComponentProps {
	type: 'button';
	text: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'text';
	size?: 'small' | 'medium' | 'large';
	disabled?: boolean;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: number;
	color?: string;
	hoverColor?: string;
	hoverBackgroundColor?: string;
}

export interface InputProps extends BaseComponentProps {
	type: 'input';
	inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
	placeholder?: string;
	value?: string;
	label?: string;
	disabled?: boolean;
	required?: boolean;
	fontFamily?: string;
	fontSize?: number;
	borderStyle?: 'solid' | 'dashed' | 'dotted';
	focusBorderColor?: string;
}

export interface SelectProps extends BaseComponentProps {
	type: 'select';
	options: { value: string; label: string }[];
	placeholder?: string;
	value?: string;
	label?: string;
	disabled?: boolean;
	required?: boolean;
	fontFamily?: string;
	fontSize?: number;
}

/**
 * Union type of all component props
 */
export type ComponentProps =
	| HeadingProps
	| ParagraphProps
	| TextProps
	| ContainerProps
	| GridProps
	| FlexProps
	| ButtonProps
	| InputProps
	| SelectProps;

/**
 * Component type discriminators
 */
export type ComponentType = ComponentProps['type'];

/**
 * Typography component types
 */
export type TypographyComponent = HeadingProps | ParagraphProps | TextProps;

/**
 * Layout component types
 */
export type LayoutComponent = ContainerProps | GridProps | FlexProps;

/**
 * Form component types
 */
export type FormComponent = ButtonProps | InputProps | SelectProps;

/**
 * Component category
 */
export type ComponentCategory = 'typography' | 'layout' | 'form';

/**
 * Component metadata for registry
 */
export interface ComponentMetadata {
	type: ComponentType;
	category: ComponentCategory;
	name: string;
	description: string;
	icon?: string;
	defaultProps: Partial<ComponentProps>;
	baselineAware: boolean; // Whether component respects baseline grid
}

/**
 * Property definition for component inspector
 */
export interface PropertyDefinition {
	key: string;
	label: string;
	type: 'text' | 'number' | 'select' | 'color' | 'boolean' | 'spacing';
	options?: { value: string | number; label: string }[];
	min?: number;
	max?: number;
	step?: number;
	unit?: string;
	defaultValue?: any;
	category?: string; // Group properties (e.g., "Typography", "Layout", "Appearance")
	baselineAware?: boolean; // If true, value is in baseline units
}

/**
 * Component instance (extends canvas element)
 */
export interface ComponentInstance {
	id: string;
	type: ComponentType;
	artboardId: string | null;
	props: ComponentProps;
	children?: ComponentInstance[];
}

/**
 * Default baseline-aware typography settings
 */
export interface BaselineTypographySettings {
	baselineHeight: number;
	defaultLineHeight: number; // In baseline units
	h1: { fontSize: number; lineHeight: number; fontWeight: number };
	h2: { fontSize: number; lineHeight: number; fontWeight: number };
	h3: { fontSize: number; lineHeight: number; fontWeight: number };
	h4: { fontSize: number; lineHeight: number; fontWeight: number };
	h5: { fontSize: number; lineHeight: number; fontWeight: number };
	h6: { fontSize: number; lineHeight: number; fontWeight: number };
	body: { fontSize: number; lineHeight: number; fontWeight: number };
	small: { fontSize: number; lineHeight: number; fontWeight: number };
}

/**
 * Default baseline typography settings (8px baseline)
 */
export const DEFAULT_BASELINE_TYPOGRAPHY: BaselineTypographySettings = {
	baselineHeight: 8,
	defaultLineHeight: 3, // 24px (3 × 8px)
	h1: { fontSize: 48, lineHeight: 56, fontWeight: 700 }, // 6 baseline units
	h2: { fontSize: 40, lineHeight: 48, fontWeight: 700 }, // 5 baseline units
	h3: { fontSize: 32, lineHeight: 40, fontWeight: 600 }, // 4 baseline units
	h4: { fontSize: 24, lineHeight: 32, fontWeight: 600 }, // 3 baseline units
	h5: { fontSize: 20, lineHeight: 24, fontWeight: 600 }, // 2.5 baseline units
	h6: { fontSize: 16, lineHeight: 24, fontWeight: 600 }, // 2 baseline units
	body: { fontSize: 16, lineHeight: 24, fontWeight: 400 },
	small: { fontSize: 14, lineHeight: 24, fontWeight: 400 }
};


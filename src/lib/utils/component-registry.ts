/**
 * Component Registry
 * Central registry for all available components in the design system
 */

import type {
	ComponentMetadata,
	ComponentType,
	ComponentCategory,
	PropertyDefinition
} from '$lib/types/components';

/**
 * Component registry map
 */
const componentRegistry = new Map<ComponentType, ComponentMetadata>();

/**
 * Register a component in the registry
 */
export function registerComponent(metadata: ComponentMetadata): void {
	componentRegistry.set(metadata.type, metadata);
}

/**
 * Get component metadata by type
 */
export function getComponentMetadata(type: ComponentType): ComponentMetadata | undefined {
	return componentRegistry.get(type);
}

/**
 * Get all registered components
 */
export function getAllComponents(): ComponentMetadata[] {
	return Array.from(componentRegistry.values());
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: ComponentCategory): ComponentMetadata[] {
	return Array.from(componentRegistry.values()).filter(
		(component) => component.category === category
	);
}

/**
 * Check if a component type is registered
 */
export function isComponentRegistered(type: ComponentType): boolean {
	return componentRegistry.has(type);
}

/**
 * Property definitions for each component type
 */
const propertyDefinitions = new Map<ComponentType, PropertyDefinition[]>();

/**
 * Register property definitions for a component
 */
export function registerPropertyDefinitions(
	type: ComponentType,
	properties: PropertyDefinition[]
): void {
	propertyDefinitions.set(type, properties);
}

/**
 * Get property definitions for a component type
 */
export function getPropertyDefinitions(type: ComponentType): PropertyDefinition[] {
	return propertyDefinitions.get(type) || [];
}

// ============================================================================
// Typography Components Registration
// ============================================================================

registerComponent({
	type: 'heading',
	category: 'typography',
	name: 'Heading',
	description: 'Baseline-aware heading component (H1-H6)',
	icon: '🔤',
	baselineAware: true,
	defaultProps: {
		type: 'heading',
		level: 1,
		text: 'Heading',
		fontSize: 48,
		lineHeight: 56,
		fontWeight: 700,
		color: '#000000',
		snapToBaseline: true
	}
});

registerPropertyDefinitions('heading', [
	{ key: 'text', label: 'Text', type: 'text', category: 'Content' },
	{
		key: 'level',
		label: 'Level',
		type: 'select',
		options: [
			{ value: 1, label: 'H1' },
			{ value: 2, label: 'H2' },
			{ value: 3, label: 'H3' },
			{ value: 4, label: 'H4' },
			{ value: 5, label: 'H5' },
			{ value: 6, label: 'H6' }
		],
		category: 'Content'
	},
	{ key: 'fontSize', label: 'Font Size', type: 'number', min: 8, max: 96, step: 1, unit: 'px', category: 'Typography', baselineAware: true },
	{ key: 'lineHeight', label: 'Line Height', type: 'number', min: 8, max: 128, step: 8, unit: 'px', category: 'Typography', baselineAware: true },
	{
		key: 'fontWeight',
		label: 'Font Weight',
		type: 'select',
		options: [
			{ value: 400, label: 'Normal' },
			{ value: 500, label: 'Medium' },
			{ value: 600, label: 'Semi-bold' },
			{ value: 700, label: 'Bold' },
			{ value: 800, label: 'Extra-bold' }
		],
		category: 'Typography'
	},
	{
		key: 'textAlign',
		label: 'Text Align',
		type: 'select',
		options: [
			{ value: 'left', label: 'Left' },
			{ value: 'center', label: 'Center' },
			{ value: 'right', label: 'Right' },
			{ value: 'justify', label: 'Justify' }
		],
		category: 'Typography'
	},
	{ key: 'color', label: 'Color', type: 'color', category: 'Appearance' }
]);

registerComponent({
	type: 'paragraph',
	category: 'typography',
	name: 'Paragraph',
	description: 'Baseline-aware paragraph component',
	icon: '¶',
	baselineAware: true,
	defaultProps: {
		type: 'paragraph',
		text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		fontSize: 16,
		lineHeight: 24,
		fontWeight: 400,
		color: '#333333',
		snapToBaseline: true
	}
});

registerPropertyDefinitions('paragraph', [
	{ key: 'text', label: 'Text', type: 'text', category: 'Content' },
	{ key: 'fontSize', label: 'Font Size', type: 'number', min: 8, max: 32, step: 1, unit: 'px', category: 'Typography', baselineAware: true },
	{ key: 'lineHeight', label: 'Line Height', type: 'number', min: 16, max: 48, step: 8, unit: 'px', category: 'Typography', baselineAware: true },
	{
		key: 'fontWeight',
		label: 'Font Weight',
		type: 'select',
		options: [
			{ value: 300, label: 'Light' },
			{ value: 400, label: 'Normal' },
			{ value: 500, label: 'Medium' },
			{ value: 600, label: 'Semi-bold' }
		],
		category: 'Typography'
	},
	{
		key: 'textAlign',
		label: 'Text Align',
		type: 'select',
		options: [
			{ value: 'left', label: 'Left' },
			{ value: 'center', label: 'Center' },
			{ value: 'right', label: 'Right' },
			{ value: 'justify', label: 'Justify' }
		],
		category: 'Typography'
	},
	{ key: 'color', label: 'Color', type: 'color', category: 'Appearance' },
	{ key: 'maxWidth', label: 'Max Width', type: 'number', min: 200, max: 1200, step: 10, unit: 'px', category: 'Layout' }
]);

registerComponent({
	type: 'text',
	category: 'typography',
	name: 'Text',
	description: 'Inline text component',
	icon: 'T',
	baselineAware: true,
	defaultProps: {
		type: 'text',
		text: 'Text',
		fontSize: 16,
		lineHeight: 24,
		fontWeight: 400,
		color: '#000000',
		snapToBaseline: true
	}
});

// ============================================================================
// Layout Components Registration
// ============================================================================

registerComponent({
	type: 'container',
	category: 'layout',
	name: 'Container',
	description: 'Flexible container component',
	icon: '⬜',
	baselineAware: false,
	defaultProps: {
		type: 'container',
		display: 'block',
		padding: 16,
		backgroundColor: '#ffffff'
	}
});

registerComponent({
	type: 'grid',
	category: 'layout',
	name: 'Grid',
	description: 'CSS Grid layout component',
	icon: '⊞',
	baselineAware: true,
	defaultProps: {
		type: 'grid',
		columns: 3,
		columnGap: 16,
		rowGap: 16,
		snapToBaseline: true
	}
});

registerComponent({
	type: 'flex',
	category: 'layout',
	name: 'Flex',
	description: 'Flexbox layout component',
	icon: '⬌',
	baselineAware: true,
	defaultProps: {
		type: 'flex',
		direction: 'row',
		gap: 16,
		alignItems: 'start',
		snapToBaseline: true
	}
});

// ============================================================================
// Form Components Registration
// ============================================================================

registerComponent({
	type: 'button',
	category: 'form',
	name: 'Button',
	description: 'Interactive button component',
	icon: '🔘',
	baselineAware: true,
	defaultProps: {
		type: 'button',
		text: 'Button',
		variant: 'primary',
		size: 'medium',
		fontSize: 16,
		fontWeight: 600,
		backgroundColor: '#007bff',
		color: '#ffffff',
		snapToBaseline: true
	}
});

registerPropertyDefinitions('button', [
	{ key: 'text', label: 'Text', type: 'text', category: 'Content' },
	{
		key: 'variant',
		label: 'Variant',
		type: 'select',
		options: [
			{ value: 'primary', label: 'Primary' },
			{ value: 'secondary', label: 'Secondary' },
			{ value: 'outline', label: 'Outline' },
			{ value: 'text', label: 'Text' }
		],
		category: 'Style'
	},
	{
		key: 'size',
		label: 'Size',
		type: 'select',
		options: [
			{ value: 'small', label: 'Small' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'large', label: 'Large' }
		],
		category: 'Style'
	},
	{ key: 'backgroundColor', label: 'Background', type: 'color', category: 'Appearance' },
	{ key: 'color', label: 'Text Color', type: 'color', category: 'Appearance' }
]);

registerComponent({
	type: 'input',
	category: 'form',
	name: 'Input',
	description: 'Text input field',
	icon: '📝',
	baselineAware: true,
	defaultProps: {
		type: 'input',
		inputType: 'text',
		placeholder: 'Enter text...',
		fontSize: 16,
		snapToBaseline: true
	}
});

registerComponent({
	type: 'select',
	category: 'form',
	name: 'Select',
	description: 'Dropdown select field',
	icon: '▼',
	baselineAware: true,
	defaultProps: {
		type: 'select',
		options: [
			{ value: 'option1', label: 'Option 1' },
			{ value: 'option2', label: 'Option 2' },
			{ value: 'option3', label: 'Option 3' }
		],
		placeholder: 'Select an option...',
		fontSize: 16,
		snapToBaseline: true
	}
});


/**
 * Baseline Library - Public API
 * Export all public components, stores, utilities, and types
 */

// ============================================================================
// Components
// ============================================================================

// Canvas Components
export { default as Canvas } from './components/canvas/Canvas.svelte';
export { default as ArtboardComponent } from './components/canvas/Artboard.svelte';
export { default as ElementComponent } from './components/canvas/Element.svelte';

// Baseline Components
export { default as BaselineGrid } from './components/baseline/BaselineGrid.svelte';

// UI Components
export { default as HistoryPanel } from './components/ui/HistoryPanel.svelte';
export { default as ProjectManager } from './components/ui/ProjectManager.svelte';

// Design Components - Typography
export { default as Heading } from './components/design/Heading.svelte';
export { default as Paragraph } from './components/design/Paragraph.svelte';
export { default as Text } from './components/design/Text.svelte';

// Design Components - Layout
export { default as Container } from './components/design/Container.svelte';
export { default as Grid } from './components/design/Grid.svelte';
export { default as Flex } from './components/design/Flex.svelte';

// Design Components - Form
export { default as Button } from './components/design/Button.svelte';
export { default as Input } from './components/design/Input.svelte';
export { default as Select } from './components/design/Select.svelte';

// ============================================================================
// Stores
// ============================================================================

// Baseline Grid Store
export {
	baselineConfig,
	setBaselineHeight,
	toggleBaselineSnap,
	toggleBaselineGrid,
	updateBaselineAppearance
} from './stores/baseline';

// Event Store (Event Sourcing)
export {
	eventHistory,
	addEvent,
	undo,
	redo,
	clearHistory,
	canUndo,
	canRedo,
	currentEvents,
	historyStats
} from './stores/event-store';

// Design Store (Canvas State Management)
export {
	canvasState,
	selectedElementIds,
	updateCanvasConfig,
	addArtboard,
	updateArtboard,
	deleteArtboard,
	moveArtboard,
	resizeArtboard,
	addElement,
	updateElement,
	deleteElement,
	moveElement,
	resizeElement,
	moveElements,
	deleteElements,
	selectElement,
	clearSelection,
	selectMultiple
} from './stores/design-store';

// Project Store (Persistence)
export {
	currentProject,
	autoSaveConfig,
	lastSaved,
	hasUnsavedChanges,
	isProjectLoaded,
	currentProjectMetadata,
	createProject,
	saveCurrentProject,
	loadProject,
	closeProject,
	deleteProject,
	renameCurrentProject,
	updateCurrentProjectDescription,
	listProjects,
	configureAutoSave,
	saveManually
} from './stores/project-store';

// ============================================================================
// Utilities
// ============================================================================

// Baseline Utilities
export {
	snapToBaseline,
	snapToBaselineDetailed,
	pixelsToBaselineUnits,
	baselineUnitsToPixels,
	isAlignedToBaseline,
	getNearestBaselineLines,
	snapDimensionToBaseline
} from './utils/baseline';

// Event Reducer
export {
	applyEvent,
	applyEvents,
	replayEvents
} from './utils/event-reducer';

// Storage Utilities (IndexedDB)
export {
	initDB,
	saveProject,
	loadProject as loadProjectFromDB,
	deleteProject as deleteProjectFromDB,
	getAllProjects,
	getAllProjectMetadata,
	projectExists,
	updateProjectMetadata,
	getStorageStats,
	clearAllData,
	exportProjectAsJSON,
	importProjectFromJSON
} from './utils/storage';

// Component Registry
export {
	registerComponent,
	getComponentMetadata,
	getAllComponents,
	getComponentsByCategory,
	isComponentRegistered,
	registerPropertyDefinitions,
	getPropertyDefinitions
} from './utils/component-registry';

// ============================================================================
// Types
// ============================================================================

// Baseline Types
export type {
	BaselineConfig,
	SnapResult
} from './types/baseline';

// Canvas Types
export type {
	CanvasConfig,
	Artboard,
	CanvasElement,
	CanvasState
} from './types/canvas';

// Event Types
export type {
	BaseEvent,
	CanvasConfigUpdatedEvent,
	ArtboardAddedEvent,
	ArtboardUpdatedEvent,
	ArtboardDeletedEvent,
	ArtboardMovedEvent,
	ArtboardResizedEvent,
	ElementAddedEvent,
	ElementUpdatedEvent,
	ElementDeletedEvent,
	ElementMovedEvent,
	ElementResizedEvent,
	ElementsMovedEvent,
	ElementsDeletedEvent,
	SelectionChangedEvent,
	DesignEvent,
	EventHistory,
	EventPayload
} from './types/events';

// Project Types
export type {
	Project,
	ProjectMetadata,
	CreateProjectInput,
	UpdateProjectInput,
	AutoSaveConfig
} from './types/project';

export {
	CURRENT_PROJECT_VERSION,
	DB_NAME,
	DB_VERSION,
	PROJECTS_STORE,
	DEFAULT_AUTOSAVE_CONFIG
} from './types/project';

// Component Types
export type {
	BaseComponentProps,
	SpacingValue,
	HeadingProps,
	ParagraphProps,
	TextProps,
	ContainerProps,
	GridProps,
	FlexProps,
	ButtonProps,
	InputProps,
	SelectProps,
	ComponentProps,
	ComponentType,
	TypographyComponent,
	LayoutComponent,
	FormComponent,
	ComponentCategory,
	ComponentMetadata,
	PropertyDefinition,
	ComponentInstance,
	BaselineTypographySettings
} from './types/components';

export {
	DEFAULT_BASELINE_TYPOGRAPHY
} from './types/components';

// Code Generation Utilities
export { parseDesignToAST, validateAST, optimizeAST, printAST } from './utils/ast-parser';
export { generateHTML } from './utils/html-generator';
export { generateCSS, addVendorPrefixes, optimizeCSS } from './utils/css-generator';

// AST Types
export type {
	ASTNode,
	ASTRoot,
	ASTPage,
	ASTElement,
	ASTStyles,
	ASTMetadata,
	PageMetadata,
	CodeGenerationOptions,
	GeneratedCode,
	GeneratedFile,
	GenerationMetadata,
	CSSNamingStrategy,
	ExportConfig
} from './types/ast';

/**
 * Event Reducer - Computes design state from events
 *
 * This is a pure function that takes a list of events and produces
 * the current design state. This allows us to replay events for undo/redo
 * and to reconstruct state from the event log.
 */

import type {
	DesignEvent,
	DesignState,
	Element,
	Page,
	Component,
	CreateElementEvent,
	UpdateElementEvent,
	DeleteElementEvent,
	MoveElementEvent,
	ResizeElementEvent,
	ReorderElementEvent,
	UpdateStylesEvent,
	UpdateTypographyEvent,
	UpdateSpacingEvent,
	ToggleFrameEvent,
	CreatePageEvent,
	UpdatePageEvent,
	DeletePageEvent,
	ReorderPagesEvent,
	CreateComponentEvent,
	UpdateComponentEvent,
	DeleteComponentEvent,
	InstanceComponentEvent
} from '$lib/types/events';

/**
 * Initial empty state
 */
export function getInitialState(): DesignState {
	return {
		pages: {},
		elements: {},
		components: {},
		pageOrder: [],
		currentPageId: null,
		selectedElementIds: []
	};
}

/**
 * Reduce a list of events into the current design state
 */
export function reduceEvents(events: DesignEvent[], initialState?: DesignState): DesignState {
	let state = initialState || getInitialState();

	for (const event of events) {
		state = reduceEvent(state, event);
	}

	return state;
}

/**
 * Reduce a single event
 */
export function reduceEvent(state: DesignState, event: DesignEvent): DesignState {
	switch (event.type) {
		// Element operations
		case 'CREATE_ELEMENT':
			return handleCreateElement(state, event);
		case 'UPDATE_ELEMENT':
			return handleUpdateElement(state, event);
		case 'DELETE_ELEMENT':
			return handleDeleteElement(state, event);
		case 'MOVE_ELEMENT':
			return handleMoveElement(state, event);
		case 'RESIZE_ELEMENT':
			return handleResizeElement(state, event);
		case 'REORDER_ELEMENT':
			return handleReorderElement(state, event);

		// Style operations
		case 'UPDATE_STYLES':
			return handleUpdateStyles(state, event);
		case 'UPDATE_TYPOGRAPHY':
			return handleUpdateTypography(state, event);
		case 'UPDATE_SPACING':
			return handleUpdateSpacing(state, event);
		case 'TOGGLE_FRAME':
			return handleToggleFrame(state, event);

		// Page operations
		case 'CREATE_PAGE':
			return handleCreatePage(state, event);
		case 'UPDATE_PAGE':
			return handleUpdatePage(state, event);
		case 'DELETE_PAGE':
			return handleDeletePage(state, event);
		case 'REORDER_PAGES':
			return handleReorderPages(state, event);

		// Component operations
		case 'CREATE_COMPONENT':
			return handleCreateComponent(state, event);
		case 'UPDATE_COMPONENT':
			return handleUpdateComponent(state, event);
		case 'DELETE_COMPONENT':
			return handleDeleteComponent(state, event);
		case 'INSTANCE_COMPONENT':
			return handleInstanceComponent(state, event);

		default:
			return state;
	}
}

// ============================================================================
// Element Handlers
// ============================================================================

function handleCreateElement(state: DesignState, event: CreateElementEvent): DesignState {
	const { elementId, parentId, pageId, elementType, position, size, styles, content } =
		event.payload;

	const element: Element = {
		id: elementId,
		type: elementType,
		parentId,
		pageId,
		position,
		size,
		styles: styles || {},
		typography: {},
		spacing: {},
		content,
		children: [],
		zIndex: 0
	};

	// Add element to state
	const newElements = { ...state.elements, [elementId]: element };

	// Add element to parent's children
	if (parentId && newElements[parentId]) {
		newElements[parentId] = {
			...newElements[parentId],
			children: [...newElements[parentId].children, elementId]
		};
	}

	// Add element to page's root elements if no parent
	const newPages = { ...state.pages };
	if (!parentId && newPages[pageId]) {
		newPages[pageId] = {
			...newPages[pageId],
			elements: [...newPages[pageId].elements, elementId]
		};
	}

	return {
		...state,
		elements: newElements,
		pages: newPages
	};
}

function handleUpdateElement(state: DesignState, event: UpdateElementEvent): DesignState {
	const { elementId, changes } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				...changes
			}
		}
	};
}

function handleDeleteElement(state: DesignState, event: DeleteElementEvent): DesignState {
	const { elementId } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	const newElements = { ...state.elements };
	const newPages = { ...state.pages };

	// Remove from parent's children
	if (element.parentId && newElements[element.parentId]) {
		newElements[element.parentId] = {
			...newElements[element.parentId],
			children: newElements[element.parentId].children.filter((id) => id !== elementId)
		};
	}

	// Remove from page's root elements
	if (!element.parentId && newPages[element.pageId]) {
		newPages[element.pageId] = {
			...newPages[element.pageId],
			elements: newPages[element.pageId].elements.filter((id) => id !== elementId)
		};
	}

	// Recursively delete children
	const deleteRecursive = (id: string) => {
		const el = newElements[id];
		if (el) {
			el.children.forEach(deleteRecursive);
			delete newElements[id];
		}
	};

	element.children.forEach(deleteRecursive);
	delete newElements[elementId];

	// Remove from selection
	const newSelectedElementIds = state.selectedElementIds.filter((id) => id !== elementId);

	return {
		...state,
		elements: newElements,
		pages: newPages,
		selectedElementIds: newSelectedElementIds
	};
}

function handleMoveElement(state: DesignState, event: MoveElementEvent): DesignState {
	const { elementId, position } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				position
			}
		}
	};
}

function handleResizeElement(state: DesignState, event: ResizeElementEvent): DesignState {
	const { elementId, size, position } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				size,
				// Update position if provided (for N/W handles)
				...(position && { position })
			}
		}
	};
}

function handleReorderElement(state: DesignState, event: ReorderElementEvent): DesignState {
	const { elementId, newParentId, newIndex } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	const newElements = { ...state.elements };
	const newPages = { ...state.pages };

	// Remove from old parent
	if (element.parentId && newElements[element.parentId]) {
		newElements[element.parentId] = {
			...newElements[element.parentId],
			children: newElements[element.parentId].children.filter((id) => id !== elementId)
		};
	} else if (!element.parentId && newPages[element.pageId]) {
		newPages[element.pageId] = {
			...newPages[element.pageId],
			elements: newPages[element.pageId].elements.filter((id) => id !== elementId)
		};
	}

	// Update element parent
	newElements[elementId] = {
		...element,
		parentId: newParentId,
		zIndex: newIndex
	};

	// Add to new parent
	if (newParentId && newElements[newParentId]) {
		const children = [...newElements[newParentId].children];
		children.splice(newIndex, 0, elementId);
		newElements[newParentId] = {
			...newElements[newParentId],
			children
		};
	} else if (!newParentId && newPages[element.pageId]) {
		const elements = [...newPages[element.pageId].elements];
		elements.splice(newIndex, 0, elementId);
		newPages[element.pageId] = {
			...newPages[element.pageId],
			elements
		};
	}

	return {
		...state,
		elements: newElements,
		pages: newPages
	};
}

// ============================================================================
// Style Handlers
// ============================================================================

function handleUpdateStyles(state: DesignState, event: UpdateStylesEvent): DesignState {
	const { elementId, styles } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				styles: {
					...element.styles,
					...styles
				}
			}
		}
	};
}

function handleUpdateTypography(state: DesignState, event: UpdateTypographyEvent): DesignState {
	const { elementId, typography } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				typography: {
					...element.typography,
					...typography
				}
			}
		}
	};
}

function handleUpdateSpacing(state: DesignState, event: UpdateSpacingEvent): DesignState {
	const { elementId, spacing } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				spacing: {
					...element.spacing,
					...spacing
				}
			}
		}
	};
}

function handleToggleFrame(state: DesignState, event: ToggleFrameEvent): DesignState {
	const { elementId, isFrame, frameName, breakpointWidth, isPublished } = event.payload;
	const element = state.elements[elementId];

	if (!element) return state;

	return {
		...state,
		elements: {
			...state.elements,
			[elementId]: {
				...element,
				isFrame,
				frameName: frameName || element.frameName,
				breakpointWidth: breakpointWidth || element.breakpointWidth || 1440,
				isPublished: isPublished !== undefined ? isPublished : element.isPublished || false
			}
		}
	};
}

// ============================================================================
// Page Handlers
// ============================================================================

function handleCreatePage(state: DesignState, event: CreatePageEvent): DesignState {
	const { pageId, name, slug, width = 1440, height = 900 } = event.payload;

	const page: Page = {
		id: pageId,
		name,
		slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
		width,
		height,
		elements: []
	};

	return {
		...state,
		pages: {
			...state.pages,
			[pageId]: page
		},
		pageOrder: [...state.pageOrder, pageId],
		currentPageId: state.currentPageId || pageId // Set as current if first page
	};
}

function handleUpdatePage(state: DesignState, event: UpdatePageEvent): DesignState {
	const { pageId, changes } = event.payload;
	const page = state.pages[pageId];

	if (!page) return state;

	return {
		...state,
		pages: {
			...state.pages,
			[pageId]: {
				...page,
				...changes
			}
		}
	};
}

function handleDeletePage(state: DesignState, event: DeletePageEvent): DesignState {
	const { pageId } = event.payload;
	const page = state.pages[pageId];

	if (!page) return state;

	const newPages = { ...state.pages };
	delete newPages[pageId];

	// Delete all elements on this page
	const newElements = { ...state.elements };
	Object.keys(newElements).forEach((elementId) => {
		if (newElements[elementId].pageId === pageId) {
			delete newElements[elementId];
		}
	});

	// Remove from page order
	const newPageOrder = state.pageOrder.filter((id) => id !== pageId);

	// Update current page if deleted
	let newCurrentPageId = state.currentPageId;
	if (state.currentPageId === pageId) {
		newCurrentPageId = newPageOrder.length > 0 ? newPageOrder[0] : null;
	}

	return {
		...state,
		pages: newPages,
		elements: newElements,
		pageOrder: newPageOrder,
		currentPageId: newCurrentPageId
	};
}

function handleReorderPages(state: DesignState, event: ReorderPagesEvent): DesignState {
	const { pageIds } = event.payload;

	return {
		...state,
		pageOrder: pageIds
	};
}

// ============================================================================
// Component Handlers
// ============================================================================

function handleCreateComponent(state: DesignState, event: CreateComponentEvent): DesignState {
	const { componentId, name, elementIds } = event.payload;

	const component: Component = {
		id: componentId,
		name,
		elementIds
	};

	return {
		...state,
		components: {
			...state.components,
			[componentId]: component
		}
	};
}

function handleUpdateComponent(state: DesignState, event: UpdateComponentEvent): DesignState {
	const { componentId, changes } = event.payload;
	const component = state.components[componentId];

	if (!component) return state;

	return {
		...state,
		components: {
			...state.components,
			[componentId]: {
				...component,
				...changes
			}
		}
	};
}

function handleDeleteComponent(state: DesignState, event: DeleteComponentEvent): DesignState {
	const { componentId } = event.payload;

	const newComponents = { ...state.components };
	delete newComponents[componentId];

	return {
		...state,
		components: newComponents
	};
}

function handleInstanceComponent(
	state: DesignState,
	event: InstanceComponentEvent
): DesignState {
	const { componentId, instanceId, pageId, position } = event.payload;
	const component = state.components[componentId];

	if (!component) return state;

	// Clone all elements from the component
	const newElements = { ...state.elements };
	const idMap = new Map<string, string>(); // Old ID -> New ID

	// First pass: create new IDs for all elements
	component.elementIds.forEach((oldId) => {
		const newId = `${instanceId}-${oldId}`;
		idMap.set(oldId, newId);
	});

	// Second pass: clone elements with updated IDs and references
	component.elementIds.forEach((oldId) => {
		const oldElement = state.elements[oldId];
		if (!oldElement) return;

		const newId = idMap.get(oldId)!;
		const newParentId = oldElement.parentId ? idMap.get(oldElement.parentId) || null : null;

		newElements[newId] = {
			...oldElement,
			id: newId,
			parentId: newParentId,
			pageId,
			position: {
				x: position.x + oldElement.position.x,
				y: position.y + oldElement.position.y
			},
			children: oldElement.children.map((childId) => idMap.get(childId) || childId)
		};
	});

	// Add root elements to page
	const rootElementIds = component.elementIds
		.filter((id) => !state.elements[id]?.parentId)
		.map((id) => idMap.get(id)!);

	const newPages = { ...state.pages };
	if (newPages[pageId]) {
		newPages[pageId] = {
			...newPages[pageId],
			elements: [...newPages[pageId].elements, ...rootElementIds]
		};
	}

	return {
		...state,
		elements: newElements,
		pages: newPages
	};
}

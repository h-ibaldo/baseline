# Event Sourcing System

## Overview

Baseline uses **Event Sourcing** for state management. This provides:

- **Perfect undo/redo**: Navigate through complete design history
- **Time-travel debugging**: Replay events to any point in time
- **Complete audit trail**: Every change is recorded
- **Easy sync** (future): Sync events, not full state

## Architecture

### Core Concept

```typescript
// Instead of directly mutating state:
state.elements.push(newElement); // ❌ Don't do this

// We dispatch events:
addEvent({ type: 'ELEMENT_ADDED', element: newElement }); // ✅ Do this

// State is derived from events:
currentState = events.reduce(applyEvent, initialState);
```

### Key Components

1. **Event Types** (`src/lib/types/events.ts`)
   - Defines all possible design events
   - Artboard events, Element events, Configuration events
   - TypeScript discriminated unions for type safety

2. **Event Store** (`src/lib/stores/event-store.ts`)
   - Manages event history
   - Tracks current position (for undo/redo)
   - Provides undo/redo functionality

3. **Event Reducer** (`src/lib/utils/event-reducer.ts`)
   - Pure functions that apply events to state
   - `applyEvent(state, event) => newState`
   - No side effects, fully testable

4. **Design Store** (`src/lib/stores/design-store.ts`)
   - Public API for canvas operations
   - Dispatches events for all actions
   - Derives current state from events

## Usage

### Adding Elements

```typescript
import { addElement } from '$lib/stores/design-store';

// Add a new element
const elementId = addElement({
  type: 'box',
  artboardId: 'artboard-1',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  opacity: 1,
  rotation: 0
});
```

### Moving Elements

```typescript
import { moveElement } from '$lib/stores/design-store';

// Move an element
moveElement('element-1', 150, 200);
```

### Undo/Redo

```typescript
import { undo, redo, canUndo, canRedo } from '$lib/stores/event-store';

// Undo last action
if ($canUndo) {
  undo();
}

// Redo
if ($canRedo) {
  redo();
}
```

### Accessing Current State

```typescript
import { canvasState } from '$lib/stores/design-store';

// Subscribe to state changes
$: artboards = $canvasState.artboards;
$: elements = $canvasState.elements;
```

## Event Types

### Artboard Events

- `ARTBOARD_ADDED` - Add new artboard
- `ARTBOARD_UPDATED` - Update artboard properties
- `ARTBOARD_DELETED` - Delete artboard (and its elements)
- `ARTBOARD_MOVED` - Move artboard on canvas
- `ARTBOARD_RESIZED` - Change artboard dimensions

### Element Events

- `ELEMENT_ADDED` - Add new element
- `ELEMENT_UPDATED` - Update element properties
- `ELEMENT_DELETED` - Delete element
- `ELEMENT_MOVED` - Move element
- `ELEMENT_RESIZED` - Resize element
- `ELEMENTS_MOVED` - Move multiple elements (for group operations)
- `ELEMENTS_DELETED` - Delete multiple elements

### Configuration Events

- `CANVAS_CONFIG_UPDATED` - Update canvas configuration

## Testing

Comprehensive test suite with 30+ tests covering:

- Event reducer correctness
- Undo/redo functionality
- Event history management
- State immutability
- Edge cases

Run tests:

```bash
npm test
```

## Performance Considerations

### Current Implementation (MVP)

- Replay all events on every undo/redo
- Suitable for designs with < 1000 events
- Simple and easy to debug

### Future Optimizations (if needed)

1. **Snapshots**: Take state snapshots every N events
   - Replay from nearest snapshot instead of beginning
   - Reduces replay time for large histories

2. **Event Compression**: Merge sequential similar events
   - Multiple ELEMENT_MOVED events → single event with final position
   - Reduces event count

3. **Lazy Replay**: Only replay visible/active artboards
   - Skip events for hidden artboards
   - Improves performance with many artboards

## Undo/Redo Implementation

```typescript
// Event history structure
interface EventHistory {
  events: DesignEvent[];      // All events
  currentIndex: number;        // Current position (-1 = empty)
}

// Undo: Move currentIndex back
function undo() {
  if (currentIndex > -1) {
    currentIndex--;
    // State automatically updates via derived store
  }
}

// Redo: Move currentIndex forward
function redo() {
  if (currentIndex < events.length - 1) {
    currentIndex++;
    // State automatically updates via derived store
  }
}

// Current state is always derived from events up to currentIndex
currentState = applyEvents(initialState, events.slice(0, currentIndex + 1));
```

## Future: IndexedDB Persistence

Events will be persisted to IndexedDB for:

- **Local-first**: Designs saved locally, work offline
- **Fast load**: Load recent events, lazy-load history
- **Sync ready**: Events can be synced to cloud later

```typescript
// Future implementation
interface PersistedProject {
  id: string;
  name: string;
  events: DesignEvent[];
  createdAt: number;
  updatedAt: number;
}
```

## Future: Cloud Sync

Events can be synced across devices:

1. **Local changes**: Events stored in IndexedDB
2. **Sync**: Upload events to server
3. **Merge**: Use CRDTs to resolve conflicts
4. **Replay**: Download and replay events on other devices

## Best Practices

### DO ✅

- Always dispatch events for state changes
- Use descriptive event types
- Keep events small and focused
- Write tests for custom event types

### DON'T ❌

- Don't mutate state directly
- Don't skip events for "simple" changes
- Don't store derived data in events
- Don't make events depend on each other

## Example: Complete Workflow

```typescript
import {
  canvasState,
  addArtboard,
  addElement,
  moveElement,
  deleteElement
} from '$lib/stores/design-store';
import { undo, redo } from '$lib/stores/event-store';

// 1. Add artboard
const artboardId = addArtboard({
  name: 'Desktop',
  x: 100,
  y: 100,
  width: 1200,
  height: 800,
  backgroundColor: '#ffffff',
  showGrid: true,
  isPublishTarget: true
});

// 2. Add element
const elementId = addElement({
  type: 'box',
  artboardId,
  x: 50,
  y: 50,
  width: 200,
  height: 150,
  opacity: 1,
  rotation: 0
});

// 3. Move element
moveElement(elementId, 100, 100);

// 4. Undo move
undo(); // Element back at (50, 50)

// 5. Redo move
redo(); // Element at (100, 100)

// 6. Delete element
deleteElement(elementId);

// 7. Undo delete - element restored!
undo();
```

## Debugging

Use the History Panel to inspect events:

```svelte
<script>
  import HistoryPanel from '$lib/components/ui/HistoryPanel.svelte';
</script>

<HistoryPanel />
```

Or access event history programmatically:

```typescript
import { eventHistory, historyStats } from '$lib/stores/event-store';

// Get all events
console.log($eventHistory.events);

// Get statistics
console.log($historyStats);
```

## References

- [Event Sourcing by Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS and Event Sourcing](https://cqrs.wordpress.com/documents/events-as-storage-mechanism/)
- [Architecture Documentation](../planning/architecture.md)


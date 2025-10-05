# System Architecture

## Overview

Baseline is built as a modern web application using SvelteKit and TypeScript, designed to be scalable, maintainable, and extensible.

## Technology Stack

### Frontend
- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: CSS with CSS Variables
- **Build Tool**: Vite
- **Package Manager**: npm

### AI Development Tools
- **Code Generation**: ChatGPT, Claude, GitHub Copilot
- **Documentation**: AI writing assistants
- **Testing**: AI test generation tools
- **Code Review**: AI code analysis tools
- **Refactoring**: AI code optimization tools

### Backend (Future - Optional)
- **Architecture**: Local-first with optional cloud sync
- **Primary Storage**: IndexedDB (browser-based, no server required)
- **Cloud Sync** (Optional):
  - **Runtime**: Node.js or serverless (Cloudflare Workers, Deno Deploy)
  - **Database**: SQLite (simple) or PostgreSQL (if needed)
  - **Sync Protocol**: Event-based sync (CRDTs for conflict resolution)
  - **Authentication**: JWT-based or OAuth
  - **File Storage**: Local filesystem or optional cloud (S3, R2)
- **Philosophy**: You own your data. Server is optional for sync/collaboration only.

### Development Tools
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, Playwright
- **Documentation**: Markdown

## Project Structure

```
baseline/
├── src/
│   ├── routes/           # SvelteKit routes and pages
│   ├── lib/              # Reusable components and utilities
│   │   ├── components/   # UI components
│   │   │   ├── canvas/   # Canvas-related components
│   │   │   ├── baseline/ # Baseline grid components
│   │   │   └── ui/       # General UI components
│   │   ├── stores/       # Svelte stores for state management
│   │   │   ├── design.ts      # Design state (event sourcing)
│   │   │   ├── baseline.ts    # Baseline grid config
│   │   │   └── history.ts     # Undo/redo history
│   │   ├── utils/        # Utility functions
│   │   │   ├── baseline.ts    # Baseline calculations
│   │   │   ├── ast.ts         # AST code generation
│   │   │   └── storage.ts     # IndexedDB wrapper
│   │   ├── workers/      # Web Workers
│   │   │   └── code-generator.ts  # AST generation worker
│   │   └── types/        # TypeScript type definitions
│   │       ├── baseline.ts    # Baseline grid types
│   │       ├── design.ts      # Design state types
│   │       └── events.ts      # Event sourcing types
│   ├── app.html          # HTML template
│   └── app.d.ts          # Global type definitions
├── static/               # Static assets
├── docs/                 # Documentation
│   ├── planning/         # Project planning documents
│   ├── development/      # Development guides
│   └── api/              # API documentation
├── tests/                # Test files
└── public/               # Public assets
```

## Core Components

### 1. Design Canvas
- **Purpose**: Main design interface where you design with actual web code
- **Technology**: DOM-based approach using Svelte components (not Canvas API)
- **Architecture**: Infinite canvas with multiple artboards (Figma/Illustrator style)
- **Rationale**: What you see IS the code - eliminates design-to-code abstraction

#### Canvas Hierarchy
```
Canvas (Infinite Viewport)
  ├─ Artboard 1 (e.g., Desktop 1920×1080)
  │   └─ Elements (boxes, text, images)
  ├─ Artboard 2 (e.g., Mobile 375×812)
  │   └─ Elements
  └─ Loose Elements (outside artboards)
```

#### Features
- **Infinite Canvas**: Pan and zoom around unlimited workspace
- **Multiple Artboards**: Up to 10 artboards per canvas (performance monitored)
- **Flexible Layout**: Elements can exist inside or outside artboards
- **Per-Artboard Grid**: Each artboard has independent grid settings
- **Direct Manipulation**: Real HTML/CSS elements, not rendered graphics
- **Multi-Export**: Export selected artboards individually or in batch
- **Real-time Preview**: It's already real HTML/CSS, no conversion needed

### 2. Component Library
- **Purpose**: Reusable UI components
- **Technology**: Svelte components with TypeScript
- **Features**: Customizable, themeable, responsive
- **Architecture**: Components are both design tools AND output code

### 3. Code Generator
- **Purpose**: Generate production-ready code from design
- **Technology**: AST-based code generation
- **Architecture**:
  - Parse design tree → Generate Abstract Syntax Tree
  - AST → Clean, optimized code output
  - Support multiple output formats (HTML/CSS, JSX, Svelte, Vue)
- **Features**: 
  - Clean, semantic HTML
  - Optimized CSS (no redundancy)
  - TypeScript type definitions
  - Customizable code style
- **Performance**: Runs in Web Worker for non-blocking generation

### 4. Theme System
- **Purpose**: Visual identity management
- **Technology**: CSS Variables and design tokens
- **Features**: Color schemes, typography, spacing, components
- **Architecture**: Token-based system with inheritance

### 5. Baseline Grid System
- **Purpose**: Typography and layout alignment system (like InDesign)
- **Technology**: CSS Grid + Custom calculation engine
- **Architecture**:
  ```typescript
  interface BaselineGridConfig {
    baselineHeight: number;      // User-defined (e.g., 4px, 8px, 12px)
    snapToBaseline: boolean;     // Global toggle (default: true)
    showGrid: boolean;           // Visual grid toggle (default: true)
    gridColor: string;           // Customizable grid color
    gridOpacity: number;         // Grid visibility (0-1)
  }
  
  interface ComponentBaselineConfig {
    snapToBaseline?: boolean;    // Per-component override
    baselineMultiplier?: number; // Custom baseline fraction
  }
  ```
- **Features**:
  - **User-defined baseline**: Complete freedom to set baseline height
  - **Global snap toggle**: Turn snap on/off for entire project
  - **Per-component override**: Individual components can ignore baseline
  - **Visual grid**: Toggleable baseline grid overlay
  - **Customizable appearance**: Grid color and opacity
  - **Fractional system**: Heights, paddings, margins in baseline fractions
- **Snap Behavior** (when enabled):
  - All elements snap to baseline by default
  - Heights must be multiples of baseline
  - Paddings/margins must be multiples of baseline
  - Line-height must align to baseline
  - Components built to respect baseline constraints
- **Calculation Engine**:
  ```typescript
  // Convert any value to baseline units
  function toBaselineUnits(pixels: number, baselineHeight: number): number {
    return Math.round(pixels / baselineHeight);
  }
  
  // Snap value to nearest baseline
  function snapToBaseline(value: number, baselineHeight: number): number {
    return Math.round(value / baselineHeight) * baselineHeight;
  }
  
  // Validate if value aligns to baseline
  function isAlignedToBaseline(value: number, baselineHeight: number): boolean {
    return value % baselineHeight === 0;
  }
  ```
- **Visual Feedback**:
  - Grid lines rendered as CSS background or SVG overlay
  - Highlight non-aligned elements when snap is enabled
  - Show baseline measurements in inspector
  - Snap indicators during drag operations

### 6. Plugin System (Future)
- **Purpose**: Extensibility and customization
- **Technology**: Module system with TypeScript
- **Architecture**: Trusted plugins only initially (no sandboxing in MVP)
- **Features**: Third-party integrations, custom components, themes
- **Security**: Will add sandboxing (Web Workers/iframes) when accepting external plugins

## Data Flow

### Design Process
1. User manipulates actual DOM elements on canvas
2. Components are added and configured (real Svelte components)
3. Design state is captured as a tree structure
4. Code is generated in real-time via AST (in Web Worker)
5. No preview needed - you're editing the actual rendered output

### State Management Architecture

**Approach**: Event Sourcing with Svelte Stores

**Why Event Sourcing:**
- Perfect for undo/redo functionality
- Time-travel debugging
- Complete history of design changes
- Easy to sync across devices

**Structure:**
```typescript
// Event-based state updates
type DesignEvent = 
  | { type: 'ADD_COMPONENT', component: Component }
  | { type: 'UPDATE_STYLE', elementId: string, styles: CSS }
  | { type: 'DELETE_ELEMENT', elementId: string }
  | { type: 'MOVE_ELEMENT', elementId: string, position: Position };

// State is derived from events
const currentState = events.reduce(applyEvent, initialState);
```

**Implementation:**
- **Local State**: Component-level state using Svelte stores
- **Global State**: Event store for entire design history
- **Undo/Redo**: Navigate through event history
- **Persistence**: Events stored in IndexedDB (local-first) ✅ **IMPLEMENTED**
  - Projects stored as event histories
  - Auto-save with debounce (1s) and interval (30s)
  - Project management (create, save, load, delete)
  - Event replay reconstructs state on load
  - Export/import as JSON for backup
- **Cloud Sync** (Future): Sync events, not full state

## Security Considerations

### Client-Side
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure local storage usage

### Server-Side (Future)
- Authentication and authorization
- Rate limiting
- Data encryption
- Secure file uploads

## Performance Optimization

### Frontend Performance Strategy

**Current Approach**: Simple and maintainable
- Render all components initially
- Standard Svelte reactivity
- Basic code splitting
- Image optimization

**Future Optimization** (when needed):
- **Virtual Canvas**: Only render visible components
  - Implement when designs exceed 100+ components
  - Use intersection observer for visibility detection
  - Lazy load off-screen components
- **Layer Culling**: Hide non-visible layers
  - Calculate viewport bounds
  - Cull layers outside viewport
  - Re-render on scroll/pan
- **Web Workers for Heavy Operations**:
  - Code generation (AST parsing)
  - Large file imports/exports
  - Complex layout calculations
  - Image processing
- **Incremental Rendering**:
  - Render in chunks for large designs
  - Use requestIdleCallback for non-critical updates
  - Priority queue for user interactions
- **Performance Monitoring**:
  - Track render times
  - Identify bottlenecks
  - Optimize when metrics drop below 30fps

**Optimization Triggers**:
- Design exceeds 100 components
- Frame rate drops below 30fps
- User reports performance issues
- Canvas operations feel sluggish

**Architecture for Future Optimization**:
```typescript
// Virtual canvas interface (not implemented yet)
interface VirtualCanvas {
  visibleComponents: Component[];
  renderViewport(bounds: Rect): void;
  updateVisibility(): void;
}

// Performance monitoring
interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
}
```

### Backend (Future)
- Database indexing (if using cloud sync)
- Event-based sync (efficient)
- CDN for static assets
- Serverless for scalability

## Scalability Plan

### Phase 1: MVP (Local-First)
- Single-user design tool
- IndexedDB storage (no server needed)
- Basic component library
- AST-based code generation
- DOM-based canvas
- Event sourcing for undo/redo

### Phase 2: Multi-user (Optional Cloud)
- Optional cloud sync (you can still work offline)
- User authentication (only if using cloud)
- Real-time collaboration (CRDT-based)
- Plugin system (trusted plugins)

### Phase 3: Enterprise (Advanced Features)
- Team management
- Advanced permissions
- API access for integrations
- Custom integrations
- Plugin sandboxing for third-party plugins

## Deployment Strategy

### Development
- Local development server
- Hot module replacement
- Source maps for debugging

### Production
- Static site generation
- CDN deployment
- Environment-specific configurations
- Monitoring and analytics

## Future Considerations

### Technology Evolution
- WebAssembly for performance-critical operations
- Progressive Web App (PWA) capabilities
- Offline functionality
- Real-time collaboration

### AI Integration
- Advanced AI code generation and optimization
- AI-powered design suggestions and automation
- Natural language to code conversion
- AI-assisted debugging and error resolution
- Machine learning for user behavior analysis

### Integration Opportunities
- Design tool integrations (Figma, Sketch)
- Development tool integrations (VS Code, GitHub)
- Hosting platform integrations
- Third-party service integrations
- AI tool integrations (ChatGPT, Claude, Copilot)

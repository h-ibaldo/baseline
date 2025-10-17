# System Architecture

## Overview

LineBasis is built as a modern web application using SvelteKit and TypeScript, designed to be scalable, maintainable, and extensible.

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

### Backend (Dual-Mode Architecture)

**Mode 1: Designer Tool (Browser-Only)**
- **Primary Storage**: IndexedDB (browser-based, no server required)
- **Architecture**: Local-first, works entirely offline
- **Export**: Generate code as ZIP files

**Mode 2: CMS (Self-Hosted)** ✅ **IMPLEMENTED**
- **Runtime**: Node.js (via SvelteKit adapter-node)
- **Database**: SQLite (simple, file-based) or PostgreSQL (scalable)
- **Architecture**: Full-stack SSR with SvelteKit
- **Storage**: Database + filesystem for media (`static/uploads/`)
- **Authentication**: JWT-based with bcrypt password hashing ✅
  - Access tokens (7-day expiry)
  - Refresh tokens (30-day expiry, HTTP-only cookies)
  - Role-based access control (admin, editor, author)
  - Session management in database
- **Media Management**: File upload with Sharp optimization ✅
  - Image optimization (auto-resize, quality compression)
  - Support for images, PDFs, videos
  - Storage statistics tracking
- **Admin Panel**: Modern interface for CMS management ✅
  - Login page with authentication
  - Dashboard with statistics
  - Protected routes
- **Publishing**: Design → Database → SSR pages on custom domain ✅
- **Blog System**: Template-based blog with Notion-like editor ✅
  - Design blog templates in designer
  - Mark pages as blog templates
  - Rich text editor for content
  - Publish as page OR blog template
- **SEO Tools**: Sitemap generation, robots.txt, meta management ✅
- **Philosophy**: You own your data and server. Self-hosted, no vendor lock-in.

### CMS Directory Structure
```
baseline/
├── src/
│   ├── routes/
│   │   ├── admin/                  # CMS Admin Panel (SSR)
│   │   │   ├── +layout.server.ts  # Auth guard
│   │   │   ├── pages/             # Page manager
│   │   │   ├── media/             # Media library
│   │   │   ├── users/             # User management
│   │   │   └── settings/          # Site settings
│   │   ├── api/                    # REST API
│   │   │   ├── pages/             # CRUD pages
│   │   │   ├── media/             # Upload/manage media
│   │   │   ├── auth/              # Login/logout
│   │   │   └── publish/           # Publishing endpoints
│   │   └── [...slug]/              # Published Pages (SSR)
│   │       └── +page.server.ts    # Load from database
│   ├── lib/
│   │   ├── server/                 # Server-only code
│   │   │   ├── db/                # Database layer
│   │   │   ├── auth/              # Authentication
│   │   │   └── services/          # Business logic
│   │   └── components/            # Shared components
│   └── hooks.server.ts            # SvelteKit hooks (auth, etc.)
├── prisma/                         # Database schema
└── static/uploads/                 # Uploaded media
```

**Optional Future: Cloud Sync**
- **Sync Protocol**: Event-based sync (CRDTs for conflict resolution)
- **Cloud Storage**: Optional alternative to self-hosting
- **Multi-device**: Sync between browser and self-hosted installations

### Development Tools
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, Playwright
- **Documentation**: Markdown

## Project Structure

```
linebasis/
├── src/
│   ├── routes/           # SvelteKit routes and pages
│   ├── lib/              # Reusable components and utilities
│   │   ├── components/   # UI components
│   │   │   ├── canvas/   # Canvas-related components
│   │   │   ├── linebasis/ # Line basis grid components
│   │   │   └── ui/       # General UI components
│   │   ├── stores/       # Svelte stores for state management
│   │   │   ├── design.ts      # Design state (event sourcing)
│   │   │   ├── linebasis.ts   # Line basis grid config
│   │   │   └── history.ts     # Undo/redo history
│   │   ├── utils/        # Utility functions
│   │   │   ├── linebasis.ts   # Line basis calculations
│   │   │   ├── ast.ts         # AST code generation
│   │   │   └── storage.ts     # IndexedDB wrapper
│   │   ├── workers/      # Web Workers
│   │   │   └── code-generator.ts  # AST generation worker
│   │   └── types/        # TypeScript type definitions
│   │       ├── linebasis.ts   # Line basis grid types
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

### 1. Unified Designer Interface
- **Purpose**: Single interface for design, editing, and publishing
- **Technology**: DOM-based approach using Svelte components (not Canvas API)
- **Architecture**: Multi-page canvas with instant publishing (Figma-style workflow)
- **Rationale**: Eliminate context switching - everything happens in one place

#### Multi-Page Canvas Hierarchy
```
Designer Canvas (Multi-Page Viewport)
  ├─ Page 1 (e.g., Homepage)
  │   ├─ Artboard 1 (Desktop 1920×1080)
  │   ├─ Artboard 2 (Mobile 375×812)
  │   └─ Elements (boxes, text, images, components)
  ├─ Page 2 (e.g., About Page)
  │   ├─ Artboard 1 (Desktop 1920×1080)
  │   └─ Elements
  ├─ Page 3 (e.g., Services)
  └─ Page N (unlimited pages)
```

#### Features
- **Multi-Page Canvas**: See all website pages at once
- **Visual Page Management**: Add/remove/reorder pages visually
- **Instant Publishing**: Right-click page → Publish with slug definition
- **Component Creation**: Convert any design selection to reusable component
- **Component Library**: Drag-and-drop components from sidebar
- **Live Site Preview**: Published pages automatically appear on live site
- **Draft Management**: Visual indicators for published vs draft pages

### 2. Component System
- **Purpose**: Convert designs to reusable components (replaces content blocks)
- **Technology**: Auto-generated from design selections
- **Features**: Visual creation, automatic library, instant reuse
- **Architecture**: Any design can become a component

#### Component Workflow
```
1. Design in canvas → Select elements → Right-click "Convert to Component"
2. Component automatically saved to library with thumbnail
3. Drag component from library into any design
4. Edit master component → All instances update automatically
```

## Architectural Evolution

### Previous Architecture (Complex)
```
- Designer (visual design only)
- Page Editor (content management)
- Content Blocks (separate reusable content system)
- Templates (page layout system)
- Publishing System (complex workflow)
```

### New Architecture (Simplified) ✅ **CURRENT**
```
- Unified Designer Interface
  ├── Multi-page canvas (all pages visible)
  ├── Component creation (convert design to component)
  ├── Component library (reusable components)
  ├── Instant publishing (Figma-style workflow)
  └── Live site management (published vs draft)
```

### What's Being Replaced
- ❌ **Content Blocks System** → ✅ **Component System** (more intuitive)
- ❌ **Separate Page Editor** → ✅ **Unified Designer** (no context switching)
- ❌ **Template System** → ✅ **Page-based Design** (pages are just designs)
- ❌ **Complex Publishing** → ✅ **Instant Publishing** (right-click → publish)
- ❌ **Multiple Interfaces** → ✅ **Single Interface** (everything in designer)

## Publishing Workflow (Figma-Style)

### How Publishing Works
```
1. Design pages in multi-page canvas
2. Select page to publish (right-click or select)
3. Define slug (e.g., "/about", "/services/pricing")
4. Click "Publish" → Page goes live immediately
5. Published pages appear in live site navigation
```

### Page States
- **Draft**: Visible in admin, not on live site
- **Published**: Live on website with defined slug
- **Unpublished**: Right-click → "Unpublish" to remove from live site

### Benefits
- **Instant Publishing**: No complex setup or configuration
- **Visual Management**: See all pages and their status at once
- **Simple URLs**: Just define the slug, routing is automatic
- **Live Preview**: Published pages immediately accessible

## Theme Export System

### Export Architecture
- **Format**: `.baseline-theme` (ZIP file)
- **Structure**: JSON + Svelte Components
- **Portable**: Like WordPress themes, but better
- **Editable**: Svelte files can be modified
- **Versionable**: Git-friendly
- **Extensible**: Add custom logic

### Export Format
```
theme-name.baseline-theme/
├── theme.json (structure & data)
├── components/
│   ├── BlogPost.svelte
│   ├── BlogList.svelte
│   └── Hero.svelte
├── styles/
│   ├── variables.css
│   └── components.css
└── assets/
    └── images/
```

### Benefits
- **Professional Sharing**: Exchange designs like Figma files
- **Client Delivery**: Easy theme installation
- **Version Control**: Track theme changes
- **Customization**: Modify Svelte components
- **Reusability**: Use themes across projects

## Style Libraries (Figma-Style)

### Library System
- **Colors**: Primary, secondary, semantic palettes
- **Typography**: Font families, sizes, line heights
- **Spacing**: Margins, paddings, gaps
- **Components**: Button styles, input styles, card styles

### Features
- **Library Management**: Create, edit, share libraries
- **Component Inheritance**: Components inherit from libraries
- **Global Updates**: Change library → all components update
- **Import/Export**: Share libraries between projects
- **Version Control**: Track library changes

### Workflow
```
1. Create style library (colors, typography, spacing)
2. Components inherit from library
3. Update library → all components update automatically
4. Export library for sharing
5. Import library in other projects
```

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

### 5. Authentication System ✅ **NEW - Phase 1.5**
- **Purpose**: User authentication, authorization, and session management
- **Technology**: JWT tokens + bcrypt + database sessions
- **Architecture**:
  ```typescript
  // JWT Tokens
  - Access Token: 7-day expiry, sent as Bearer token
  - Refresh Token: 30-day expiry, stored in HTTP-only cookie

  // Services
  - auth.ts: Register, login, logout, token management
  - middleware/auth.ts: requireAuth, requireRole, requireAdmin, requireEditor

  // Database
  - User model: email, passwordHash, role, status
  - Session model: userId, token, expiresAt
  ```
- **Features**:
  - User registration and login
  - Password hashing with bcrypt (10 rounds)
  - JWT access and refresh tokens
  - Role-based access control (admin, editor, author)
  - Session management in database
  - HTTP-only cookies for refresh tokens
  - Comprehensive middleware for route protection
- **Security**:
  - Passwords hashed with bcrypt
  - JWT tokens signed with secret
  - HTTP-only cookies prevent XSS
  - SameSite cookies prevent CSRF
  - Role-based authorization
  - Input validation on all endpoints

**Files**:
- `src/lib/server/services/auth.ts` - Auth service (~250 lines)
- `src/lib/server/middleware/auth.ts` - Auth middleware (~120 lines)
- `src/routes/api/auth/*` - 6 API endpoints

### 6. Media Upload System ✅ **NEW - Phase 1.5**
- **Purpose**: File upload, storage, and optimization
- **Technology**: Sharp (image processing) + filesystem storage
- **Architecture**:
  ```typescript
  // Upload Flow
  1. Validate file (type, size)
  2. Save to static/uploads/ with unique filename
  3. If image → optimize with Sharp
  4. Create Media record in database
  5. Return URL and metadata

  // Optimization
  - Auto-resize images > 2000px width
  - Quality optimization (JPEG 85%, PNG level 9, WebP 85%)
  - Dimension detection
  - Format-specific optimization
  ```
- **Features**:
  - File type validation (images, PDFs, videos)
  - File size limits (10MB default)
  - Automatic image optimization
  - Unique filename generation
  - Metadata tracking (size, dimensions, mime type)
  - Storage statistics per user
  - Alt text and captions support
- **Supported Formats**:
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Documents: PDF
  - Videos: MP4

**Files**:
- `src/lib/server/services/upload.ts` - Upload service (~220 lines)
- `src/routes/api/media/*` - 3 API endpoints

### 7. Admin Panel ✅ **NEW - Phase 1.5**
- **Purpose**: Web interface for CMS management
- **Technology**: SvelteKit pages with authentication
- **Architecture**:
  ```typescript
  // Pages
  - /admin/login - Login page
  - /admin - Dashboard (protected)
  - /admin/pages - Page manager (Phase 2)
  - /admin/media - Media library (Phase 2)

  // Auth Flow
  1. User logs in → stores access token in localStorage
  2. Protected pages check token on mount
  3. If invalid → redirect to login
  4. API calls include token in Authorization header
  ```
- **Features**:
  - Beautiful gradient login page
  - Dashboard with statistics
  - User info with role badges
  - Quick action cards
  - Responsive design
  - Protected route handling
  - Auto-redirect if not authenticated
- **Design**:
  - Modern gradient backgrounds
  - Card-based layout
  - Responsive grid system
  - Clean typography
  - Professional color scheme

**Files**:
- `src/routes/admin/login/+page.svelte` - Login page (~170 lines)
- `src/routes/admin/+page.svelte` - Dashboard (~250 lines)

### 8. Baseline Grid System
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

### Phase 1: Designer Tool (Local-First) ✅
- Single-user design tool
- IndexedDB storage (no server needed)
- Basic component library
- AST-based code generation
- DOM-based canvas
- Event sourcing for undo/redo
- Export code as ZIP

### Phase 1.5: CMS Foundation 📋
- Self-hosted CMS mode
- Database integration (SQLite/PostgreSQL)
- Publishing system (design → live pages)
- User authentication and roles
- Media library
- Admin panel
- Multi-page websites

### Phase 2: CMS Core Features
- Advanced content management
- SEO tools and optimization
- Page templates and blocks
- Multi-language support
- Custom post types
- Navigation builder
- Form builder

### Phase 3: WordPress Parity
- Blog system
- Plugin architecture
- Theme system
- E-commerce foundation (optional)
- Migration tools (WordPress → Baseline)
- Advanced design features

### Phase 4: Cloud Sync & Collaboration (Optional)
- Optional cloud sync (you can still work offline)
- Multi-device sync
- Real-time collaboration (CRDT-based)
- Commenting and feedback

### Phase 5: Enterprise Features
- Multi-site management
- Team management
- Advanced permissions
- API access for integrations
- Custom integrations
- Plugin marketplace with sandboxing

## Deployment Strategy

### Designer Mode (SPA)
**Development:**
- Local development server with HMR
- Source maps for debugging
- Client-side only (`ssr: false`)

**Production:**
- Static site generation
- Deploy to any CDN (Vercel, Netlify, Cloudflare Pages)
- Environment-specific configurations

### CMS Mode (Full-Stack)
**Development:**
- Local development server with HMR
- SQLite for local database
- Hot reload for server and client

**Production Options:**

1. **VPS (Recommended)**
   - Install Node.js 20+
   - Clone repository or use setup script
   - Run with PM2 or systemd
   - Nginx reverse proxy
   - SSL with Let's Encrypt

2. **Docker**
   - Official Docker image
   - Volume mounts for data and uploads
   - Docker Compose for multi-container
   - Easy updates and rollbacks

3. **Cloud Platforms**
   - Railway, Render, Fly.io
   - Auto-deploy from Git
   - Managed databases
   - Automatic scaling

4. **Shared Hosting (if Node.js supported)**
   - cPanel Node.js app
   - Upload built files
   - Configure environment variables

**Monitoring:**
- Application logs
- Error tracking (Sentry)
- Performance monitoring
- Database backups

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

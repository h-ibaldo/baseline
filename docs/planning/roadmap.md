# Project Roadmap

## Phase 1: Foundation (Months 1-3)

### Core Infrastructure
- [x] Project setup with SvelteKit and TypeScript
- [x] Git repository and GitHub integration
- [x] Basic project structure and documentation
- [x] Architecture documentation
- [x] Cursor AI guidelines (.cursorrules)
- [x] Testing framework setup (Vitest)
- [ ] CI/CD pipeline configuration

### DOM-Based Canvas ✅ **COMPLETED**
- [x] Infinite canvas with multiple artboards (Figma/Illustrator style)
- [x] Artboard component with per-artboard grid settings
- [x] Element component (box) using actual DOM elements
- [x] Drag-and-drop functionality with live coordinates
- [x] Selection state with visual feedback
- [x] Resize handles (4 corners with live dimensions)
- [x] Multi-select capability (Shift+click)
- [x] Real-time editing of live components
- [x] Performance monitoring (10 artboard limit with warning)

**Future Enhancements:**
- [ ] Click-and-drag selection box (marquee select)
- [ ] Group drag/resize for multiple selected elements
- [ ] Move elements between artboards
- [ ] Keyboard shortcuts (Delete, Arrow keys, etc.)
- [ ] Copy/paste functionality
- [ ] Alignment guides and snapping

### Baseline Grid System ✅ **COMPLETED**
- [x] Baseline grid calculation engine (7 core functions)
- [x] User-defined baseline height configuration (4-32px)
- [x] Visual grid overlay (toggleable, customizable color/opacity)
- [x] Global snap-to-baseline toggle
- [x] Per-component baseline override
- [x] Fractional spacing system (pixels ↔ baseline units conversion)
- [x] Real-time snapping during drag operations
- [x] Comprehensive test suite (10 tests passing)

**Future Enhancements:**
- [ ] Snap indicators with visual feedback
- [ ] Baseline alignment validation warnings
- [ ] Snap to baseline during resize operations
- [ ] Keyboard shortcuts for baseline adjustments

### State Management (Event Sourcing) ✅ **COMPLETED**
- [x] Event sourcing architecture implementation
- [x] Design event types (add, update, delete, move)
- [x] Event store with Svelte stores
- [x] Undo/redo functionality via event history
- [x] IndexedDB persistence layer
- [x] Event replay for state reconstruction

**Completed Features:**
- Event sourcing with 14+ event types
- Perfect undo/redo via event history navigation
- IndexedDB persistence with auto-save
- Project management (create, save, load, delete)
- Event replay for state reconstruction
- 40+ comprehensive tests
- Complete UI with ProjectManager component

**Future Enhancements:**
- [ ] Event compression for large histories
- [ ] Snapshots for faster replay
- [ ] Cloud sync (optional, future phase)

### Component Library Foundation ✅ **COMPLETED**
- [x] Basic component structure
- [x] Typography components (baseline-aware)
- [x] Layout components (container, grid, flex)
- [x] Form components (input, button, select)
- [x] TypeScript interfaces for all components
- [x] Component registry system
- [x] Interactive demo page
- [ ] Component property system (pending - needs visual inspector UI)

**Completed Features:**
- 9 baseline-aware design components
- Comprehensive type system with 20+ interfaces
- Component registry with metadata and defaults
- Typography: Heading, Paragraph, Text
- Layout: Container, Grid, Flex
- Forms: Button, Input, Select
- Demo page showcasing all components
- Full TypeScript type safety

**Future Enhancements:**
- [ ] Component property inspector UI
- [ ] More component types (Image, Video, Icon, etc.)
- [ ] Component variants and states
- [ ] Component composition tools

### AST-Based Code Generation ✅ **COMPLETED**
- [x] AST parser for design tree
- [x] HTML generation from AST
- [x] CSS generation with optimization
- [x] TypeScript type generation
- [x] Multiple output formats (HTML/CSS)
- [x] Export functionality (ZIP download)
- [x] Interactive code generation demo
- [ ] Web Worker for code generation (future optimization)
- [ ] Code preview panel (future enhancement)
- [ ] Svelte/React/Vue output formats (future)

**Completed Features:**
- Complete AST-based code generation pipeline
- Clean, semantic HTML5 output
- Optimized CSS with baseline grid support
- ZIP export with JSZip
- Export configuration UI
- Multiple export presets (Minimal, Standard, Optimized)
- Size estimation and validation
- README generation for exported projects
- 44 tests passing

**Future Enhancements:**
- [ ] Web Worker for non-blocking generation
- [ ] Live code preview panel in canvas
- [ ] Framework-specific output (Svelte, React, Vue)
- [ ] Advanced CSS optimization (tree-shaking)

---

## Phase 1.5: CMS Foundation (Months 3-4)

**Goal**: Enable self-hosted CMS mode for publishing pages directly

### Database Layer ✅ **COMPLETED**
- [x] SQLite integration (simple, file-based)
- [x] Database schema design (pages, media, users, settings)
- [x] Prisma ORM setup
- [x] Migration system
- [x] Database utilities and helpers

**Completed Features:**
- Complete Prisma schema with 6 models (Page, PageRevision, Media, User, Session, Setting)
- Database client with singleton pattern
- Page service with CRUD, publish/unpublish, revisions, search
- User service with bcrypt authentication and role-based permissions
- Media service with type filtering and storage quotas
- Settings service with type-safe value parsing
- Comprehensive indexes for performance
- All services fully typed with TypeScript

**Future Enhancements:**
- [ ] Database connection pooling for scale
- [ ] PostgreSQL support for larger installations
- [ ] Database query optimization
- [ ] Automated backup system

### Publishing System ✅ **COMPLETED**
- [x] Design → HTML/CSS generation pipeline
- [x] Page storage in database
- [x] URL routing system (SvelteKit dynamic routes)
- [x] SSR rendering for published pages
- [x] Publish/unpublish workflow
- [x] Draft vs published states

**Completed Features:**
- Complete publishing service with design-to-live-page workflow
- API endpoints for all page operations (CRUD + publish)
- SSR routes for published pages (/[slug])
- Preview functionality without publishing
- Bulk publishing support
- SEO metadata rendering (title, description, OG tags)
- Error handling and validation throughout
- Interactive publishing demo

**Future Enhancements:**
- [ ] Live preview during editing
- [ ] Scheduled publishing
- [ ] A/B testing for published pages
- [ ] Analytics integration

### Authentication & Users
- [ ] JWT-based authentication
- [ ] User registration/login
- [ ] Password hashing (bcrypt)
- [ ] Session management
- [ ] Role-based access control (Admin, Editor, Author)
- [ ] Auth middleware

### Media Library (Basic)
- [ ] File upload system
- [ ] Media storage (filesystem)
- [ ] Image optimization (resize, compress)
- [ ] Media metadata (filename, size, type)
- [ ] Media deletion

### Admin Panel (Basic)
- [ ] Admin layout and navigation
- [ ] Login/logout pages
- [ ] Basic page manager (list, create, edit)
- [ ] Basic media manager
- [ ] User profile page

### API Layer
- [ ] REST API structure
- [ ] Pages endpoints (CRUD)
- [ ] Media endpoints (upload, delete)
- [ ] Auth endpoints (login, logout, refresh)
- [ ] Error handling and validation

### Installation & Setup
- [ ] Setup script (database, admin user)
- [ ] Environment configuration
- [ ] Docker support
- [ ] Documentation for self-hosting

---

## Phase 2: CMS Core Features (Months 5-7)

**Goal**: Complete CMS functionality for production use

### Admin Panel (Advanced)
- [ ] Enhanced page manager (search, filter, bulk actions)
- [ ] Enhanced media library (folders, tags, search)
- [ ] User management interface (CRUD users)
- [ ] Site settings page (SEO, general settings)
- [ ] Analytics dashboard (page views, popular pages)
- [ ] Activity log (audit trail)

### Content Management
- [ ] Page templates system
- [ ] Reusable content blocks
- [ ] Draft autosave
- [ ] Page revisions/version history
- [ ] Scheduled publishing
- [ ] Page duplication

### SEO & Performance
- [ ] SEO metadata editor (title, description, OG tags)
- [ ] Sitemap generation (XML)
- [ ] Robots.txt management
- [ ] Page caching system
- [ ] Image optimization and lazy loading
- [ ] Performance monitoring

### Advanced Features
- [ ] Multi-language support (i18n)
- [ ] Custom post types (blog posts, portfolio items)
- [ ] Taxonomies (categories, tags)
- [ ] Search functionality
- [ ] Navigation menu builder
- [ ] Form builder

### Developer Tools
- [ ] Keyboard shortcuts system
- [ ] Advanced AST optimization
- [ ] Multiple framework outputs (React, Vue, Svelte)
- [ ] Code style customization
- [ ] Semantic HTML generation
- [ ] CSS optimization (deduplication, minification)
- [ ] Accessibility attributes generation

### Designer Experience
- [ ] Advanced component library (50+ components)
- [ ] Typography system with advanced baseline features
- [ ] Color palette and theme management
- [ ] Responsive design tools (breakpoints)
- [ ] Layout constraints and auto-layout
- [ ] Component variants and states
- [ ] Design templates and presets
- [ ] Command palette

## Phase 3: WordPress Parity & Ecosystem (Months 8-12)

**Goal**: Feature parity with WordPress + modern advantages

### Blog System
- [ ] Blog post type with rich editor
- [ ] Categories and tags
- [ ] Author pages
- [ ] Archive pages (by date, category, tag)
- [ ] RSS/Atom feeds
- [ ] Comments system (optional)
- [ ] Related posts

### E-commerce Foundation (Optional)
- [ ] Product custom post type
- [ ] Shopping cart
- [ ] Payment integration (Stripe, PayPal)
- [ ] Order management
- [ ] Inventory tracking
- [ ] Shipping calculator

### Plugin System
- [ ] Plugin architecture (trusted plugins only initially)
- [ ] Plugin API and hooks
- [ ] Plugin sandboxing (Web Workers/iframes)
- [ ] Plugin marketplace (when contributions open)
- [ ] Official plugins (analytics, SEO, forms, etc.)
- [ ] Third-party integrations

### Theme System
- [ ] Theme structure and API
- [ ] Theme templates
- [ ] Theme customizer
- [ ] Theme marketplace
- [ ] Default themes (5+ professional themes)

### Migration Tools
- [ ] WordPress import plugin
- [ ] Figma import (basic)
- [ ] HTML/CSS import
- [ ] Export to static site
- [ ] Backup and restore

### Advanced Designer Features
- [ ] Animation system (CSS animations, transitions)
- [ ] Advanced layout tools (absolute positioning, z-index)
- [ ] Custom component creation
- [ ] Design system management
- [ ] Accessibility tools and validation
- [ ] Component documentation generation

### Developer Experience
- [ ] Comprehensive API documentation
- [ ] Developer SDK
- [ ] CLI tools
- [ ] Custom export templates
- [ ] Webhooks
- [ ] REST API extensions

## Phase 4: Cloud Sync & Collaboration (Months 13-18)

**Note**: Cloud features are optional. Baseline works fully offline and self-hosted.

### Cloud Sync (Optional)
- [ ] Event-based sync protocol
- [ ] CRDT implementation for conflict resolution
- [ ] Cloud storage option (alternative to self-hosting)
- [ ] Multi-device sync
- [ ] Automatic cloud backups

### Real-time Collaboration (Optional)
- [ ] Multi-user editing
- [ ] Live cursors and selections
- [ ] Commenting system
- [ ] Activity feed
- [ ] Conflict resolution
- [ ] Version history (cloud-based)

## Phase 5: Scale & Ecosystem (Months 13-18)

### Performance at Scale
- [ ] Virtual canvas (100+ components)
- [ ] Layer culling
- [ ] Incremental rendering
- [ ] Web Workers for heavy operations
- [ ] Performance optimization based on metrics

### Advanced Features
- [ ] Mobile app (PWA)
- [ ] Desktop application (Tauri/Electron)
- [ ] Browser extensions
- [ ] Advanced export options
- [ ] Integration APIs

### Community (When Contributions Open)
- [ ] Open external contributions
- [ ] Community forum
- [ ] Tutorial system
- [ ] Design showcase
- [ ] Contributor guidelines refinement

## Long-term Vision (Years 2-5)

### Technology Evolution
- [ ] AI-powered design assistance
- [ ] Natural language to design
- [ ] Advanced automation
- [ ] Machine learning for optimization
- [ ] WebAssembly for performance

### Market Leadership
- [ ] Industry partnerships
- [ ] Educational programs
- [ ] Design community building
- [ ] Conference presence
- [ ] Thought leadership

### Global Impact
- [ ] Internationalization (i18n)
- [ ] Advanced accessibility features
- [ ] Open source ecosystem growth
- [ ] Social impact initiatives

## Success Metrics

### Phase 1-2 (Months 1-6)
- Working MVP with core features
- 100+ GitHub stars
- Basic design tool functionality
- Positive user feedback from early adopters

### Phase 3-4 (Months 7-12)
- 1,000+ active users
- 1,000+ GitHub stars
- Full local-first functionality
- Optional cloud sync working

### Phase 5+ (Months 13+)
- 10,000+ active users
- 5,000+ GitHub stars
- Open to external contributions
- Market recognition

## Current Status

### Completed ✅
- [x] Project initialization
- [x] SvelteKit + TypeScript setup
- [x] Git repository and GitHub
- [x] Documentation structure
- [x] Architecture documentation
- [x] Cursor AI guidelines
- [x] Contributing guidelines
- [x] Project vision document

### In Progress 🚧
- [ ] Development environment setup
- [ ] Testing framework
- [ ] Core canvas implementation

### Next Immediate Steps (Week 1-2)

1. **Development Environment**
   - Set up Vitest for testing
   - Configure ESLint and Prettier
   - Set up development workflow

2. **Core Canvas Component**
   - Create basic DOM-based canvas
   - Implement element selection
   - Basic drag-and-drop

3. **Baseline Grid Foundation**
   - Implement baseline calculation utilities
   - Create visual grid overlay
   - Basic snap-to-baseline functionality

4. **State Management**
   - Set up event sourcing structure
   - Implement basic event types
   - IndexedDB wrapper

## Dependencies & Risks

### Technical Dependencies
- SvelteKit stability (mature)
- Browser IndexedDB support (excellent)
- Web Workers support (excellent)
- Modern browser features (CSS Grid, Flexbox)

### Risks & Mitigation

**Performance Risks**
- Risk: Large designs may be slow
- Mitigation: Architected for virtual canvas, performance monitoring

**Complexity Risks**
- Risk: Event sourcing adds complexity
- Mitigation: Start simple, iterate based on needs

**Adoption Risks**
- Risk: Users prefer familiar tools
- Mitigation: Focus on unique value (baseline grid, code ownership)

**Technical Risks**
- Risk: DOM-based approach may have limitations
- Mitigation: Prototype early, validate approach

## Milestone Tracking

### Month 1
- [ ] Development environment complete
- [ ] Basic canvas working
- [ ] Element selection working
- [ ] Basic baseline grid visible

### Month 2
- [ ] Drag-and-drop working
- [ ] Event sourcing implemented
- [ ] Undo/redo working
- [ ] IndexedDB persistence

### Month 3
- [ ] Basic components library
- [ ] Code generation working
- [ ] Export functionality
- [ ] MVP feature-complete

### Month 4-6
- [ ] Advanced components
- [ ] Multiple output formats
- [ ] Responsive design tools
- [ ] Polish and refinement

---

**Note**: This roadmap is flexible and will be adjusted based on user feedback, technical discoveries, and market conditions. The focus is on building a solid foundation before adding advanced features.
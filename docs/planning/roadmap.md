# LineBasis Development Roadmap

**Last Updated**: October 28, 2024
**Current Phase**: Phase 1 - Core Page Builder MVP
**Current Milestone**: Milestone 5 - Page Builder Canvas (52% complete)

---

## Overview

LineBasis follows a **phased release strategy** to ship faster, validate architecture, and build in public:

- **Phase 1**: Core Page Builder MVP (this roadmap)
- **Phase 2**: Custom Blocks (developer extensibility)
- **Phase 3**: Plugin Ecosystem (blog, forms, marketplace)
- **Phase 4+**: Advanced Features (e-commerce, comments, collaboration)

**This document covers Phase 1 implementation milestones.**

---

## Phase 1: Core Page Builder MVP

**Goal**: Ship a working visual page builder with publishing, authentication, and design system.

**Timeline**: TBD (building in public, iterating based on feedback)

**Success Criteria**:
- ✅ Can design a multi-page website visually
- ✅ Can publish pages with SSR
- ✅ Can export as static HTML/CSS
- ✅ Design tokens work across all pages
- ✅ User blocks are reusable and update instances
- ✅ Multi-user teams with RBAC
- ✅ Local-first with auto-save (no data loss)

---

## Milestone 1: Foundation & Database

**Duration**: ~1-2 weeks
**Goal**: Set up project infrastructure, database, and core models

### Tasks

#### 1.1 Project Setup
- [x] Initialize SvelteKit project with TypeScript
- [x] Configure Prisma with SQLite (dev) and PostgreSQL (prod)
- [x] Set up Vitest for testing
- [x] Configure ESLint and TypeScript strict mode
- [x] Create `.env.example` with all required variables
- [x] Write setup script (`npm run setup`) for first-time installation

#### 1.2 Database Schema (Core Models)
- [x] Implement `User` model (email, password, role, teamId)
- [x] Implement `Team` model (name, slug, ownerId)
- [x] Implement `Session` model (userId, refreshToken, expiresAt)
- [x] Implement `Page` model (title, slug, designEvents, publishedCode, teamId, authorId)
- [x] Implement `Frame` model (pageId, name, breakpointWidth, designEvents, order)
- [x] Implement `Block` model (name, designEvents, sourcePageId, teamId)
- [x] Implement `BlockInstance` model (blockId, frameId, elementId, isDetached, overrideEvents)
- [x] Implement `Media` model (filename, url, mimeType, size, uploaderId, teamId)
- [x] Implement `Setting` model (key, value, type)
- [x] Create initial migration
- [x] Write seed script for development data

#### 1.3 Authentication Service
- [x] Install dependencies: `bcryptjs`, `jsonwebtoken`
- [x] Create `/src/lib/server/services/auth.ts`
  - [x] `register()` - Create user with hashed password
  - [x] `login()` - Verify credentials, issue JWT tokens
  - [x] `refresh()` - Refresh access token using refresh token
  - [x] `logout()` - Invalidate session
- [x] Create `/src/lib/server/middleware/auth.ts`
  - [x] `requireAuth()` - Verify JWT, attach user to locals
  - [x] `requireRole()` - Check user role (Owner/Manager/Designer/Editor)
- [x] Write unit tests for auth service

#### 1.4 API Routes: Authentication
- [x] `POST /api/auth/register` - User registration
- [x] `POST /api/auth/login` - User login (returns access + refresh tokens)
- [x] `POST /api/auth/refresh` - Refresh access token
- [x] `POST /api/auth/logout` - Logout and invalidate session
- [x] `GET /api/auth/me` - Get current user info

**Deliverable**: ✅ **COMPLETED** - Working database, authentication, and user management

---

## Milestone 2: Media Library

**Duration**: ~1 week
**Goal**: Upload, store, and manage images/videos

### Tasks

#### 2.1 Media Upload Service
- [x] Install `sharp` for image optimization
- [x] Create `/src/lib/server/services/media.ts`
  - [x] `uploadMedia()` - Handle file upload, optimize images, save to disk
  - [x] `getMedia()` - Retrieve media by ID
  - [x] `listMedia()` - List all media for a team (with pagination)
  - [x] `deleteMedia()` - Delete media file and database entry
  - [x] Image optimization: resize to max 2400px, compress to WebP
- [x] Configure upload directory: `static/uploads/`
- [x] Write unit tests for media service

#### 2.2 API Routes: Media
- [x] `POST /api/media/upload` - Upload file (multipart/form-data)
- [x] `GET /api/media` - List all media (with filters: type, date, search)
- [x] `GET /api/media/:id` - Get single media
- [x] `DELETE /api/media/:id` - Delete media (check permissions)

#### 2.3 Admin UI: Media Library
- [x] Create `/src/routes/admin/media/+page.svelte`
  - [x] Grid view of all media
  - [x] Upload button with drag-and-drop
  - [x] Search/filter by name, type, date
  - [x] Delete media with confirmation
  - [x] Media details modal (filename, size, dimensions, URL)
- [x] Create reusable `MediaPicker` component for designer

**Deliverable**: ✅ **COMPLETED** - Functional media library with upload, browse, and delete

---

## Milestone 3: Design System (Tokens)

**Duration**: ~1 week
**Goal**: Global design tokens for colors, typography, spacing, effects

### Tasks

#### 3.1 Token Data Model
- [x] Define token types: colors, typography, spacing, effects, baseline
- [x] Create `/src/lib/types/tokens.ts` with TypeScript interfaces
- [x] Implement token storage in `Setting` model (JSON format)
- [x] Default token presets (modern, minimal, classic themes)

#### 3.2 Token Service
- [x] Create `/src/lib/server/services/tokens.ts`
  - [x] `getTokens()` - Get all design tokens for team
  - [x] `updateTokens()` - Update design tokens
  - [x] `resetTokens()` - Reset to defaults

#### 3.3 API Routes: Tokens
- [x] `GET /api/tokens` - Get design tokens
- [x] `PUT /api/tokens` - Update design tokens
- [x] `POST /api/tokens/reset` - Reset to defaults

#### 3.4 Admin UI: Design System
- [x] Create `/src/routes/admin/styles/+page.svelte`
  - [x] **Colors**: Primary, Secondary, Accent, Text, Muted, Background
  - [x] **Typography**: Font families, Heading 1-6, Body, Caption, Small
  - [x] **Spacing**: Base unit, scale (4, 8, 16, 24, 32, 48, 64, 96)
  - [x] **Effects**: Border radius, shadows, transitions
  - [x] **Baseline Grid**: Grid unit (4-32px), line height multiplier
  - [x] Live preview of all tokens
  - [x] Export/import token JSON

**Deliverable**: ✅ **COMPLETED** - Working design system with token management UI

---

## Milestone 4: Event Sourcing Foundation

**Duration**: ~1-2 weeks
**Goal**: Event store, reducers, and undo/redo system

### Tasks

#### 4.1 Event Types
- [x] Create `/src/lib/types/events.ts`
  - [x] Define all event types (ELEMENT_ADDED, ELEMENT_MOVED, etc.)
  - [x] TypeScript discriminated unions for type safety
  - [x] Event metadata: id, timestamp, userId, frameId

#### 4.2 Event Store (IndexedDB)
- [x] Create `/src/lib/stores/event-store.ts`
  - [x] Initialize IndexedDB with `events` and `snapshots` stores
  - [x] `appendEvent()` - Add event to history
  - [x] `undo()` - Move cursor back
  - [x] `redo()` - Move cursor forward
  - [x] `getHistory()` - Get all events up to current cursor
  - [x] Auto-save to IndexedDB every 30 seconds
  - [x] Snapshot every 100 events for performance

#### 4.3 Event Reducer
- [x] Create `/src/lib/stores/event-reducer.ts`
  - [x] `applyEvent()` - Pure function: (state, event) => newState
  - [x] Handle all element events (add, move, resize, update, delete)
  - [x] Handle frame events (add, update, delete)
  - [x] Handle style events (update text, colors, spacing)
  - [x] Immutable state updates

#### 4.4 Design Store
- [x] Create `/src/lib/stores/design-store.ts`
  - [x] Derived store from event history
  - [x] Public API: `addElement()`, `moveElement()`, `updateElement()`, etc.
  - [x] All mutations dispatch events (never mutate state directly)
  - [x] Subscribe to changes for UI reactivity

#### 4.5 Testing
- [ ] Write comprehensive tests for event reducer
- [ ] Test undo/redo with complex event sequences
- [ ] Test state immutability

**Deliverable**: ✅ **COMPLETED** - Working event sourcing system with undo/redo (tests pending)

---

## Milestone 5: Page Builder Canvas (Basic)

**Duration**: ~2-3 weeks (IN PROGRESS - 71% complete)
**Goal**: Infinite canvas with frames, element rendering, and basic interactions

### Tasks

#### 5.1 Canvas Component
- [x] Create `/src/routes/+page.svelte` (main canvas page)
  - [x] Infinite canvas with pan and zoom (mouse wheel, trackpad)
  - [x] Grid background (baseline grid with horizontal lines)
  - [x] Render all pages as artboards on canvas
  - [x] Page viewport (artboard display)
  - [x] Zoom controls (in/out, reset, percentage display)

#### 5.2 Frame Management
- [ ] Add frame checkbox to div properties window
- [ ] Frame properties outside the properties window: name, breakpoint width
- [ ] Move frames on canvas (drag frame header)
- [ ] Resize frames (drag frame edges)
- [ ] Delete frame (with confirmation)
- [ ] Duplicate frame (copy all elements and events)

**Note**: Pages render as artboards but frame management UI not implemented

#### 5.3 Element Rendering (3 Components)
- [x] **Div Component**: Render as `<div>` with styles (background, border, padding)
- [x] **Text Component**: Render as `<p>`, `<h1>-<h6>` with typography tokens
- [x] **Media Component**: Render as `<img>` or `<video>` from media library

**Implementation**: All in `/src/lib/components/canvas/CanvasElement.svelte`

#### 5.4 Element Interactions (Basic)
- [x] Click to select element (highlight border)
- [x] Multi-select with selection box (drag on canvas)
- [x] Drag to move element (single element only)
- [x] Resize handles (8 directions)
- [x] Delete with keyboard (Backspace/Delete)
- [x] Copy/paste (Cmd/Ctrl + C/V)
- [x] Duplicate (Cmd/Ctrl + D)
- [ ] Multi-select drag/resize (selection box works, but can't move/resize multiple)

**Note**: Single-element interactions work perfectly. Multi-element drag/resize needs implementation.

#### 5.5 Keyboard Shortcuts
- [x] Undo: Cmd/Ctrl + Z
- [x] Redo: Cmd/Ctrl + Shift + Z (and Cmd/Ctrl + Y)
- [x] Save: Cmd/Ctrl + S (manual save for visual feedback)
- [x] Delete: Backspace/Delete
- [x] Duplicate: Cmd/Ctrl + D
- [x] Select All: Cmd/Ctrl + A

**Implementation**: In `/src/lib/stores/design-store.ts` (lines 582-624)

**Deliverable**: 🚧 **IN PROGRESS** - Core canvas working, frame management pending

**Completed Components**:
- [x] Canvas.svelte - Main canvas with pan/zoom
- [x] CanvasElement.svelte - Element renderer
- [x] SelectionUI.svelte - Selection border + resize handles
- [x] SelectionOverlay.svelte - Drag/resize interaction handler
- [x] SelectionBox.svelte - Multi-select box
- [x] BaselineGrid.svelte - Grid overlay
- [x] Toolbar.svelte - Top toolbar (partial functionality)

**Stores**:
- [x] design-store.ts - Main store with CRUD operations
- [x] event-store.ts - IndexedDB persistence
- [x] event-reducer.ts - Event sourcing reducer
- [x] interaction-store.ts - Live preview state
- [x] tool-store.ts - Current tool state

---

## Milestone 6: Page Builder UI (Floating Windows)

**Duration**: ~2 weeks
**Goal**: Illustrator-style floating windows for properties, layers, blocks, tokens

### Tasks

#### 6.1 Window System
- [ ] Create `/src/lib/components/ui/FloatingWindow.svelte`
  - [ ] Draggable window header
  - [ ] Resizable window (drag edges)
  - [ ] Minimize/maximize/close buttons
  - [ ] Remember position in localStorage
  - [ ] Bring to front on click (z-index management)
  - [ ] Snap to edges (optional)

#### 6.2 Toolbar (Fixed Top)
- [ ] Component buttons: Div, Text, Media
- [ ] Frame controls: Add frame, zoom controls
- [ ] Undo/redo buttons (with keyboard shortcuts)
- [ ] Preview button (toggle preview mode)
- [ ] Publish button (modal with settings)
- [ ] Page settings dropdown (title, slug, SEO)

#### 6.3 Layers Window
- [ ] Tree view of all elements in current frame
- [ ] Nested structure (children indented)
- [ ] Click to select element
- [ ] Drag to reorder (change z-index)
- [ ] Eye icon to hide/show element
- [ ] Lock icon to lock element (prevent editing)
- [ ] Rename element (double-click)

#### 6.4 Properties Window
- [ ] **Div Properties**: Width, height, background, border, padding, margin
- [ ] **Text Properties**: Content, font family, size, weight, color, alignment
- [ ] **Media Properties**: Source (media picker), alt text, object-fit
- [ ] **Layout**: Position (absolute/relative), X/Y, rotation
- [ ] **Effects**: Opacity, shadows, border radius
- [ ] Link to design tokens (e.g., select "Primary" color)

#### 6.5 Blocks Window
- [ ] List all user blocks (grouped by source page)
- [ ] Search/filter blocks
- [ ] Drag block to canvas to create instance
- [ ] Edit master block button (opens in new tab)
- [ ] Delete block (with confirmation)

#### 6.6 Tokens Window
- [ ] Quick access to design tokens
- [ ] Edit tokens inline (opens modal)
- [ ] Apply token to selected element

**Deliverable**: Complete page builder UI with all windows

---

## Milestone 7: User Blocks System

**Duration**: ~1-2 weeks
**Goal**: Convert selections to reusable blocks with master-instance system

### Tasks

#### 7.1 Block Creation
- [ ] Right-click context menu: "Convert to Block"
- [ ] Modal: Name block, select source page
- [ ] Save block with design events (elements + styles)
- [ ] Update database: create `Block` entry
- [ ] Create `BlockInstance` linking to original elements

#### 7.2 Block Instances
- [ ] Drag block from Blocks window to canvas
- [ ] Create new `BlockInstance` entry
- [ ] Replay block's design events in target frame
- [ ] Link instance to master block

#### 7.3 Master-Instance Sync
- [ ] Edit master block → updates all instances
- [ ] Visual indicator on instances (e.g., dotted border)
- [ ] "Edit Master" button in properties (opens master in new tab)

#### 7.4 Detachment
- [ ] Edit instance element → auto-detach
- [ ] Update `BlockInstance.isDetached = true`
- [ ] Store override events in `BlockInstance.overrideEvents`
- [ ] Detached instances no longer receive master updates

#### 7.5 Push to Master
- [ ] "Push Changes to Master" button (only for detached instances)
- [ ] Modal: Confirm changes
- [ ] Update master block's design events
- [ ] Re-sync all non-detached instances

**Deliverable**: Working user blocks with master-instance system

---

## Milestone 8: Baseline Grid & Snapping

**Duration**: ~1 week
**Goal**: Baseline grid for typography alignment

### Tasks

#### 8.1 Baseline Grid Rendering
- [ ] Create `/src/lib/components/baseline/BaselineGrid.svelte`
- [ ] Render horizontal lines based on grid unit (from tokens)
- [ ] Show/hide grid toggle (in toolbar or settings)
- [ ] Grid opacity control (faint lines, not distracting)

#### 8.2 Snap to Baseline
- [ ] When moving/resizing elements, snap to baseline grid
- [ ] Visual feedback: show snap guides
- [ ] Enable/disable snapping (Shift key to temporarily disable)
- [ ] Snap to grid unit multiples (e.g., 4px, 8px, 16px)

#### 8.3 Typography Baseline Alignment
- [ ] Text elements align to baseline (not top)
- [ ] Calculate line height based on baseline unit
- [ ] Typography tokens enforce baseline multiples

**Deliverable**: Working baseline grid with snapping

---

## Milestone 9: Publishing System

**Duration**: ~2-3 weeks
**Goal**: Generate Svelte code, publish pages, and export static sites

### Tasks

#### 9.1 Code Generator
- [ ] Create `/src/lib/utils/code-generator.ts`
  - [ ] `generateSvelteComponent()` - Convert design events to Svelte code
  - [ ] Generate HTML structure from element tree
  - [ ] Generate CSS styles (classes or inline)
  - [ ] Handle responsive breakpoints (mobile-first media queries)
  - [ ] Apply design tokens (CSS custom properties)
  - [ ] Optimize output (minify, remove unused styles)

#### 9.2 Publishing Service
- [ ] Create `/src/lib/server/services/publish.ts`
  - [ ] `publishPage()` - Generate code, save to database, create route
  - [ ] Store `publishedCode` in `Page` model
  - [ ] Create dynamic route: `/src/routes/[slug]/+page.server.ts`
  - [ ] Server-side render published Svelte components
  - [ ] Handle 404 for unpublished pages

#### 9.3 API Routes: Publishing
- [ ] `POST /api/pages/:id/publish` - Publish page
- [ ] `POST /api/pages/:id/unpublish` - Unpublish page
- [ ] `GET /api/pages/:id/preview` - Preview without publishing

#### 9.4 Preview Mode
- [ ] Preview button in designer toolbar
- [ ] Render page without saving (use current events)
- [ ] Toggle between designer and preview (same tab)

#### 9.5 Static Export
- [ ] Create `/src/lib/server/services/export.ts`
  - [ ] `exportSite()` - Generate .zip with HTML/CSS/assets
  - [ ] Pure HTML/CSS (no Svelte runtime)
  - [ ] Include all media files
  - [ ] Generate index.html for navigation
- [ ] Export button in admin panel
- [ ] Download .zip file

**Deliverable**: Working publishing system with preview and static export

---

## Milestone 10: Pages Management

**Duration**: ~1 week
**Goal**: Create, list, edit, and delete pages

### Tasks

#### 10.1 Pages Service
- [ ] Create `/src/lib/server/services/pages.ts`
  - [ ] `createPage()` - Create new page with default frame
  - [ ] `listPages()` - Get all pages for team
  - [ ] `getPage()` - Get single page with frames
  - [ ] `updatePage()` - Update page metadata (title, slug, SEO)
  - [ ] `deletePage()` - Delete page and all frames/instances

#### 10.2 API Routes: Pages
- [ ] `POST /api/pages` - Create page
- [ ] `GET /api/pages` - List all pages (with filters, search)
- [ ] `GET /api/pages/:id` - Get single page
- [ ] `PUT /api/pages/:id` - Update page metadata
- [ ] `DELETE /api/pages/:id` - Delete page

#### 10.3 Admin UI: Pages List
- [ ] Create `/src/routes/admin/pages/+page.svelte`
  - [ ] Grid/list view of all pages
  - [ ] Create new page button
  - [ ] Edit page button (opens designer)
  - [ ] Delete page (with confirmation)
  - [ ] Publish/unpublish toggle
  - [ ] Search and filter (published, draft, by author)
  - [ ] Page preview thumbnails (optional)

**Deliverable**: Complete page management UI

---

## Milestone 11: Team & User Management

**Duration**: ~1-2 weeks
**Goal**: Multi-user teams with role-based access control

### Tasks

#### 11.1 Team Service
- [ ] Create `/src/lib/server/services/teams.ts`
  - [ ] `createTeam()` - Create team with owner
  - [ ] `getTeam()` - Get team details
  - [ ] `updateTeam()` - Update team name/slug
  - [ ] `deleteTeam()` - Delete team (cascade to pages, media, etc.)

#### 11.2 Team Members Service
- [ ] Create `/src/lib/server/services/team-members.ts`
  - [ ] `inviteMember()` - Send invite email (or generate invite link)
  - [ ] `acceptInvite()` - User joins team
  - [ ] `updateMemberRole()` - Change role (Owner/Manager/Designer/Editor)
  - [ ] `removeMember()` - Remove user from team

#### 11.3 API Routes: Teams
- [ ] `POST /api/teams` - Create team
- [ ] `GET /api/teams/:id` - Get team
- [ ] `PUT /api/teams/:id` - Update team
- [ ] `DELETE /api/teams/:id` - Delete team
- [ ] `GET /api/teams/:id/members` - List team members
- [ ] `POST /api/teams/:id/members/invite` - Invite member
- [ ] `PUT /api/teams/:id/members/:userId/role` - Update member role
- [ ] `DELETE /api/teams/:id/members/:userId` - Remove member

#### 11.4 Admin UI: Team Settings
- [ ] Create `/src/routes/admin/team/+page.svelte`
  - [ ] Team name and slug
  - [ ] Members list with roles
  - [ ] Invite member form (email + role)
  - [ ] Remove member button (with confirmation)
  - [ ] Change member role dropdown
  - [ ] Leave team button (if not owner)
  - [ ] Delete team button (owner only, with confirmation)

#### 11.5 Permissions Enforcement
- [ ] Middleware: Check user role before actions
  - [ ] **Owner**: Full access (all CRUD operations, delete team)
  - [ ] **Manager**: Manage pages, media, members (except owner operations)
  - [ ] **Designer**: Create/edit pages, upload media (cannot publish or manage team)
  - [ ] **Editor**: Edit content only (cannot create pages or upload media)
- [ ] UI: Hide buttons based on user role
- [ ] API: Return 403 Forbidden if insufficient permissions

**Deliverable**: Working team system with RBAC

---

## Milestone 12: Theme Export/Import

**Duration**: ~1 week
**Goal**: Export entire sites as .baseline-theme files or via API

### Tasks

#### 12.1 Theme Export Service
- [ ] Create `/src/lib/server/services/theme-export.ts`
  - [ ] `exportTheme()` - Generate JSON with all pages, blocks, media, tokens
  - [ ] Include design events, published code, and metadata
  - [ ] Package as `.baseline-theme` file (JSON)
  - [ ] Include all media files (embedded as base64 or separate folder)

#### 12.2 Theme Import Service
- [ ] Create `/src/lib/server/services/theme-import.ts`
  - [ ] `importTheme()` - Parse .baseline-theme file
  - [ ] Create pages, frames, blocks, media entries
  - [ ] Validate data (check for conflicts, missing references)
  - [ ] Option: Overwrite existing or merge
  - [ ] Return import report (success, warnings, errors)

#### 12.3 API Routes: Theme
- [ ] `POST /api/themes/export` - Export as file download
- [ ] `POST /api/themes/import` - Upload and import .baseline-theme file
- [ ] `GET /api/themes/remote/:url` - Import from remote URL (API transfer)

#### 12.4 Admin UI: Theme Import/Export
- [ ] Create `/src/routes/admin/themes/export/+page.svelte`
  - [ ] Export button (downloads .baseline-theme file)
  - [ ] Options: Include media, include unpublished pages
- [ ] Create `/src/routes/admin/themes/import/+page.svelte`
  - [ ] File upload form (.baseline-theme)
  - [ ] Remote URL input (import from another LineBasis instance)
  - [ ] Import preview (show what will be imported)
  - [ ] Import button (with confirmation)

**Deliverable**: Working theme export/import system

---

## Milestone 13: Admin Dashboard & Navigation

**Duration**: ~1 week
**Goal**: Admin panel home page and navigation

### Tasks

#### 13.1 Admin Layout
- [ ] Create `/src/routes/admin/+layout.svelte`
  - [ ] Sidebar navigation (Pages, Media, Styles, Team, Settings)
  - [ ] User menu (profile, logout)
  - [ ] Team switcher (if user belongs to multiple teams)
  - [ ] Responsive design (collapse sidebar on mobile)

#### 13.2 Admin Dashboard
- [ ] Create `/src/routes/admin/+page.svelte`
  - [ ] Quick stats: Total pages, published pages, media count, team members
  - [ ] Recent pages (last edited)
  - [ ] Quick actions: New page, upload media, view published site
  - [ ] System status (optional)

#### 13.3 Settings Page
- [ ] Create `/src/routes/admin/settings/+page.svelte`
  - [ ] Site settings: Site name, URL, timezone
  - [ ] SEO defaults: Meta description, social image
  - [ ] User profile: Name, email, password change
  - [ ] Delete account (with confirmation)

**Deliverable**: Complete admin panel with navigation

---

## Milestone 14: Polish & Testing

**Duration**: ~2-3 weeks
**Goal**: Bug fixes, performance optimization, and comprehensive testing

### Tasks

#### 14.1 Performance Optimization
- [ ] Lazy load frames (render only visible frames on canvas)
- [ ] Debounce auto-save (avoid excessive writes)
- [ ] Optimize event replay (use snapshots for large histories)
- [ ] Code splitting (lazy load admin routes)
- [ ] Image optimization (use WebP, responsive images)

#### 14.2 Error Handling
- [ ] Global error boundary (catch React/Svelte errors)
- [ ] API error handling (consistent error responses)
- [ ] User-friendly error messages (no stack traces in production)
- [ ] Retry logic for failed requests
- [ ] Offline mode detection (show banner when offline)

#### 14.3 Unit Testing
- [ ] Test all services (auth, media, pages, tokens, teams)
- [ ] Test event reducer (all event types)
- [ ] Test code generator (Svelte output)
- [ ] Test permissions middleware
- [ ] Aim for >80% code coverage

#### 14.4 Integration Testing
- [ ] Test complete workflows (register → create page → publish)
- [ ] Test team collaboration (multiple users)
- [ ] Test theme export/import
- [ ] Test block master-instance sync

#### 14.5 UI/UX Polish
- [ ] Loading states (spinners, skeletons)
- [ ] Empty states (no pages, no media, no blocks)
- [ ] Confirmation dialogs (delete, logout, etc.)
- [ ] Keyboard shortcuts help panel (Cmd/Ctrl + ?)
- [ ] Tooltips for all buttons
- [ ] Responsive design (mobile-friendly admin panel)

#### 14.6 Documentation
- [ ] Update README.md with installation instructions
- [ ] Write user guide (how to use the page builder)
- [ ] Write API documentation
- [ ] Create video tutorials (optional)
- [ ] Update CHANGELOG.md

**Deliverable**: Polished, tested, and documented Phase 1 MVP

---

## Milestone 15: Deployment & Launch

**Duration**: ~1 week
**Goal**: Deploy Phase 1 MVP and launch publicly

### Tasks

#### 15.1 Production Setup
- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables (production)
- [ ] Set up SSL certificates (HTTPS)
- [ ] Configure domain and DNS
- [ ] Set up CDN for media files (optional)

#### 15.2 Deployment
- [ ] Deploy to production server (Vercel, Railway, DigitalOcean, etc.)
- [ ] Run database migrations
- [ ] Create first admin user
- [ ] Test all features in production
- [ ] Monitor for errors (Sentry, LogRocket, etc.)

#### 15.3 Launch Preparation
- [ ] Create demo site (showcase LineBasis features)
- [ ] Write launch blog post
- [ ] Prepare social media posts
- [ ] Create GitHub release (v1.0.0)
- [ ] Tag release: `git tag v1.0.0 && git push --tags`

#### 15.4 Launch
- [ ] Post on Hacker News, Reddit, Twitter, etc.
- [ ] Share in developer communities
- [ ] Collect feedback and bug reports
- [ ] Monitor analytics and usage
- [ ] Respond to GitHub issues

**Deliverable**: LineBasis Phase 1 MVP is live!

---

## Phase 1 Completion Checklist

Before moving to Phase 2, ensure:

- [ ] All 15 milestones completed
- [ ] All tests passing (>80% coverage)
- [ ] Production deployment is stable
- [ ] Documentation is complete and accurate
- [ ] At least 10 real users testing the platform
- [ ] No critical bugs or security issues
- [ ] Performance is acceptable (< 2s page load, < 100ms interactions)
- [ ] GitHub release v1.0.0 published
- [ ] Feedback collected and prioritized

**Once Phase 1 is complete, proceed to Phase 2: Custom Blocks**

---

## Notes

- **Flexibility**: This roadmap is a guide, not a contract. Milestones may be reordered or split based on feedback.
- **Building in Public**: Share progress on social media, blog, and GitHub discussions.
- **Community Feedback**: Actively listen to early adopters and iterate based on their needs.
- **Technical Debt**: Keep a backlog of technical debt items to address between phases.

---

## Next Steps

1. Review this roadmap and adjust milestones as needed
2. Break down Milestone 1 into daily tasks
3. Create feature branch: `git checkout -b feat/foundation-database`
4. Start implementing! 🚀

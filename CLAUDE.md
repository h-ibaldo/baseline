# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LineBasis** is an open-source design and CMS platform built to replace WordPress, Figma (for web), and Webflow. It offers a dual-mode architecture:

1. **Designer Mode**: Browser-based, local-first design tool with actual DOM manipulation
2. **CMS Mode**: Self-hosted full-stack CMS with authentication, media management, and publishing

**Tech Stack**: SvelteKit, TypeScript (strict mode), Prisma ORM, SQLite/PostgreSQL, Vitest

**Status**: Early development - NOT accepting external contributions yet. Powered by AI-assisted development (ChatGPT, Claude, Copilot).

---

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Open Vitest UI
npm run test:ui
```

### Type Checking
```bash
# Run type check
npm run check

# Watch mode
npm run check:watch
```

### Database Management

**IMPORTANT**: LineBasis uses a **plugin-based schema composition system**. The main schema is split into:
- `prisma/schema.core.prisma` - Core CMS models
- `plugins/*/prisma/schema.prisma` - Plugin-specific models

**Always use `npm run db:compose` before migrations** to merge schemas:

```bash
# Compose schemas from core + plugins
npm run db:compose

# Check schema composition without writing
npm run db:compose:check

# Create and apply migration
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio

# Complete setup (first time)
npm run setup
```

### Plugin Management
```bash
# Migrate blog posts to plugin system
npm run migrate:plugins

# Dry-run migration (check without applying)
npm run migrate:plugins:check
```

---

## Architecture Overview

### Dual-Mode Architecture

**Mode 1: Designer Tool (Browser-Only)**
- Local-first architecture using IndexedDB
- Event sourcing for perfect undo/redo
- DOM-based canvas (NOT Canvas API)
- Real-time code generation via AST
- Export to HTML/CSS/Svelte

**Mode 2: CMS (Self-Hosted)**
- Full-stack SvelteKit application
- JWT-based authentication with role-based access
- Media upload with Sharp optimization
- Publishing system (design → live pages)
- Admin panel with dashboard
- Plugin architecture for extensibility

### Core Systems

#### 1. Event Sourcing Architecture
- All design changes captured as events
- State derived from event history
- Perfect undo/redo via event navigation
- Persistence to IndexedDB with auto-save
- Event replay reconstructs state on load

**Key files**:
- `src/lib/stores/event-store.ts` - Event store with history
- `src/lib/stores/design-store.ts` - Design state management
- `src/lib/types/events.ts` - Event type definitions

#### 2. Baseline Grid System
InDesign-style typography grid for precise alignment:
- User-defined baseline height (4-32px)
- Global snap-to-baseline toggle
- Per-component override capability
- Visual grid overlay (toggleable)
- Comprehensive calculation utilities

**Key files**:
- `src/lib/utils/baseline.ts` - Grid calculations (7 core functions)
- `src/lib/stores/baseline.ts` - Grid configuration store
- `src/lib/components/baseline/` - Grid UI components

#### 3. Plugin System
**Architecture**: Dynamic plugin loading with schema composition
- Plugins can add Prisma models (automatic schema merging)
- API route registration
- Admin UI page registration
- Lifecycle hooks (install, activate, publish, etc.)
- Per-plugin settings storage

**Key files**:
- `src/lib/core/plugins/` - Plugin system core
  - `loader.ts` - Dynamic plugin loading
  - `registry.ts` - Plugin registration
  - `hooks.ts` - Lifecycle hook execution
  - `types.ts` - Plugin interface definitions
- `plugins/blog/` - Official blog plugin (reference implementation)
- `scripts/build-schema.ts` - Schema composition script

**Plugin Development**:
1. Create `plugins/[name]/` directory
2. Add `manifest.ts` with plugin metadata
3. Add `prisma/schema.prisma` for database models
4. Run `npm run db:compose` to merge schemas
5. Add API routes in `server/routes/`
6. Add admin pages in `admin/`

#### 4. Authentication System
JWT-based authentication with bcrypt:
- Access tokens (7-day expiry, Bearer header)
- Refresh tokens (30-day expiry, HTTP-only cookies)
- Role-based access control (admin, editor, author)
- Session management in database

**Key files**:
- `src/lib/server/services/auth.ts` - Auth service
- `src/lib/server/middleware/auth.ts` - Auth middleware (`requireAuth`, `requireRole`, `requireAdmin`)
- `src/routes/api/auth/*` - 6 auth endpoints

#### 5. Media Management
File upload with automatic image optimization:
- Sharp-based image processing (resize, compress)
- Support for images, PDFs, videos
- Storage in `static/uploads/`
- Metadata tracking (dimensions, size, mime type)

**Key files**:
- `src/lib/server/services/upload.ts` - Upload service
- `src/lib/server/services/media.ts` - Media CRUD
- `src/routes/api/media/*` - Media API endpoints

#### 6. Code Generation (AST)
Abstract Syntax Tree-based code generation:
- Parse design tree → Generate AST
- AST → Clean HTML/CSS/JS output
- Multiple export formats (HTML, Svelte, JSX)
- Runs in Web Worker for performance

**Key files**:
- `src/lib/utils/ast.ts` - AST generation
- `src/lib/utils/export.ts` - Export system
- `src/lib/workers/code-generator.ts` - Worker thread

### Project Structure

```
src/
├── routes/                    # SvelteKit routes
│   ├── +page.svelte          # Designer tool (main app)
│   ├── [slug]/               # Dynamic page rendering
│   ├── admin/                # Admin panel pages
│   │   ├── login/            # Login page
│   │   ├── pages/            # Page manager
│   │   ├── media/            # Media library
│   │   ├── users/            # User management
│   │   └── plugins/          # Plugin management
│   └── api/                  # API endpoints
│       ├── auth/             # Authentication
│       ├── pages/            # Page CRUD
│       ├── media/            # Media upload
│       ├── users/            # User management
│       └── plugins/          # Plugin management
├── lib/
│   ├── components/           # UI components
│   │   ├── canvas/           # Canvas components
│   │   ├── design/           # Design components (9 types)
│   │   ├── baseline/         # Grid components
│   │   └── ui/               # General UI
│   ├── stores/               # Svelte stores
│   │   ├── event-store.ts    # Event sourcing
│   │   ├── design-store.ts   # Design state
│   │   ├── baseline.ts       # Grid config
│   │   └── project-store.ts  # Project management
│   ├── utils/                # Utility functions
│   │   ├── baseline.ts       # Grid calculations
│   │   ├── ast.ts            # Code generation
│   │   ├── storage.ts        # IndexedDB wrapper
│   │   └── export.ts         # Export system
│   ├── types/                # TypeScript types
│   ├── core/
│   │   └── plugins/          # Plugin system
│   └── server/               # Server-side code
│       ├── db/
│       │   └── client.ts     # Prisma client
│       ├── services/         # Business logic
│       │   ├── auth.ts       # Authentication
│       │   ├── pages.ts      # Page CRUD
│       │   ├── media.ts      # Media CRUD
│       │   ├── upload.ts     # File upload
│       │   ├── users.ts      # User management
│       │   └── plugins.ts    # Plugin management
│       └── middleware/
│           └── auth.ts       # Auth middleware
├── tests/
│   └── setup.ts              # Vitest config
└── app.d.ts                  # Global types

prisma/
├── schema.core.prisma        # Core models
└── schema.prisma             # Generated (composed)

plugins/
└── blog/                     # Official blog plugin
    ├── manifest.ts           # Plugin metadata
    ├── prisma/
    │   └── schema.prisma     # Blog models (Post, Category, Tag)
    ├── server/               # API routes
    └── admin/                # Admin pages

scripts/
├── build-schema.ts           # Schema composition
├── setup-admin.ts            # Create admin user
└── migrate-to-plugins.ts     # Migration utility

docs/
├── planning/
│   ├── roadmap.md            # Development roadmap
│   ├── architecture.md       # Architecture details
│   └── cms-architecture.md   # CMS specifics
└── guides/                   # Development guides
```

---

## Database Schema (Core)

**Models**:
- `Page` - Published pages with design events, HTML/CSS output, SEO metadata
- `PageRevision` - Version history with event snapshots
- `Media` - Uploaded files with metadata
- `User` - Authentication with roles (admin/editor/author)
- `Session` - JWT refresh tokens
- `Setting` - Global configuration
- `Plugin` - Installed plugins registry

**Relations**:
- Page → User (author)
- Page → PageRevision[] (versions)
- Media → User (uploader)
- User → Session[] (active sessions)
- Plugin: Self-contained (no relations)

**Plugin Models** (via composition):
- Blog plugin adds: `Post`, `Category`, `Tag`
- Future plugins add their own models

---

## Git Workflow (MANDATORY)

### Branch Strategy
**ALWAYS create a feature branch for roadmap tasks**:

```bash
# Create branch before starting
git checkout -b feat/task-name

# Branch naming conventions:
feat/cms-authentication    # New features
feat/media-upload
feat/blog-system
fix/baseline-snap-bug      # Bug fixes
docs/update-readme         # Documentation
```

**NEVER work directly on main branch for roadmap tasks!**

### Workflow Steps
1. Create feature branch: `git checkout -b feat/task-name`
2. Implement with proper TypeScript types and error handling
3. Write/update tests - **ALL tests must pass**
4. **Update documentation BEFORE merging**:
   - Mark tasks complete in `docs/planning/roadmap.md`
   - Add features to `README.md`
   - Update `docs/planning/architecture.md` if needed
5. Commit with proper message format (see below)
6. Merge to main: `git checkout main && git merge feat/task-name`
7. Push: `git push origin main`
8. Delete branch: `git branch -d feat/task-name`

### Commit Message Format
```
type(scope): short description

[optional body with details]

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat(blog): implement blog plugin with posts and categories

- Add Post, Category, Tag models to plugin schema
- Create blog API endpoints with CRUD operations
- Add admin pages for blog management
- Implement SEO metadata for posts
- Add pagination and filtering

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Code Quality Standards

### TypeScript
- **Strict mode enabled** - No `any` types
- Define types for all functions and variables
- Use `unknown` instead of `any` when type is truly unknown
- Leverage path aliases: `$lib/*` for imports

### Error Handling
- **Always use try-catch** for async operations
- Validate all user inputs
- Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Include error messages in API responses

### Testing
- Write tests for all utility functions
- Test complex business logic in services
- Use Vitest with jsdom environment
- Run `npm run test:run` before committing

**Test files**: Co-locate with source (e.g., `baseline.ts` → `baseline.test.ts`)

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `auth-service.ts`)
- **Components**: `PascalCase.svelte` (e.g., `UserProfile.svelte`)
- **Functions**: `camelCase()` (e.g., `getUserData()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `UserData`)

### Documentation
- JSDoc comments for public APIs
- Inline comments for complex logic
- Update `docs/` before merging to main

---

## Common Development Tasks

### Adding a New API Endpoint

1. Create route file: `src/routes/api/[resource]/+server.ts`
2. Import services and middleware:
   ```typescript
   import { json } from '@sveltejs/kit';
   import { requireAuth } from '$lib/server/middleware/auth';
   import { someService } from '$lib/server/services/some-service';
   ```
3. Export handler with auth:
   ```typescript
   export const GET = requireAuth(async ({ locals }) => {
     const data = await someService.getAll();
     return json(data);
   });
   ```
4. Add error handling and validation

### Creating a New Service

1. Create file: `src/lib/server/services/[name].ts`
2. Import Prisma client: `import { db } from '$lib/server/db/client';`
3. Export service functions:
   ```typescript
   export const myService = {
     async create(data: CreateData) {
       // Validation
       // Database operation
       // Return result
     }
   };
   ```
4. Write tests: `[name].test.ts`

### Adding a New Plugin

1. Create directory: `plugins/[plugin-name]/`
2. Create `manifest.ts`:
   ```typescript
   import type { Plugin } from '$lib/core/plugins/types';

   export const manifest: Plugin = {
     id: '@linebasis/plugin-name',
     name: 'Plugin Name',
     version: '1.0.0',
     // ... routes, pages, hooks
   };
   ```
3. Add `prisma/schema.prisma` for models
4. Run `npm run db:compose` to merge schemas
5. Run `npm run db:migrate` to apply changes
6. Add API routes in `server/routes/`
7. Add admin pages in `admin/`

### Running Tests for Specific File

```bash
# Single file
npm test -- src/lib/utils/baseline.test.ts

# Watch mode for file
npm test -- src/lib/utils/baseline.test.ts --watch

# Pattern matching
npm test -- baseline
```

### Database Schema Changes

**CRITICAL**: Always compose schemas before migrations!

```bash
# 1. Edit schema.core.prisma OR plugin schema
# 2. Compose schemas
npm run db:compose

# 3. Create migration
npm run db:migrate

# 4. Generate Prisma client
npm run db:generate
```

---

## Important Implementation Details

### Event Sourcing Pattern
All design changes are captured as events, not state mutations:
```typescript
// Don't: Mutate state directly
state.elements[id].x = 100;

// Do: Dispatch event
dispatch({ type: 'MOVE_ELEMENT', elementId: id, position: { x: 100, y: 50 } });
```

State is derived from events via reducer:
```typescript
const currentState = events.reduce(applyEvent, initialState);
```

### Baseline Grid Calculations
Use utility functions for baseline conversions:
```typescript
import { snapToBaseline, toBaselineUnits } from '$lib/utils/baseline';

// Snap value to nearest baseline
const snapped = snapToBaseline(value, baselineHeight);

// Convert pixels to baseline units
const units = toBaselineUnits(pixels, baselineHeight);
```

### Authentication Middleware
Protect routes with middleware:
```typescript
import { requireAuth, requireAdmin, requireRole } from '$lib/server/middleware/auth';

// Any authenticated user
export const GET = requireAuth(async ({ locals }) => {
  const user = locals.user; // Available after auth
  // ...
});

// Admin only
export const DELETE = requireAdmin(async ({ locals }) => {
  // Only admins can access
});

// Specific roles
export const POST = requireRole(['admin', 'editor'], async ({ locals }) => {
  // Admins and editors only
});
```

### Media Upload Flow
```typescript
import { uploadFile } from '$lib/server/services/upload';

// 1. Get file from form data
const file = await request.formData().get('file');

// 2. Upload and optimize
const media = await uploadFile(file, userId);

// 3. Returns { id, url, filename, size, width, height, ... }
```

---

## Environment Configuration

### Required Environment Variables

Create `.env` file in project root:

```bash
# Database
DATABASE_URL="file:./dev.db"  # SQLite for local dev
# DATABASE_URL="postgresql://user:pass@localhost:5432/linebasis"  # PostgreSQL for production

# JWT Secret (generate secure random string)
JWT_SECRET="your-secure-random-string-here"

# Optional
NODE_ENV="development"
```

### First-Time Setup

```bash
# Install dependencies
npm install

# Setup database and create admin user
npm run setup

# Follow prompts to create admin account
# Default: admin@linebasis.com / admin123

# Start development server
npm run dev

# Visit http://localhost:5173/admin/login
```

---

## Testing Strategy

### What to Test
✅ **Always test**:
- Utility functions (baseline calculations, AST generation)
- Business logic in services
- Event reducers and state management

⏳ **Future**:
- API endpoint integration tests
- E2E tests for user workflows

❌ **Don't test**:
- Simple Svelte components (visual testing preferred)
- Third-party library wrappers
- Database queries (covered by service tests)

### Test File Location
Co-locate tests with source files:
```
src/lib/utils/
├── baseline.ts
└── baseline.test.ts
```

---

## AI Development Notes

This project embraces AI-assisted development while maintaining human oversight:

**AI is great for**:
- Boilerplate generation
- Type definitions
- Documentation writing
- Test scaffolding
- Code organization

**Human review required for**:
- Architecture decisions
- Security implementations
- Performance optimizations
- API design
- Database schema changes

**Process**:
1. AI generates initial code
2. Human reviews and tests
3. Human refines and optimizes
4. Human commits with AI credit

---

## Resources

- **Roadmap**: `docs/planning/roadmap.md` - Current phase and tasks
- **Architecture**: `docs/planning/architecture.md` - Detailed system design
- **Cursor Rules**: `.cursorrules` - AI development guidelines
- **SvelteKit Docs**: https://svelte.dev/docs/kit
- **Prisma Docs**: https://prisma.io/docs
- **Vitest Docs**: https://vitest.dev

---

**Last Updated**: Phase 2 Complete (Plugin Architecture)
**Current Phase**: Phase 3 - Advanced Features
**Remember**: Read this file at the start of every session!

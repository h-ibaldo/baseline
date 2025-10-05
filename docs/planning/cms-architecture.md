# CMS Architecture

## Overview

Baseline operates in **dual-mode architecture**: a browser-based designer tool AND a self-hosted CMS. This approach allows users to either design locally and export code, or install Baseline on their server and publish pages directly — truly replacing WordPress while maintaining designer-first philosophy.

## Vision Statement

**Replace WordPress, Figma (for web), and Webflow** by combining:
- Professional design experience (like Figma)
- Full code ownership (like WordPress)
- Direct publishing (like Webflow)
- Open source and self-hosted
- Modern technology stack

## Dual-Mode Architecture

### Mode 1: Designer Tool (Local-First, Browser-Based)

**Purpose**: Design and build pages without any server

**Features**:
- Runs entirely in browser
- No installation required
- Try at baseline.app
- IndexedDB storage
- Export code as ZIP
- Free forever
- Perfect for:
  - Freelancers designing for clients
  - Developers prototyping
  - Learning web design
  - Small static sites

**Technical Stack**:
- SvelteKit SPA mode (`ssr: false`)
- IndexedDB for project storage
- Web Workers for code generation
- Client-side only

**User Flow**:
```
1. Visit baseline.app
2. Design pages locally
3. Export code (HTML/CSS/Svelte)
4. Upload to any hosting service
```

### Mode 2: CMS (Self-Hosted, Full-Stack)

**Purpose**: Host on your server, design AND publish pages live

**Features**:
- Install on VPS/hosting service
- Integrated designer + publisher
- Database-backed content
- Media library
- User authentication
- Multi-page websites
- Blog system
- SEO tools
- Custom domains
- Perfect for:
  - Small to large websites
  - Blogs and publications
  - Business websites
  - E-commerce sites
  - Marketing agencies managing client sites

**Technical Stack**:
- SvelteKit SSR + adapter-node
- SQLite (simple) or PostgreSQL (advanced)
- File-based media storage
- JWT authentication
- REST API

**User Flow**:
```
1. Install Baseline on your server
2. Access admin at yourdomain.com/admin
3. Design pages in integrated designer
4. Click "Publish" → Live immediately at yourdomain.com/your-page
5. Manage content, media, users via admin panel
```

---

## System Architecture

### Directory Structure

```
baseline/
├── src/
│   ├── routes/
│   │   ├── app/                    # Designer Tool (SPA, client-only)
│   │   │   ├── +page.svelte       # Main designer interface
│   │   │   ├── +layout.ts         # export const ssr = false
│   │   │   └── canvas/            # Canvas components
│   │   │
│   │   ├── admin/                  # CMS Admin Panel (SSR)
│   │   │   ├── +layout.server.ts  # Auth guard
│   │   │   ├── pages/             # Page manager
│   │   │   ├── media/             # Media library
│   │   │   ├── users/             # User management
│   │   │   └── settings/          # Site settings
│   │   │
│   │   ├── api/                    # REST API
│   │   │   ├── pages/             # CRUD pages
│   │   │   ├── media/             # Upload/manage media
│   │   │   ├── auth/              # Login/logout
│   │   │   └── publish/           # Publishing endpoints
│   │   │
│   │   └── [...slug]/              # Published Pages (SSR)
│   │       └── +page.server.ts    # Load from database
│   │
│   ├── lib/
│   │   ├── server/                 # Server-only code
│   │   │   ├── db/                # Database layer
│   │   │   │   ├── schema.ts      # Database schema
│   │   │   │   ├── pages.ts       # Page queries
│   │   │   │   ├── media.ts       # Media queries
│   │   │   │   └── users.ts       # User queries
│   │   │   ├── auth/              # Authentication
│   │   │   │   ├── jwt.ts         # JWT handling
│   │   │   │   └── middleware.ts  # Auth middleware
│   │   │   └── publishing/        # Publishing logic
│   │   │       ├── generator.ts   # AST → HTML/CSS
│   │   │       └── renderer.ts    # SSR rendering
│   │   │
│   │   ├── components/            # Shared components
│   │   ├── stores/                # Svelte stores
│   │   ├── utils/                 # Utilities
│   │   └── types/                 # TypeScript types
│   │
│   └── hooks.server.ts            # SvelteKit hooks (auth, etc.)
│
├── prisma/                         # Database schema (if using Prisma)
│   └── schema.prisma
│
├── static/                         # Static assets
│   └── uploads/                   # Uploaded media
│
└── svelte.config.js               # SvelteKit config
```

---

## Database Schema

### Technology Choice

**Phase 1: SQLite** (Simple, file-based)
- Single file database
- No server setup required
- Perfect for small to medium sites
- Easy backups (just copy the file)
- 100% compatible with our event sourcing

**Phase 2: PostgreSQL** (Scalable)
- For larger installations
- Better concurrent writes
- Advanced features
- Cloud-ready

### Core Schema

```sql
-- Pages (the heart of the CMS)
CREATE TABLE pages (
  id TEXT PRIMARY KEY,              -- UUID
  slug TEXT UNIQUE NOT NULL,        -- URL slug (e.g., "about-us")
  title TEXT NOT NULL,              -- Page title
  description TEXT,                 -- Meta description (SEO)
  
  -- Design data (event sourcing)
  design_events JSON NOT NULL,      -- Array of design events
  design_state JSON,                -- Current state (derived from events)
  
  -- Published output (generated via AST)
  published_html TEXT,              -- Generated HTML
  published_css TEXT,               -- Generated CSS
  published_js TEXT,                -- Generated JavaScript (if needed)
  
  -- Status and metadata
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, published, archived
  author_id TEXT NOT NULL,          -- User who created it
  
  -- SEO
  meta_title TEXT,                  -- Custom meta title
  meta_description TEXT,            -- Custom meta description
  meta_image TEXT,                  -- OG image
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Media Library
CREATE TABLE media (
  id TEXT PRIMARY KEY,              -- UUID
  filename TEXT NOT NULL,           -- Original filename
  path TEXT NOT NULL,               -- Stored path
  url TEXT NOT NULL,                -- Public URL
  mime_type TEXT NOT NULL,          -- image/jpeg, video/mp4, etc.
  size INTEGER NOT NULL,            -- Bytes
  width INTEGER,                    -- Image width (if applicable)
  height INTEGER,                   -- Image height (if applicable)
  alt_text TEXT,                    -- Accessibility
  caption TEXT,                     -- Optional caption
  uploaded_by TEXT NOT NULL,        -- User ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Users and Authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,      -- Bcrypt hash
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'author',  -- admin, editor, author, subscriber
  avatar_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',  -- active, suspended
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Site Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'string',  -- string, number, boolean, json
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (for JWT refresh tokens)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Page Revisions (optional, for version history)
CREATE TABLE page_revisions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  design_events JSON NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (page_id) REFERENCES pages(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_author ON pages(author_id);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

---

## Publishing Workflow

### Design → Publish Flow

```
┌─────────────────┐
│ 1. Design Page  │
│   (Event Store) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Generate AST │
│   (Web Worker)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Generate Code│
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Save to DB   │
│  + Design Events│
│  + Generated Code
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Publish Live │
│ yoursite.com/slug
└─────────────────┘
```

### Implementation

```typescript
// Publishing service
export class PublishingService {
  async publishPage(pageId: string): Promise<void> {
    // 1. Load design events from database
    const page = await db.pages.findUnique({ where: { id: pageId } });
    const events = page.design_events;
    
    // 2. Reconstruct design state
    const state = replayEvents(events);
    
    // 3. Generate AST from state
    const ast = generateAST(state);
    
    // 4. Generate HTML/CSS/JS
    const html = generateHTML(ast);
    const css = generateCSS(ast);
    const js = generateJS(ast);
    
    // 5. Save generated code to database
    await db.pages.update({
      where: { id: pageId },
      data: {
        published_html: html,
        published_css: css,
        published_js: js,
        status: 'published',
        published_at: new Date()
      }
    });
  }
}
```

### SSR Rendering

```typescript
// src/routes/[...slug]/+page.server.ts
export async function load({ params }) {
  const slug = params.slug;
  
  // Load page from database
  const page = await db.pages.findUnique({
    where: { slug, status: 'published' }
  });
  
  if (!page) {
    throw error(404, 'Page not found');
  }
  
  // Return pre-generated HTML/CSS
  return {
    title: page.title,
    description: page.description,
    html: page.published_html,
    css: page.published_css,
    js: page.published_js
  };
}
```

---

## Authentication System

### JWT-Based Authentication

```typescript
// src/lib/server/auth/jwt.ts
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}
```

### Auth Middleware

```typescript
// src/hooks.server.ts
export async function handle({ event, resolve }) {
  const token = event.cookies.get('auth_token');
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      event.locals.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      };
    }
  }
  
  // Protect admin routes
  if (event.url.pathname.startsWith('/admin')) {
    if (!event.locals.user) {
      throw redirect(303, '/login');
    }
  }
  
  return resolve(event);
}
```

---

## Installation Methods

### Method 1: npm/npx (Recommended)

```bash
# Create new Baseline CMS installation
npx create-baseline-cms@latest my-website

cd my-website

# Install dependencies
npm install

# Setup (creates database, admin user)
npm run setup

# Start production server
npm run start
```

### Method 2: Docker

```bash
# Pull image
docker pull baseline/cms:latest

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/static/uploads \
  -e JWT_SECRET=your-secret-here \
  --name baseline-cms \
  baseline/cms:latest

# Access at http://localhost:3000
```

### Method 3: Manual Installation

```bash
# Clone repository
git clone https://github.com/baseline/baseline.git
cd baseline

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Setup database
npm run db:setup

# Build for production
npm run build

# Start server
npm run start
```

---

## Environment Configuration

```bash
# .env.example

# Mode: "designer" (SPA only) or "cms" (full CMS)
MODE=cms

# Database
DATABASE_URL="file:./data/baseline.db"  # SQLite
# DATABASE_URL="postgresql://user:pass@localhost:5432/baseline"  # PostgreSQL

# Authentication
JWT_SECRET="your-very-secret-key-change-this"
SESSION_EXPIRY=7d

# Server
PORT=3000
HOST=0.0.0.0

# Site Configuration
SITE_NAME="My Website"
SITE_URL="https://yourdomain.com"

# Media Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,video/mp4"

# Email (for password reset, notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Admin User (created on first setup)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=changeme123
```

---

## User Roles & Permissions

### Role Hierarchy

1. **Administrator**
   - Full access to everything
   - Manage users
   - Change site settings
   - Install plugins/themes
   - Delete any content

2. **Editor**
   - Create, edit, publish, delete any pages
   - Upload media
   - Manage media library
   - Cannot manage users or settings

3. **Author**
   - Create and edit own pages
   - Publish own pages
   - Upload media
   - Cannot edit others' content

4. **Subscriber**
   - Read-only access
   - View drafts (if shared)
   - No publishing capabilities

### Permission Matrix

| Action | Admin | Editor | Author | Subscriber |
|--------|-------|--------|--------|------------|
| Create page | ✅ | ✅ | ✅ | ❌ |
| Edit own page | ✅ | ✅ | ✅ | ❌ |
| Edit others' page | ✅ | ✅ | ❌ | ❌ |
| Publish page | ✅ | ✅ | ✅ | ❌ |
| Delete page | ✅ | ✅ | Own only | ❌ |
| Upload media | ✅ | ✅ | ✅ | ❌ |
| Manage media | ✅ | ✅ | Own only | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Change settings | ✅ | ❌ | ❌ | ❌ |

---

## API Design

### REST API Endpoints

```
Authentication:
POST   /api/auth/login          - Login
POST   /api/auth/logout         - Logout
POST   /api/auth/refresh        - Refresh token
POST   /api/auth/register       - Register (if enabled)

Pages:
GET    /api/pages               - List all pages
GET    /api/pages/:id           - Get page by ID
POST   /api/pages               - Create new page
PUT    /api/pages/:id           - Update page
DELETE /api/pages/:id           - Delete page
POST   /api/pages/:id/publish   - Publish page
POST   /api/pages/:id/unpublish - Unpublish page

Media:
GET    /api/media               - List media
GET    /api/media/:id           - Get media by ID
POST   /api/media/upload        - Upload file
DELETE /api/media/:id           - Delete media

Users (Admin only):
GET    /api/users               - List users
GET    /api/users/:id           - Get user
POST   /api/users               - Create user
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user

Settings (Admin only):
GET    /api/settings            - Get all settings
PUT    /api/settings            - Update settings
```

### Example Request/Response

```typescript
// POST /api/pages
{
  "title": "About Us",
  "slug": "about-us",
  "description": "Learn about our company",
  "design_events": [...],  // Event sourcing events
  "status": "draft"
}

// Response
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "About Us",
  "slug": "about-us",
  "status": "draft",
  "created_at": "2025-10-05T12:00:00Z",
  "updated_at": "2025-10-05T12:00:00Z"
}
```

---

## Migration Path

### For Existing Baseline Users (Designer Mode)

```typescript
// Export from IndexedDB (browser)
const projects = await exportAllProjects();

// Import to CMS (server)
POST /api/migrate/import
{
  "projects": projects
}
```

### From WordPress

```bash
# WordPress export plugin
npm run migrate:wordpress -- --file=wordpress-export.xml

# Converts WordPress posts → Baseline pages
# Imports media
# Converts categories/tags
```

---

## Deployment Examples

### VPS (Ubuntu/Debian)

```bash
# On your server
ssh user@yourserver.com

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/baseline/baseline.git
cd baseline
npm install
npm run setup
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "baseline" -- start
pm2 save
pm2 startup
```

### Shared Hosting (cPanel)

```bash
# Upload built files via FTP/SFTP
# Setup Node.js app in cPanel
# Point to build/index.js
# Configure environment variables
```

### Cloud Platforms

**Vercel/Netlify** (Designer Mode only):
```bash
npm run build
# Deploy build/ directory
```

**Railway/Render** (Full CMS):
```bash
# Connect GitHub repo
# Auto-deploy on push
# Add environment variables
```

---

## Performance & Scalability

### Caching Strategy

```typescript
// Page caching
const cache = new Map<string, CachedPage>();

export async function getCachedPage(slug: string) {
  // Check cache first
  if (cache.has(slug)) {
    const cached = cache.get(slug);
    if (cached.expiresAt > Date.now()) {
      return cached.html;
    }
  }
  
  // Load from database
  const page = await db.pages.findUnique({ where: { slug } });
  
  // Cache for 1 hour
  cache.set(slug, {
    html: page.published_html,
    expiresAt: Date.now() + 3600000
  });
  
  return page.published_html;
}
```

### CDN Integration

```typescript
// Invalidate CDN on publish
export async function publishPage(pageId: string) {
  await generateAndSaveCode(pageId);
  
  // Purge CDN cache
  await purgeCDN([
    `/page/${pageId}`,
    `/api/pages/${pageId}`
  ]);
}
```

---

## Security Considerations

### Input Validation

```typescript
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  design_events: z.array(z.any()),
  status: z.enum(['draft', 'published', 'archived'])
});
```

### SQL Injection Prevention

- Use Prisma ORM (parameterized queries)
- Never concatenate user input into SQL
- Validate all inputs

### XSS Prevention

- Sanitize HTML output
- Use CSP headers
- Escape user-generated content

### CSRF Protection

- SvelteKit built-in CSRF protection
- Use CSRF tokens for forms
- SameSite cookies

---

## Future Enhancements

### Phase 2 Features
- Multi-language support (i18n)
- Advanced SEO tools
- Analytics integration
- A/B testing
- Form builder
- E-commerce integration

### Phase 3 Features
- Multi-site management
- Advanced caching (Redis)
- Real-time collaboration
- Version control (Git integration)
- Automated backups
- CDN optimization

---

## Comparison: Designer Mode vs CMS Mode

| Feature | Designer Mode | CMS Mode |
|---------|---------------|----------|
| **Installation** | None (browser) | Server required |
| **Storage** | IndexedDB | Database (SQLite/PostgreSQL) |
| **Publishing** | Export code | Direct publish |
| **Cost** | Free | Free (self-hosted) |
| **Users** | Single | Multiple with roles |
| **Media** | Local files | Media library |
| **Domains** | Export anywhere | Own domain |
| **Updates** | Manual upload | Instant |
| **Backups** | Manual | Automated |
| **Best For** | Prototyping, learning | Production sites |

---

This architecture provides the foundation for Baseline to truly replace WordPress while maintaining its designer-first philosophy. The dual-mode approach gives users flexibility: try for free in the browser, then upgrade to self-hosted CMS when ready to go live.


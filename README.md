# LineBasis

An open source project with huge ambition and expectations. The goal of this project is to fill a gap in the market of webdesign ecosystems replacing Wordpress, Figma (for web) and tools like Webflow. The success metric is to power 20% of the web in 5 years.

**Official Website:** [linebasis.org](https://linebasis.org) (linebasis.com redirects here)

## The problems we're trying to solve:

1. **WordPress** allows full customization and you own the code. It's not platform dependent. But offers a poor and extremely outdated DX and UX and technology.

2. **Figma** is private sector. It's the best design experience (but still can be highly improved). Dynamic UX. However, you don't design directly with web components. A div is not a div. As a result, only complicated and stressful layers of abstraction are offered to bridge the gap between design and code.

3. **Webflow and similar tools** are private sector. They allow you to design with the actual code of your website. But you have to pay high fees. You cannot change much of the tool itself. 

## How we solve this:

**Dual-Mode Architecture**: Baseline works in two ways:

1. **Designer Mode** (Browser-based, Local-First)
   - Design and build pages entirely in your browser
   - No installation or server required
   - Export clean code (HTML/CSS/Svelte)
   - Perfect for prototyping, learning, or designing for clients
   - Try it free at baseline.app

2. **CMS Mode** (Self-Hosted, Full-Stack)
   - Install on your own server (VPS, shared hosting, Docker)
   - Design AND publish pages directly to your domain
   - Full content management system
   - Multi-user support with role-based permissions
   - Media library, SEO tools, blog system
   - True WordPress replacement with modern technology

**Design Experience**: Clean, light, dynamic (multiple artboards), you design with the actual code of your actual page. Designer focused. Allows you to design a visual identity for the website with variables and components, templates and themes. Allows you to design based on a line basis grid. Aligns text to baseline grid like InDesign, appealing to demanding Graphic Designers. Built in animation system in the future.

**You own everything**: The code, the data, and the platform. Developers or curious designers can change anything. Extensible via plugin system, themes, and component libraries.

**100% free and open-source.** Currently in early development - not accepting external contributions yet. Will open contributions once the core foundation is established.

## Development

This project is built with SvelteKit and TypeScript.

### Getting Started

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

- `src/routes/` - Application pages and routes
- `src/lib/` - Reusable components and utilities
- `static/` - Static assets
- `docs/` - Project documentation and planning

### Current Status

**⚠️ Early Development Phase**

LineBasis is currently in early development and is **NOT accepting external contributions** at this time.

**✅ Phase 1 - Designer Tool (COMPLETED):**
- ✅ **DOM-based Canvas** - Infinite canvas with multiple artboards, drag-and-drop, selection, resize handles, multi-select
- ✅ **Baseline Grid System** - InDesign-style baseline alignment with snap-to-grid, visual overlay, per-component overrides
- ✅ **Event Sourcing** - Perfect undo/redo with complete event history and time-travel debugging
- ✅ **IndexedDB Persistence** - Local-first architecture with auto-save, project management, and offline support
- ✅ **Component Library** - 9 baseline-aware design components (Typography, Layout, Forms)
- ✅ **AST Code Generation** - Complete code generation pipeline with HTML/CSS output
- ✅ **Export System** - ZIP download with multiple presets and configuration options
- ✅ **Testing Framework** - Vitest setup with 44 comprehensive tests

**Phase 1 is complete!** You can now design in Baseline and export production-ready HTML/CSS.

**✅ Phase 1.5 - CMS Foundation (COMPLETED):**
- ✅ **Database Layer** - Complete Prisma ORM setup with SQLite, CRUD services for pages, users, media, and settings
- ✅ **Publishing System** - Full design-to-live-page workflow with API endpoints and SSR rendering
- ✅ **Authentication & JWT** - User registration, login, JWT tokens, session management, role-based access
- ✅ **Media Upload** - File upload with image optimization, storage management, validation
- ✅ **Admin Panel** - Beautiful admin interface with dashboard, login page, and statistics

**Phase 1.5 is complete!** LineBasis is now a functional self-hosted CMS!

**✅ Phase 2 - CMS Core Features (COMPLETED):**
- ✅ Enhanced admin panel (page manager, media library UI, user management)
- ✅ Advanced publishing (preview, scheduling, revisions UI)
- ✅ SEO tools and optimization
- ✅ **Plugin Architecture** - Extensible plugin system with lifecycle hooks, schema composition, and dynamic loading
- ✅ **Blog Plugin** - First official plugin with posts, categories, tags, and SEO support

**Phase 2 is complete!** LineBasis now has a powerful plugin architecture!

**🔌 Plugin System:**
- **Modular Architecture**: Extend LineBasis without touching core code
- **Database Integration**: Plugins can add their own Prisma models via automatic schema composition
- **API Routes**: Plugins register their own API endpoints
- **Admin UI**: Plugins add custom admin pages and navigation
- **Lifecycle Hooks**: React to core events (page publish, user create, etc.)
- **Settings**: Each plugin can define configurable settings
- **Blog Plugin**: Full-featured blog system as the first official plugin

**🚀 Phase 3 - Advanced Features (IN PROGRESS):**
- ✅ **SEO Tools** - Automatic XML sitemap + robots.txt generation
- Theme system and marketplace
- Component marketplace
- Advanced SEO and analytics
- Multi-language support
- Custom post types framework
- API documentation and GraphQL

Contributions will open once we have a stable foundation. Watch the repository for updates!

### Key Features

**Designer Tool:**
- **Design with actual code**: DOM-based canvas, not Canvas API abstraction
- **Baseline grid alignment**: Like InDesign, for demanding designers
- **Local-first**: Your designs live in your browser (IndexedDB) with auto-save
- **Event sourcing**: Perfect undo/redo and time-travel debugging
- **Project management**: Create, save, load, and manage multiple design projects
- **Component library**: 9 baseline-aware components ready to use
- **Export code**: Generate clean HTML/CSS and download as ZIP

**CMS Mode (Available Now!):**
- **Self-hosted**: Install on your own server, full control
- **Authentication**: User registration, login, JWT tokens, sessions
- **Media management**: Upload images/files with automatic optimization
- **Publishing**: Design → Publish → Live on your domain (via API)
- **Admin panel**: Beautiful interface for managing your CMS
- **Plugin system**: Extend functionality without touching core code
- **Blog plugin**: Full-featured blog with posts, categories, and tags
- **SEO Ready**: Automatic XML sitemap + robots.txt generation
- **Modern stack**: SvelteKit + TypeScript + SQLite/PostgreSQL
- **Multi-user**: Role-based permissions (Admin, Editor, Author)
- **You own everything**: Code, data, platform - no vendor lock-in

**Quick Start:**
```bash
npm install
npm run setup        # Create database & admin user
npm run dev         # Start server
# Visit http://localhost:5173/admin/login
# Default: admin@linebasis.com / admin123
```

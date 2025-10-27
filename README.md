# LineBasis

**A self-hosted visual website builder with professional design tools and modern technology.**

Design websites visually with real web components. Own your code, your data, your platform. No monthly fees. 100% open source.

---

## The Problem

After shipping successful products like TidyCal, SendFox, and BreezeDoc at AppSumo Originals, I kept hitting the same wall when building websites:

**WordPress?** Free and self-hosted, but Gutenberg is a nightmare. You build React blocks that convert to PHP. It breaks constantly.

**Visual builders (Webflow, Framer)?** Beautiful editors, but you're paying $15-30/month per site to rent your own website. The code isn't really yours. You can't customize the platform.

**Figma + code it yourself?** Figma components aren't real web components. Divs aren't divs. The design-to-code handoff adds unnecessary abstraction layers.

And here's what really bugs me: graphic designers figured out typography and layout 100 years ago. Baseline grids, vertical rhythm, proper alignment—these aren't new problems. But most web design tools ignore them.

## The Solution

LineBasis is the tool I wish existed:

✅ **Visual website builder** with polished, modern UX
✅ **Self-hosted and 100% open source** - Install once, use forever
✅ **Design with real web elements** - Divs are divs, components are components
✅ **Own everything** - Your code, your data, your platform
✅ **No monthly fees** - Pay once for hosting, that's it
✅ **Modern tech stack** - SvelteKit, TypeScript, Prisma
✅ **Baseline grid support** - Because typography matters

Build sites for friends, side projects, product landing pages—whatever you need. Customize it if you want. It's your platform.

---

## Key Features

### 🎨 Professional Page Builder
- **Illustrator-style interface**: Floating windows, infinite canvas, keyboard shortcuts
- **3 atomic components**: Div (layout), Text (typography), Media (images/videos)
- **Frames**: Multi-artboard canvas like Figma - design desktop, tablet, mobile in one view
- **Baseline grid**: InDesign-style typography alignment with snap-to-grid
- **Event sourcing**: Perfect undo/redo with complete design history
- **Local-first**: Design in browser with IndexedDB, auto-save every 30 seconds

### 🧩 Reusable Blocks
- **Convert designs to blocks**: Select elements → right-click → "Convert to Block"
- **Master-instance system**: Edit master block → updates all instances across all pages
- **Auto-detachment**: Edit an instance → automatically detaches for one-off customization
- **Push to master**: Like your changes? Push them back to the master block
- **Organized by source page**: Blocks grouped by the page where they were created

### 📐 Design System (Tokens)
- **Global tokens**: Colors, typography, spacing, effects
- **Typography presets**: Heading 1-6, Body, Caption, Small
- **Theme colors**: Primary, Secondary, Accent, Text, Muted
- **Baseline grid**: Configure grid unit (4-32px), snap elements to rhythm
- **One-click updates**: Change token → all components using it update

### 📝 Blog System (Plugin)
- **Design blog templates**: Create layouts in page builder for homepage, single post, archives
- **Notion-like editor**: Rich text with slash commands, inline formatting, media embeds
- **PostContent block**: Special block that renders blog post content in templates
- **Categories & Tags**: Organize posts with flexible taxonomy
- **SEO-ready**: Meta tags, social preview images, automatic sitemaps

### 🚀 Publishing & Export
- **Server-side rendering**: Published pages render as Svelte components with SSR
- **Responsive CSS**: Design breakpoints → generates mobile-first media queries
- **Static export**: Download pages as pure HTML/CSS .zip for hosting anywhere
- **Theme sharing**: Export/import entire sites (.baseline-theme files or API transfer)

### 👥 Multi-User & Permissions
- **Role-based access**: Owner, Manager, Designer, Editor
- **Team collaboration**: Invite members, assign roles, manage access
- **JWT authentication**: Secure login with refresh tokens
- **Per-resource permissions**: Fine-grained control over who can edit/publish/delete

### 🔌 Plugin Architecture
- **Extensible core**: Add features without touching core code
- **Database integration**: Plugins add Prisma models via schema composition
- **API routes**: Plugins register custom endpoints
- **Admin UI**: Plugins add pages to admin panel
- **Lifecycle hooks**: React to events (page publish, user create, etc.)

---

## Current Status

**⚠️ Replanning Phase Complete - Implementation Starting**

LineBasis is being rebuilt from the ground up with a clear, well-documented architecture.

### ✅ Planning Complete (October 2024)

Complete technical specifications written:

- **[app.md](docs/planning/app.md)** - Application structure, routing, UI specifications (720 lines)
- **[page-builder-spec.md](docs/planning/page-builder-spec.md)** - Designer interface specification (1,196 lines)
- **[architecture.md](docs/planning/architecture.md)** - Technical architecture, database schema, event sourcing (3,426 lines)
- **[workflows.md](docs/planning/workflows.md)** - User workflows and journeys (1,321 lines)
- **[component-properties.md](docs/planning/components-properties.md)** - Component property specifications (667 lines)
- **[custom-blocks.md](docs/planning/custom-blocks.md)** - Custom block developer guide (Phase 2) (NEW)

**Total**: 7,330+ lines of comprehensive documentation

### 🚀 Phased Release Strategy

**Phase 1: Core Page Builder (MVP)** - Build in Public
- ✅ Local-first designer (IndexedDB, auto-save)
- ✅ 3 atomic components (Div, Text, Media)
- ✅ Event sourcing (undo/redo)
- ✅ User blocks (from design selections)
- ✅ Multi-frame canvas (responsive breakpoints)
- ✅ Design tokens (colors, typography, spacing)
- ✅ Publishing (events → Svelte → SSR)
- ✅ Authentication & teams (JWT + RBAC)
- ✅ Media library
- ✅ Theme export/import

**Focus**: Ship core fast, validate architecture, gather feedback

**Phase 2: Custom Blocks** - Developer Extensibility
- 🔲 Custom block system (coded Svelte components)
- 🔲 Property schema (auto-generated UI)
- 🔲 Custom property editors
- 🔲 Local blocks (`/blocks/` folder)
- 🔲 Plugin block registration API

**Focus**: Enable developers to build coded blocks (carousels, animations, client-specific features)

**Phase 3: Plugin Ecosystem** - Community Growth
- 🔲 Blog plugin (@linebasis/blog - PostContent block, admin UI, Post/Category/Tag models)
- 🔲 Forms plugin (@linebasis/forms - FormBuilder block, submission handling)
- 🔲 Plugin marketplace
- 🔲 Plugin browser in admin
- 🔲 Community plugins

**Focus**: Blog/forms as example plugins, plugin marketplace, ecosystem

**Phase 4+: Advanced Features** - Long-term Vision
- 🔲 E-commerce plugin
- 🔲 Comments system
- 🔲 Multi-language support
- 🔲 Advanced analytics
- 🔲 A/B testing
- 🔲 Collaboration (multi-user editing)

**Benefits of Phased Approach**:
- ✅ Ship Phase 1 faster (build momentum, early feedback)
- ✅ Validate architecture before adding complexity
- ✅ Blog/forms become "how to build plugins" examples
- ✅ Developers can build custom blocks for client work
- ✅ Core stays minimal and focused

**Not accepting external contributions yet.** Will open contributions once Phase 1 is stable.

---

## Quick Start (For Developers)

### Prerequisites

- Node.js 18+
- PostgreSQL (production) or SQLite (development)

### Installation

```bash
# Clone repository
git clone https://github.com/linebasis/linebasis.git
cd linebasis

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Setup database and create admin user
npm run setup

# Start development server
npm run dev
```

Visit `http://localhost:5173/admin/login` and log in with the admin account created during setup.

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Type checking
npm run check

# Database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

---

## Technology Stack

**Frontend:**
- SvelteKit - Full-stack framework
- Svelte - UI components
- TypeScript - Type safety (strict mode)
- IndexedDB - Local storage for designs
- Tailwind CSS - Utility-first CSS

**Backend:**
- SvelteKit - API routes and SSR
- Prisma ORM - Type-safe database access
- PostgreSQL - Production database
- SQLite - Development database
- bcrypt - Password hashing
- jsonwebtoken - JWT authentication

**Media:**
- Sharp - Image optimization and processing

**Testing:**
- Vitest - Unit and integration tests
- Testing Library - Component testing

---

## Architecture Highlights

### Local-First Design
- Designer works entirely client-side (IndexedDB)
- Zero server latency during design
- Auto-save every 30 seconds
- Publish when ready → sends events to server

### Event Sourcing
- Every design action is an event
- Append-only event log
- Perfect undo/redo (time travel through history)
- Events replay to build current state

### Code Generation
- Design events → Component tree → AST → Svelte code
- Clean, semantic HTML output
- Mobile-first CSS with media queries
- SEO-friendly structure

### Plugin System
- Prisma schema composition (plugins add models)
- Dynamic route registration
- Lifecycle hooks
- Admin UI extensions

See **[architecture.md](docs/planning/architecture.md)** for complete technical details.

---

## Documentation

### Planning Docs
- **[project-vision.md](docs/planning/project-vision.md)** - Why LineBasis exists
- **[app.md](docs/planning/app.md)** - Application structure and routing (720 lines)
- **[page-builder-spec.md](docs/planning/page-builder-spec.md)** - Designer interface (830 lines)
- **[architecture.md](docs/planning/architecture.md)** - Technical architecture (2,766 lines)
- **[workflows.md](docs/planning/workflows.md)** - User journeys (1,321 lines)
- **[component-properties.md](docs/planning/components-properties.md)** - Component specs (667 lines)
- **[roadmap.md](docs/planning/roadmap.md)** - Development roadmap

### Developer Docs
- **[CLAUDE.md](CLAUDE.md)** - Development guidelines for AI assistants

---

## Project Philosophy

This is a solo project by Ibaldo, built with deep focus on complex problems. I'm autistic, so I work best solo with sustained concentration. That's how Linux started. That's how Laravel started. And that's how I'm building this—one focused sprint at a time.

The goal isn't just to build another website builder. It's to create a tool that respects designers' expertise (baseline grids, typography), respects developers' needs (real code, modern stack), and respects users' freedom (self-hosted, open source, no lock-in).

It's ambitious. It's early. But after shipping multiple successful products, I know what it takes to build something people actually use.

---

## Contributing

**Not accepting external contributions at this time.**

LineBasis is in active early development with frequent architectural changes. External contributions would create coordination overhead that slows progress.

Once the core foundation is stable and well-tested, contributions will be welcome. Watch the repository for updates.

**Ways to help right now:**
- ⭐ Star the repository to show support
- 👀 Watch for release announcements
- 💬 Share feedback in Discussions (coming soon)
- 🐛 Report bugs in Issues (when alpha releases)

---

## License

MIT License - See [LICENSE](LICENSE) for details.

**You own everything you create with LineBasis.** The platform is yours to modify, extend, or fork.

---

## Contact

- **Author**: Ibaldo
- **Website**: [linebasis.org](https://linebasis.org)
- **Repository**: [github.com/linebasis/linebasis](https://github.com/linebasis/linebasis)

---

Built with focus, shipped with care.

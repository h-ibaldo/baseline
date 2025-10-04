# Baseline

An open source project with huge ambition and expectations. The goal of this project is to fill a gap in the market of webdesign ecosystems replacing Wordpress, Figma (for web) and tools like Webflow. The success metric is to power 20% of the web in 5 years.

## The problems we're trying to solve:

1. **WordPress** allows full customization and you own the code. It's not platform dependent. But offers a poor and extremely outdated DX and UX and technology.

2. **Figma** is private sector. It's the best design experience (but still can be highly improved). Dynamic UX. However, you don't design directly with web components. A div is not a div. As a result, only complicated and stressful layers of abstraction are offered to bridge the gap between design and code.

3. **Webflow and similar tools** are private sector. They allow you to design with the actual code of your website. But you have to pay high fees. You cannot change much of the tool itself. 

## How to solve this:

**Design Experience**: Clean, light, dynamic (multiple artboards), you design with the actual code of your actual page. Designer focused. Allows you to design a visual identity for the website with variables and components, templates and themes. Allows you to design based on a baseline. Aligns text to baseline like InDesign, appealing to demanding Graphic Designers. Built in animation system in the future.

You own the code and your platform. Developers or curious designers can change anything. Incentive to build plugins (must have plugin system), themes and libraries.

100% free and open-source. **Currently in early development - not accepting contributions yet.** Will open contributions once the core foundation is established. Might offer paid hosted options in the future.

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

Baseline is currently in early development and is **NOT accepting external contributions** at this time. We're focusing on:

- DOM-based canvas with actual web elements
- Baseline grid system implementation
- Event sourcing for state management
- AST-based code generation
- Local-first architecture (IndexedDB)
- Core component library

Contributions will open once we have a stable foundation. Watch the repository for updates!

### Key Features

- **Design with actual code**: DOM-based canvas, not Canvas API abstraction
- **Baseline grid alignment**: Like InDesign, for demanding designers
- **Local-first**: Your designs live in your browser (IndexedDB)
- **Event sourcing**: Perfect undo/redo and time-travel debugging
- **AST code generation**: Clean, optimized code output
- **You own everything**: Code, data, and platform

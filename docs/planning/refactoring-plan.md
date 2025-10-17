# Comprehensive Refactoring Plan

## Overview

This document outlines the complete refactoring needed to implement the new unified designer architecture with component system, blog templates, theme exporting, and style libraries.

## Phase 1: Architecture Consolidation

### 1.1 Documentation Cleanup
- [ ] **Delete** `cms-architecture.md` (consolidate into `architecture.md`)
- [ ] **Update** `architecture.md` with CMS details
- [ ] **Update** `roadmap.md` to reflect new architecture
- [ ] **Update** `README.md` with new features

### 1.2 Database Schema Refactoring
- [ ] **Replace** `ContentBlock` model with `Component` model
- [ ] **Add** `isBlogTemplate` to `Page` model
- [ ] **Add** `StyleLibrary` model
- [ ] **Add** `Theme` model for exports
- [ ] **Remove** unused `Template` model

## Phase 2: Component System Implementation

### 2.1 Core Component System
- [ ] **Create** `Component` service (replace content-blocks)
- [ ] **Create** `ComponentLibrary` UI component
- [ ] **Implement** component creation from design selections
- [ ] **Add** component drag-and-drop functionality
- [ ] **Implement** component inheritance from style libraries

### 2.2 Rich Text Component
- [ ] **Install** Novel Svelte library
- [ ] **Create** `RichText` component
- [ ] **Add** to default component library
- [ ] **Integrate** with blog template system

## Phase 3: Unified Designer Interface

### 3.1 Multi-Page Canvas
- [ ] **Refactor** canvas to support multiple pages
- [ ] **Add** page management (add/remove/reorder)
- [ ] **Implement** page selection and navigation
- [ ] **Add** visual page indicators (draft/published)

### 3.2 Publishing System
- [ ] **Implement** instant publishing workflow
- [ ] **Add** slug definition for pages
- [ ] **Create** page state management (draft/published)
- [ ] **Add** right-click context menu for publishing

### 3.3 Blog Template System
- [ ] **Add** "Mark as Blog Template" functionality
- [ ] **Create** blog template management
- [ ] **Implement** blog content editor
- [ ] **Add** blog post creation from templates

## Phase 4: Style Libraries

### 4.1 Library Management
- [ ] **Create** `StyleLibrary` service
- [ ] **Implement** library CRUD operations
- [ ] **Add** library sharing functionality
- [ ] **Create** library import/export

### 4.2 Component Inheritance
- [ ] **Implement** component-style inheritance
- [ ] **Add** global style updates
- [ ] **Create** style override system
- [ ] **Add** style conflict resolution

## Phase 5: Theme Export System

### 5.1 Export Architecture
- [ ] **Create** `ThemeExporter` service
- [ ] **Implement** JSON + Svelte export format
- [ ] **Add** `.baseline-theme` ZIP creation
- [ ] **Create** theme validation system

### 5.2 Import System
- [ ] **Create** `ThemeImporter` service
- [ ] **Implement** theme installation
- [ ] **Add** theme compatibility checking
- [ ] **Create** theme preview system

## Phase 6: Code Quality & DX

### 6.1 TypeScript Improvements
- [ ] **Add** strict type checking
- [ ] **Create** comprehensive type definitions
- [ ] **Implement** type-safe API calls
- [ ] **Add** runtime type validation

### 6.2 Testing
- [ ] **Add** unit tests for all services
- [ ] **Create** integration tests
- [ ] **Implement** E2E tests for critical flows
- [ ] **Add** performance testing

### 6.3 Code Organization
- [ ] **Refactor** large files into smaller modules
- [ ] **Implement** consistent naming conventions
- [ ] **Add** comprehensive JSDoc comments
- [ ] **Create** code generation utilities

## Phase 7: Performance & UX

### 7.1 Performance Optimization
- [ ] **Implement** lazy loading for components
- [ ] **Add** virtual scrolling for large lists
- [ ] **Optimize** bundle size
- [ ] **Add** caching strategies

### 7.2 User Experience
- [ ] **Improve** loading states
- [ ] **Add** error boundaries
- [ ] **Implement** undo/redo for all actions
- [ ] **Add** keyboard shortcuts

## Implementation Priority

### High Priority (Phase 1-2)
1. Architecture consolidation
2. Component system implementation
3. Rich text component

### Medium Priority (Phase 3-4)
1. Unified designer interface
2. Style libraries
3. Blog template system

### Low Priority (Phase 5-7)
1. Theme export system
2. Code quality improvements
3. Performance optimization

## Success Metrics

- [ ] **Reduced complexity**: Single interface instead of multiple
- [ ] **Improved UX**: Figma-like workflow
- [ ] **Better DX**: Clean, maintainable code
- [ ] **Enhanced features**: Component system, style libraries, theme export
- [ ] **Performance**: Fast, responsive interface
- [ ] **Extensibility**: Easy to add new features

## Timeline Estimate

- **Phase 1-2**: 2-3 weeks
- **Phase 3-4**: 3-4 weeks  
- **Phase 5-7**: 2-3 weeks
- **Total**: 7-10 weeks

This refactoring will transform Baseline into a truly professional design tool that rivals Figma while maintaining the simplicity and power of WordPress.

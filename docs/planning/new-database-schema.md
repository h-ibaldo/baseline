# New Database Schema - Component System Architecture

## Overview

This document outlines the new database schema that replaces the content blocks system with a comprehensive component system, adds style libraries, theme export, and blog template functionality.

## Key Changes

### 1. Replace ContentBlock with Component
- **More intuitive**: "Component" is clearer than "content block"
- **Design integration**: Components created from design selections
- **Style inheritance**: Components inherit from style libraries
- **Master editing**: Edit master component, update all instances

### 2. Add Style Libraries
- **Figma-style**: Colors, typography, spacing, components
- **Global updates**: Change library → all components update
- **Sharing**: Import/export libraries between projects

### 3. Add Theme Export
- **Professional sharing**: Export designs as themes
- **Version control**: Track theme changes
- **Installation**: Import themes into projects

### 4. Add Blog Template System
- **Template marking**: Pages can be marked as blog templates
- **Rich text**: Notion-like editor for blog content
- **Flexible publishing**: Publish as page OR blog template

## New Schema

```prisma
// Baseline CMS Database Schema - Component System Architecture
// SQLite for simplicity, can be switched to PostgreSQL for scale

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Pages - The heart of the CMS
model Page {
  id        String   @id @default(uuid())
  slug      String   @unique
  title     String
  description String?

  // Design data (event sourcing)
  designEvents String  // JSON string of design events array
  designState  String? // JSON string of current state (derived from events)

  // Published output (generated via AST)
  publishedHtml String?
  publishedCss  String?
  publishedJs   String?

  // Status and metadata
  status    String   @default("draft") // draft, published, archived
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  // Blog template system
  isBlogTemplate Boolean @default(false) // Mark as blog template
  blogTemplateType String? // post, list, category, author

  // SEO
  metaTitle       String?
  metaDescription String?
  metaImage       String?

  // Draft autosave fields
  draftContent   String?   // JSON string of unsaved draft design
  lastSavedAt    DateTime? // Last autosave timestamp
  hasUnsavedChanges Boolean @default(false)

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  // Relations
  revisions PageRevision[]
  blogPosts BlogPost[] // If this is a blog template

  @@index([slug])
  @@index([status])
  @@index([authorId])
  @@index([isBlogTemplate])
}

// Components - Replaces ContentBlock system
model Component {
  id          String   @id @default(uuid())
  name        String
  description String?
  category    String   @default("custom") // text, image, button, card, hero, etc.

  // Component content (JSON component data)
  content     String   // JSON string of component structure
  properties  String?  // JSON string of editable properties
  thumbnail   String?  // Preview image URL

  // Style inheritance
  styleLibraryId String? // Inherit from style library
  styleLibrary   StyleLibrary? @relation(fields: [styleLibraryId], references: [id])

  // Usage tracking
  usageCount  Int      @default(0)

  // Metadata
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  isPublic    Boolean  @default(false) // shared across users or private
  version     Int      @default(1)

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  instances   ComponentInstance[] // Where this component is used

  @@index([category])
  @@index([createdBy])
  @@index([isPublic])
  @@index([styleLibraryId])
}

// Component Instances - Track where components are used
model ComponentInstance {
  id          String   @id @default(uuid())
  componentId String
  component   Component @relation(fields: [componentId], references: [id])
  
  // Where it's used
  pageId      String?
  page        Page?    @relation(fields: [pageId], references: [id])
  
  // Instance-specific overrides
  overrides   String?  // JSON string of property overrides
  
  // Position in design
  position    String?  // JSON string of position data
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([componentId])
  @@index([pageId])
}

// Style Libraries - Figma-style design system
model StyleLibrary {
  id          String   @id @default(uuid())
  name        String
  description String?
  
  // Library content
  colors      String?  // JSON string of color palette
  typography  String?  // JSON string of typography system
  spacing     String?  // JSON string of spacing system
  components  String?  // JSON string of component styles
  
  // Metadata
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  isPublic    Boolean  @default(false)
  version     Int      @default(1)
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  components  Component[] // Components that inherit from this library
  
  @@index([createdBy])
  @@index([isPublic])
}

// Themes - Export/import system
model Theme {
  id          String   @id @default(uuid())
  name        String
  description String?
  version     String   @default("1.0.0")
  
  // Theme content
  themeData   String   // JSON string of theme structure
  components  String?  // JSON string of Svelte components
  styles      String?  // JSON string of CSS styles
  assets      String?  // JSON string of asset references
  
  // Metadata
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  isPublic    Boolean  @default(false)
  downloadCount Int    @default(0)
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([createdBy])
  @@index([isPublic])
}

// Blog Posts - Content for blog templates
model BlogPost {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String   // Rich text content (HTML/JSON)
  excerpt     String?
  
  // Blog template reference
  templateId  String
  template    Page     @relation(fields: [templateId], references: [id])
  
  // Status
  status      String   @default("draft") // draft, published, archived
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  // SEO
  metaTitle       String?
  metaDescription String?
  metaImage       String?
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?
  
  // Relations
  categories  BlogCategory[]
  tags        BlogTag[]
  
  @@index([slug])
  @@index([status])
  @@index([authorId])
  @@index([templateId])
}

// Blog Categories
model BlogCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  posts       BlogPost[]
  
  @@index([slug])
}

// Blog Tags
model BlogTag {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  posts       BlogPost[]
  
  @@index([slug])
}

// Users and Authentication
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  passwordHash String
  name        String
  role        String   @default("author") // admin, editor, author, subscriber
  avatarUrl   String?
  
  // Status
  status      String   @default("active") // active, suspended
  
  // Timestamps
  createdAt   DateTime  @default(now())
  lastLoginAt DateTime?
  
  // Relations
  pages       Page[]
  components  Component[]
  styleLibraries StyleLibrary[]
  themes      Theme[]
  blogPosts   BlogPost[]
  sessions    Session[]
  
  @@index([email])
  @@index([role])
  @@index([status])
}

// Sessions (for JWT refresh tokens)
model Session {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([token])
  @@index([userId])
}

// Media Library
model Media {
  id        String   @id @default(uuid())
  filename  String
  path      String
  url       String
  mimeType  String
  size      Int
  width     Int?
  height    Int?
  altText   String?
  caption   String?
  uploadedBy String
  uploader  User     @relation(fields: [uploadedBy], references: [id])
  createdAt DateTime @default(now())
  
  @@index([uploadedBy])
}

// Site Settings
model Setting {
  key       String   @id
  value     String
  type      String   @default("string") // string, number, boolean, json
  updatedAt DateTime @updatedAt
}

// Page Revisions (optional, for version history)
model PageRevision {
  id          String   @id @default(uuid())
  pageId      String
  page        Page     @relation(fields: [pageId], references: [id])
  designEvents String  // JSON string of design events
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  
  @@index([pageId])
  @@index([createdBy])
}
```

## Migration Strategy

### Phase 1: Add New Models
1. Add new models (Component, StyleLibrary, Theme, BlogPost, etc.)
2. Keep existing ContentBlock model for backward compatibility
3. Update existing code to use new models

### Phase 2: Migrate Data
1. Create migration script to convert ContentBlocks to Components
2. Migrate existing data to new schema
3. Update all references

### Phase 3: Remove Old Models
1. Remove ContentBlock model
2. Remove Template model (replaced by blog templates)
3. Clean up unused code

## Benefits of New Schema

### 1. Component System
- **More intuitive**: "Component" is clearer than "content block"
- **Design integration**: Components created from design selections
- **Style inheritance**: Components inherit from style libraries
- **Master editing**: Edit master component, update all instances

### 2. Style Libraries
- **Figma-style**: Colors, typography, spacing, components
- **Global updates**: Change library → all components update
- **Sharing**: Import/export libraries between projects

### 3. Theme Export
- **Professional sharing**: Export designs as themes
- **Version control**: Track theme changes
- **Installation**: Import themes into projects

### 4. Blog Template System
- **Template marking**: Pages can be marked as blog templates
- **Rich text**: Notion-like editor for blog content
- **Flexible publishing**: Publish as page OR blog template

This new schema provides a solid foundation for the unified designer architecture with component system, style libraries, theme export, and blog template functionality.

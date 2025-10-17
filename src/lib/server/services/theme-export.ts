import { prisma } from '../db/client.js';
import type { Theme, Page, Component, StyleLibrary } from '@prisma/client';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import archiver from 'archiver';

export interface CreateThemeData {
  name: string;
  description?: string;
  version?: string;
  pages: string[]; // Page IDs to include
  components: string[]; // Component IDs to include
  styleLibraries: string[]; // Style library IDs to include
  createdBy: string;
  isPublic?: boolean;
}

export interface ThemeExportData {
  theme: {
    name: string;
    description: string;
    version: string;
    exportedAt: string;
    author: string;
  };
  pages: Array<{
    id: string;
    name: string;
    slug: string;
    isBlogTemplate: boolean;
    blogTemplateType?: string;
    artboards: any[];
    elements: any[];
  }>;
  components: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    content: any;
    properties: any;
    thumbnail?: string;
  }>;
  styleLibraries: Array<{
    id: string;
    name: string;
    description: string;
    colors: any;
    typography: any;
    spacing: any;
    components: any;
  }>;
  assets: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
  }>;
}

export interface ThemeImportData {
  themeData: ThemeExportData;
  importOptions: {
    importPages: boolean;
    importComponents: boolean;
    importStyleLibraries: boolean;
    importAssets: boolean;
    overwriteExisting: boolean;
  };
  createdBy: string;
}

/**
 * Theme Export Service - Manages theme creation, export, and import
 * Professional theme sharing like WordPress themes but better
 */
export class ThemeExportService {
  /**
   * Create a new theme
   */
  static async createTheme(data: CreateThemeData): Promise<Theme> {
    // Get all related data
    const pages = await prisma.page.findMany({
      where: { id: { in: data.pages } },
      include: {
        revisions: true,
      },
    });

    const components = await prisma.component.findMany({
      where: { id: { in: data.components } },
    });

    const styleLibraries = await prisma.styleLibrary.findMany({
      where: { id: { in: data.styleLibraries } },
    });

    // Create theme data structure
    const themeData = {
      theme: {
        name: data.name,
        description: data.description || '',
        version: data.version || '1.0.0',
        exportedAt: new Date().toISOString(),
        author: 'Baseline Designer',
      },
      pages: pages.map(page => ({
        id: page.id,
        name: page.title,
        slug: page.slug,
        isBlogTemplate: page.isBlogTemplate,
        blogTemplateType: page.blogTemplateType,
        artboards: [], // TODO: Extract from designEvents
        elements: [], // TODO: Extract from designEvents
      })),
      components: components.map(comp => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        category: comp.category,
        content: comp.content ? JSON.parse(comp.content) : null,
        properties: comp.properties ? JSON.parse(comp.properties) : null,
        thumbnail: comp.thumbnail,
      })),
      styleLibraries: styleLibraries.map(lib => ({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        colors: lib.colors ? JSON.parse(lib.colors) : null,
        typography: lib.typography ? JSON.parse(lib.typography) : null,
        spacing: lib.spacing ? JSON.parse(lib.spacing) : null,
        components: lib.components ? JSON.parse(lib.components) : null,
      })),
      assets: [], // TODO: Extract from media
    };

    return await prisma.theme.create({
      data: {
        name: data.name,
        description: data.description,
        version: data.version || '1.0.0',
        themeData: JSON.stringify(themeData),
        components: JSON.stringify(themeData.components),
        styles: JSON.stringify(themeData.styleLibraries),
        assets: JSON.stringify(themeData.assets),
        createdBy: data.createdBy,
        isPublic: data.isPublic || false,
      },
    });
  }

  /**
   * Get theme by ID
   */
  static async getThemeById(id: string): Promise<Theme | null> {
    return await prisma.theme.findUnique({
      where: { id },
    });
  }

  /**
   * Get all themes with optional filtering
   */
  static async getThemes(options: {
    createdBy?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Theme[]> {
    const where: any = {};

    if (options.createdBy) {
      where.createdBy = options.createdBy;
    }

    if (options.isPublic !== undefined) {
      where.isPublic = options.isPublic;
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.theme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }

  /**
   * Update theme
   */
  static async updateTheme(id: string, data: Partial<CreateThemeData>): Promise<Theme> {
    return await prisma.theme.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete theme
   */
  static async deleteTheme(id: string): Promise<void> {
    await prisma.theme.delete({
      where: { id },
    });
  }

  /**
   * Export theme as .baseline-theme ZIP file
   */
  static async exportThemeAsZip(themeId: string, outputPath: string): Promise<string> {
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new Error('Theme not found');
    }

    const themeData: ThemeExportData = JSON.parse(theme.themeData);
    const components = theme.components ? JSON.parse(theme.components) : [];
    const styles = theme.styles ? JSON.parse(theme.styles) : [];
    const assets = theme.assets ? JSON.parse(theme.assets) : [];

    // Create theme directory structure
    const themeDir = join(outputPath, `${theme.name.replace(/[^a-zA-Z0-9]/g, '-')}-${theme.version}`);
    await mkdir(themeDir, { recursive: true });
    await mkdir(join(themeDir, 'components'), { recursive: true });
    await mkdir(join(themeDir, 'styles'), { recursive: true });
    await mkdir(join(themeDir, 'assets'), { recursive: true });

    // Write theme.json
    await writeFile(
      join(themeDir, 'theme.json'),
      JSON.stringify(themeData, null, 2)
    );

    // Write components as Svelte files
    for (const component of components) {
      const svelteContent = this.generateSvelteComponent(component);
      await writeFile(
        join(themeDir, 'components', `${component.name.replace(/[^a-zA-Z0-9]/g, '-')}.svelte`),
        svelteContent
      );
    }

    // Write styles
    await writeFile(
      join(themeDir, 'styles', 'variables.css'),
      this.generateCSSVariables(styles)
    );

    await writeFile(
      join(themeDir, 'styles', 'components.css'),
      this.generateComponentStyles(styles)
    );

    // Copy assets (if any)
    for (const asset of assets) {
      // TODO: Copy actual asset files
      console.log('Asset:', asset);
    }

    // Create ZIP file
    const zipPath = `${themeDir}.baseline-theme`;
    await this.createZipFile(themeDir, zipPath);

    return zipPath;
  }

  /**
   * Import theme from .baseline-theme ZIP file
   */
  static async importThemeFromZip(
    zipPath: string,
    importOptions: ThemeImportData['importOptions'],
    createdBy: string
  ): Promise<{
    theme: Theme;
    imported: {
      pages: number;
      components: number;
      styleLibraries: number;
      assets: number;
    };
  }> {
    // TODO: Implement ZIP extraction and theme import
    // This would involve:
    // 1. Extract ZIP file
    // 2. Parse theme.json
    // 3. Import pages, components, style libraries based on options
    // 4. Handle conflicts and overwrites
    // 5. Create new theme record

    throw new Error('Theme import not yet implemented');
  }

  /**
   * Generate Svelte component from component data
   */
  private static generateSvelteComponent(component: any): string {
    const { name, content, properties } = component;
    
    // This is a simplified example - in reality, you'd parse the content
    // and generate proper Svelte component code
    return `<script>
  // ${name} component
  // Generated from Baseline theme export
  
  export let props = {};
  
  // Component properties
  ${properties ? Object.keys(JSON.parse(properties)).map(prop => 
    `export let ${prop};`
  ).join('\n  ') : ''}
</script>

<!-- Component content would be generated from the content JSON -->
<div class="component-${name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}">
  <!-- Generated component structure -->
</div>

<style>
  .component-${name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')} {
    /* Component styles */
  }
</style>`;
  }

  /**
   * Generate CSS variables from style libraries
   */
  private static generateCSSVariables(styleLibraries: any[]): string {
    let css = ':root {\n';
    
    for (const library of styleLibraries) {
      if (library.colors) {
        css += '  /* Colors */\n';
        for (const [key, value] of Object.entries(library.colors)) {
          css += `  --color-${key}: ${value};\n`;
        }
      }
      
      if (library.typography) {
        css += '  /* Typography */\n';
        for (const [key, value] of Object.entries(library.typography.fontFamily)) {
          css += `  --font-${key}: ${value};\n`;
        }
        for (const [key, value] of Object.entries(library.typography.fontSize)) {
          css += `  --text-${key}: ${value};\n`;
        }
      }
      
      if (library.spacing) {
        css += '  /* Spacing */\n';
        for (const [key, value] of Object.entries(library.spacing)) {
          css += `  --space-${key}: ${value};\n`;
        }
      }
    }
    
    css += '}\n';
    return css;
  }

  /**
   * Generate component styles from style libraries
   */
  private static generateComponentStyles(styleLibraries: any[]): string {
    let css = '';
    
    for (const library of styleLibraries) {
      if (library.components) {
        for (const [componentName, styles] of Object.entries(library.components)) {
          css += `.${componentName} {\n`;
          for (const [property, value] of Object.entries(styles as any)) {
            css += `  ${property}: ${value};\n`;
          }
          css += '}\n\n';
        }
      }
    }
    
    return css;
  }

  /**
   * Create ZIP file from directory
   */
  private static async createZipFile(sourceDir: string, outputPath: string): Promise<void> {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Get theme statistics
   */
  static async getThemeStats(): Promise<{
    total: number;
    byVisibility: Record<string, number>;
    mostDownloaded: Theme[];
  }> {
    const total = await prisma.theme.count();

    const byVisibility = await prisma.theme.groupBy({
      by: ['isPublic'],
      _count: { isPublic: true },
    });

    const visibilityStats: Record<string, number> = {};
    byVisibility.forEach(item => {
      visibilityStats[item.isPublic ? 'public' : 'private'] = item._count.isPublic;
    });

    const mostDownloaded = await prisma.theme.findMany({
      orderBy: { downloadCount: 'desc' },
      take: 10,
    });

    return {
      total,
      byVisibility: visibilityStats,
      mostDownloaded,
    };
  }

  /**
   * Increment download count
   */
  static async incrementDownloadCount(themeId: string): Promise<void> {
    await prisma.theme.update({
      where: { id: themeId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Duplicate theme
   */
  static async duplicateTheme(
    id: string,
    newName: string,
    createdBy: string
  ): Promise<Theme> {
    const originalTheme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!originalTheme) {
      throw new Error('Theme not found');
    }

    return await prisma.theme.create({
      data: {
        name: newName,
        description: originalTheme.description,
        version: '1.0.0', // Reset version for duplicates
        themeData: originalTheme.themeData,
        components: originalTheme.components,
        styles: originalTheme.styles,
        assets: originalTheme.assets,
        createdBy,
        isPublic: false, // Duplicates are always private initially
      },
    });
  }
}

export default ThemeExportService;

import { prisma } from '../db/client.js';
import type { StyleLibrary } from '@prisma/client';

export interface CreateStyleLibraryData {
  name: string;
  description?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography?: {
    fontFamily: {
      primary: string;
      secondary: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing?: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  components?: {
    button: {
      borderRadius: string;
      padding: string;
      fontSize: string;
      fontWeight: number;
    };
    input: {
      borderRadius: string;
      padding: string;
      borderWidth: string;
      fontSize: string;
    };
    card: {
      borderRadius: string;
      padding: string;
      shadow: string;
    };
  };
  createdBy: string;
  isPublic?: boolean;
}

export interface UpdateStyleLibraryData {
  name?: string;
  description?: string;
  colors?: any;
  typography?: any;
  spacing?: any;
  components?: any;
  isPublic?: boolean;
}

export interface StyleLibraryWithStats extends StyleLibrary {
  componentCount: number;
  usageCount: number;
}

/**
 * Style Library Service - Manages design system libraries
 * Figma-style design system management with global updates
 */
export class StyleLibraryService {
  /**
   * Create a new style library
   */
  static async createStyleLibrary(data: CreateStyleLibraryData): Promise<StyleLibrary> {
    return await prisma.styleLibrary.create({
      data: {
        name: data.name,
        description: data.description,
        colors: data.colors ? JSON.stringify(data.colors) : null,
        typography: data.typography ? JSON.stringify(data.typography) : null,
        spacing: data.spacing ? JSON.stringify(data.spacing) : null,
        components: data.components ? JSON.stringify(data.components) : null,
        createdBy: data.createdBy,
        isPublic: data.isPublic || false,
      },
    });
  }

  /**
   * Get style library by ID
   */
  static async getStyleLibraryById(id: string): Promise<StyleLibraryWithStats | null> {
    const library = await prisma.styleLibrary.findUnique({
      where: { id },
      include: {
        inheritedComponents: {
          select: {
            id: true,
            usageCount: true,
          },
        },
      },
    });

    if (!library) return null;

    const componentCount = library.inheritedComponents.length;
    const usageCount = library.inheritedComponents.reduce(
      (sum, comp) => sum + comp.usageCount,
      0
    );

    return {
      ...library,
      componentCount,
      usageCount,
    };
  }

  /**
   * Get all style libraries with optional filtering
   */
  static async getStyleLibraries(options: {
    createdBy?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<StyleLibraryWithStats[]> {
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

    const libraries = await prisma.styleLibrary.findMany({
      where,
      include: {
        inheritedComponents: {
          select: {
            id: true,
            usageCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });

    return libraries.map(library => {
      const componentCount = library.inheritedComponents.length;
      const usageCount = library.inheritedComponents.reduce(
        (sum, comp) => sum + comp.usageCount,
        0
      );

      return {
        ...library,
        componentCount,
        usageCount,
      };
    });
  }

  /**
   * Update style library
   */
  static async updateStyleLibrary(id: string, data: UpdateStyleLibraryData): Promise<StyleLibrary> {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // Convert objects to JSON strings
    if (data.colors) updateData.colors = JSON.stringify(data.colors);
    if (data.typography) updateData.typography = JSON.stringify(data.typography);
    if (data.spacing) updateData.spacing = JSON.stringify(data.spacing);
    if (data.components) updateData.components = JSON.stringify(data.components);

    return await prisma.styleLibrary.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete style library
   */
  static async deleteStyleLibrary(id: string): Promise<void> {
    // First, remove inheritance from all components
    await prisma.component.updateMany({
      where: { styleLibraryId: id },
      data: { styleLibraryId: null },
    });

    // Then delete the library
    await prisma.styleLibrary.delete({
      where: { id },
    });
  }

  /**
   * Get components that inherit from a style library
   */
  static async getLibraryComponents(libraryId: string): Promise<any[]> {
    return await prisma.component.findMany({
      where: { styleLibraryId: libraryId },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update component inheritance
   */
  static async updateComponentInheritance(
    componentId: string,
    libraryId: string | null
  ): Promise<void> {
    await prisma.component.update({
      where: { id: componentId },
      data: { styleLibraryId: libraryId },
    });
  }

  /**
   * Get style library statistics
   */
  static async getLibraryStats(): Promise<{
    total: number;
    byVisibility: Record<string, number>;
    mostUsed: StyleLibraryWithStats[];
  }> {
    const total = await prisma.styleLibrary.count();

    const byVisibility = await prisma.styleLibrary.groupBy({
      by: ['isPublic'],
      _count: { isPublic: true },
    });

    const visibilityStats: Record<string, number> = {};
    byVisibility.forEach(item => {
      visibilityStats[item.isPublic ? 'public' : 'private'] = item._count.isPublic;
    });

    const mostUsed = await prisma.styleLibrary.findMany({
      include: {
        inheritedComponents: {
          select: {
            usageCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const mostUsedWithStats = mostUsed.map(library => {
      const componentCount = library.inheritedComponents.length;
      const usageCount = library.inheritedComponents.reduce(
        (sum, comp) => sum + comp.usageCount,
        0
      );

      return {
        ...library,
        componentCount,
        usageCount,
      };
    });

    return {
      total,
      byVisibility: visibilityStats,
      mostUsed: mostUsedWithStats,
    };
  }

  /**
   * Duplicate style library
   */
  static async duplicateStyleLibrary(
    id: string,
    newName: string,
    createdBy: string
  ): Promise<StyleLibrary> {
    const originalLibrary = await prisma.styleLibrary.findUnique({
      where: { id },
    });

    if (!originalLibrary) {
      throw new Error('Style library not found');
    }

    return await prisma.styleLibrary.create({
      data: {
        name: newName,
        description: originalLibrary.description,
        colors: originalLibrary.colors,
        typography: originalLibrary.typography,
        spacing: originalLibrary.spacing,
        components: originalLibrary.components,
        createdBy,
        isPublic: false, // Duplicates are always private initially
      },
    });
  }

  /**
   * Export style library as JSON
   */
  static async exportStyleLibrary(id: string): Promise<any> {
    const library = await prisma.styleLibrary.findUnique({
      where: { id },
    });

    if (!library) {
      throw new Error('Style library not found');
    }

    return {
      name: library.name,
      description: library.description,
      version: library.version,
      colors: library.colors ? JSON.parse(library.colors) : null,
      typography: library.typography ? JSON.parse(library.typography) : null,
      spacing: library.spacing ? JSON.parse(library.spacing) : null,
      components: library.components ? JSON.parse(library.components) : null,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import style library from JSON
   */
  static async importStyleLibrary(
    data: any,
    createdBy: string
  ): Promise<StyleLibrary> {
    return await prisma.styleLibrary.create({
      data: {
        name: data.name,
        description: data.description,
        colors: data.colors ? JSON.stringify(data.colors) : null,
        typography: data.typography ? JSON.stringify(data.typography) : null,
        spacing: data.spacing ? JSON.stringify(data.spacing) : null,
        components: data.components ? JSON.stringify(data.components) : null,
        createdBy,
        isPublic: false, // Imports are always private initially
      },
    });
  }

  /**
   * Get default style library (system-wide)
   */
  static async getDefaultStyleLibrary(): Promise<StyleLibrary | null> {
    return await prisma.styleLibrary.findFirst({
      where: {
        name: 'Default',
        isPublic: true,
      },
    });
  }

  /**
   * Create default style library if it doesn't exist
   */
  static async ensureDefaultStyleLibrary(createdBy: string): Promise<StyleLibrary> {
    let defaultLibrary = await this.getDefaultStyleLibrary();

    if (!defaultLibrary) {
      defaultLibrary = await this.createStyleLibrary({
        name: 'Default',
        description: 'Default design system',
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#F59E0B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          neutral: '#6B7280',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          text: '#111827',
          textSecondary: '#6B7280',
        },
        typography: {
          fontFamily: {
            primary: 'Inter, system-ui, sans-serif',
            secondary: 'Georgia, serif',
            mono: 'JetBrains Mono, monospace',
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
          },
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem',
          '4xl': '6rem',
        },
        components: {
          button: {
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          input: {
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            borderWidth: '1px',
            fontSize: '0.875rem',
          },
          card: {
            borderRadius: '0.5rem',
            padding: '1.5rem',
            shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        createdBy,
        isPublic: true,
      });
    }

    return defaultLibrary;
  }
}

export default StyleLibraryService;

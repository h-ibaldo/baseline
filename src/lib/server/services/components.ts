import { prisma } from '../db/client.js';
import type { Component, ComponentInstance, StyleLibrary } from '@prisma/client';

export interface CreateComponentData {
  name: string;
  description?: string;
  category?: string;
  content: string; // JSON string of component structure
  properties?: string; // JSON string of editable properties
  thumbnail?: string;
  styleLibraryId?: string;
  createdBy: string;
  isPublic?: boolean;
}

export interface UpdateComponentData {
  name?: string;
  description?: string;
  category?: string;
  content?: string;
  properties?: string;
  thumbnail?: string;
  styleLibraryId?: string;
  isPublic?: boolean;
}

export interface ComponentWithLibrary extends Component {
  styleLibrary?: StyleLibrary | null;
  instances?: ComponentInstance[];
}

export interface CreateComponentInstanceData {
  componentId: string;
  pageId?: string;
  overrides?: string; // JSON string of property overrides
  position?: string; // JSON string of position data
}

/**
 * Component Service - Manages reusable components
 * Replaces the content-blocks system with a more intuitive component system
 */
export class ComponentService {
  /**
   * Create a new component
   */
  static async createComponent(data: CreateComponentData): Promise<Component> {
    return await prisma.component.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category || 'custom',
        content: data.content,
        properties: data.properties,
        thumbnail: data.thumbnail,
        styleLibraryId: data.styleLibraryId,
        createdBy: data.createdBy,
        isPublic: data.isPublic || false,
      },
    });
  }

  /**
   * Get component by ID with style library
   */
  static async getComponentById(id: string): Promise<ComponentWithLibrary | null> {
    return await prisma.component.findUnique({
      where: { id },
      include: {
        styleLibrary: true,
        instances: true,
      },
    });
  }

  /**
   * Get all components with optional filtering
   */
  static async getComponents(options: {
    createdBy?: string;
    category?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ComponentWithLibrary[]> {
    const where: any = {};

    if (options.createdBy) {
      where.createdBy = options.createdBy;
    }

    if (options.category) {
      where.category = options.category;
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

    return await prisma.component.findMany({
      where,
      include: {
        styleLibrary: true,
        instances: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }

  /**
   * Update component
   */
  static async updateComponent(id: string, data: UpdateComponentData): Promise<Component> {
    return await prisma.component.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete component
   */
  static async deleteComponent(id: string): Promise<void> {
    // First delete all instances
    await prisma.componentInstance.deleteMany({
      where: { componentId: id },
    });

    // Then delete the component
    await prisma.component.delete({
      where: { id },
    });
  }

  /**
   * Increment usage count when component is used
   */
  static async incrementUsage(id: string): Promise<void> {
    await prisma.component.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Create component instance (when component is used in a design)
   */
  static async createInstance(data: CreateComponentInstanceData): Promise<ComponentInstance> {
    // Increment usage count
    await this.incrementUsage(data.componentId);

    return await prisma.componentInstance.create({
      data: {
        componentId: data.componentId,
        pageId: data.pageId,
        overrides: data.overrides,
        position: data.position,
      },
    });
  }

  /**
   * Get component instances for a page
   */
  static async getPageInstances(pageId: string): Promise<(ComponentInstance & { component: Component })[]> {
    return await prisma.componentInstance.findMany({
      where: { pageId },
      include: {
        component: true,
      },
    });
  }

  /**
   * Update component instance
   */
  static async updateInstance(id: string, data: Partial<CreateComponentInstanceData>): Promise<ComponentInstance> {
    return await prisma.componentInstance.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete component instance
   */
  static async deleteInstance(id: string): Promise<void> {
    await prisma.componentInstance.delete({
      where: { id },
    });
  }

  /**
   * Get component categories
   */
  static async getCategories(): Promise<string[]> {
    const categories = await prisma.component.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map(c => c.category);
  }

  /**
   * Get component statistics
   */
  static async getStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    mostUsed: Component[];
  }> {
    const total = await prisma.component.count();

    const byCategory = await prisma.component.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    const categoryStats: Record<string, number> = {};
    byCategory.forEach(item => {
      categoryStats[item.category] = item._count.category;
    });

    const mostUsed = await prisma.component.findMany({
      orderBy: { usageCount: 'desc' },
      take: 10,
    });

    return {
      total,
      byCategory: categoryStats,
      mostUsed,
    };
  }

  /**
   * Convert design selection to component
   * This is the key feature - convert any design to a reusable component
   */
  static async convertDesignToComponent(
    designData: {
      elements: any[]; // Selected design elements
      name: string;
      description?: string;
      category?: string;
    },
    createdBy: string
  ): Promise<Component> {
    // Parse design elements into component structure
    const componentContent = JSON.stringify({
      type: 'component',
      elements: designData.elements,
      metadata: {
        convertedAt: new Date().toISOString(),
        originalElementCount: designData.elements.length,
      },
    });

    // Generate thumbnail (placeholder for now)
    const thumbnail = null; // TODO: Generate actual thumbnail

    return await this.createComponent({
      name: designData.name,
      description: designData.description,
      category: designData.category || 'custom',
      content: componentContent,
      createdBy,
      isPublic: false, // Start as private
    });
  }

  /**
   * Get components that inherit from a style library
   */
  static async getComponentsByStyleLibrary(styleLibraryId: string): Promise<ComponentWithLibrary[]> {
    return await prisma.component.findMany({
      where: { styleLibraryId },
      include: {
        styleLibrary: true,
        instances: true,
      },
    });
  }

  /**
   * Update component style library inheritance
   */
  static async updateStyleLibraryInheritance(
    componentId: string,
    styleLibraryId: string | null
  ): Promise<Component> {
    return await prisma.component.update({
      where: { id: componentId },
      data: { styleLibraryId },
    });
  }
}

export default ComponentService;

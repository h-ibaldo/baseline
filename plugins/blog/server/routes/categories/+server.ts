import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db/client.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await requireAuth(locals);
  
  const search = url.searchParams.get('search') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const categories = await prisma.blogCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
    });

    return json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return json(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = data.slug || data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingCategory = await prisma.blogCategory.findFirst({
      where: { slug },
    });

    if (existingCategory) {
      return json(
        {
          success: false,
          error: 'A category with this slug already exists',
        },
        { status: 400 }
      );
    }

    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        color: data.color || null,
      },
    });

    return json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return json(
      {
        success: false,
        error: 'Failed to create category',
      },
      { status: 500 }
    );
  }
};
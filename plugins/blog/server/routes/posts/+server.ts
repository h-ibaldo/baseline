import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db/client.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await requireAuth(locals);
  
  const search = url.searchParams.get('search') || undefined;
  const status = url.searchParams.get('status') as 'draft' | 'published' | undefined;
  const categoryId = url.searchParams.get('categoryId') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const where: any = {
      authorId: session.user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
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
    if (!data.title || !data.content) {
      return json(
        {
          success: false,
          error: 'Title and content are required',
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = data.slug || data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug, authorId: session.user.id },
    });

    if (existingPost) {
      return json(
        {
          success: false,
          error: 'A post with this slug already exists',
        },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status || 'draft',
        publishedAt: data.status === 'published' ? new Date() : null,
        authorId: session.user.id,
        categoryId: data.categoryId || null,
        tags: data.tags || [],
        featuredImage: data.featuredImage || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return json(
      {
        success: false,
        error: 'Failed to create blog post',
      },
      { status: 500 }
    );
  }
};
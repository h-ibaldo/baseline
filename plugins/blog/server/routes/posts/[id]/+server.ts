import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db/client.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id,
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

    if (!post) {
      return json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 }
      );
    }

    return json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch blog post',
      },
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    // Check if post exists and belongs to user
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id,
      },
    });

    if (!existingPost) {
      return json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 }
      );
    }

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

    // Check if slug already exists (excluding current post)
    const slugExists = await prisma.blogPost.findFirst({
      where: { 
        slug, 
        authorId: session.user.id,
        id: { not: params.id },
      },
    });

    if (slugExists) {
      return json(
        {
          success: false,
          error: 'A post with this slug already exists',
        },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status || existingPost.status,
        publishedAt: data.status === 'published' && existingPost.status !== 'published' 
          ? new Date() 
          : existingPost.publishedAt,
        categoryId: data.categoryId || null,
        tags: data.tags || [],
        featuredImage: data.featuredImage || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        updatedAt: new Date(),
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
    console.error('Error updating blog post:', error);
    return json(
      {
        success: false,
        error: 'Failed to update blog post',
      },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    // Check if post exists and belongs to user
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id,
      },
    });

    if (!existingPost) {
      return json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: { id: params.id },
    });

    return json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return json(
      {
        success: false,
        error: 'Failed to delete blog post',
      },
      { status: 500 }
    );
  }
};
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComponentService } from '$lib/server/services/components.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await requireAuth(locals);
  
  const search = url.searchParams.get('search') || undefined;
  const category = url.searchParams.get('category') || undefined;
  const isPublic = url.searchParams.get('public') === 'true' ? true : url.searchParams.get('public') === 'false' ? false : undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const components = await ComponentService.getComponents({
      createdBy: session.user.id,
      category,
      isPublic,
      search,
      limit,
      offset,
    });

    return json({
      success: true,
      data: components,
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch components',
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    const component = await ComponentService.createComponent({
      ...data,
      createdBy: session.user.id,
    });

    return json({
      success: true,
      data: component,
    });
  } catch (error) {
    console.error('Error creating component:', error);
    return json(
      {
        success: false,
        error: 'Failed to create component',
      },
      { status: 500 }
    );
  }
};

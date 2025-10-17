import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StyleLibraryService } from '$lib/server/services/style-libraries.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await requireAuth(locals);
  
  const search = url.searchParams.get('search') || undefined;
  const isPublic = url.searchParams.get('public') === 'true' ? true : url.searchParams.get('public') === 'false' ? false : undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const libraries = await StyleLibraryService.getStyleLibraries({
      createdBy: session.user.id,
      isPublic,
      search,
      limit,
      offset,
    });

    return json({
      success: true,
      data: libraries,
    });
  } catch (error) {
    console.error('Error fetching style libraries:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch style libraries',
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    const library = await StyleLibraryService.createStyleLibrary({
      ...data,
      createdBy: session.user.id,
    });

    return json({
      success: true,
      data: library,
    });
  } catch (error) {
    console.error('Error creating style library:', error);
    return json(
      {
        success: false,
        error: 'Failed to create style library',
      },
      { status: 500 }
    );
  }
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ThemeExportService } from '$lib/server/services/theme-export.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await requireAuth(locals);
  
  const search = url.searchParams.get('search') || undefined;
  const isPublic = url.searchParams.get('public') === 'true' ? true : url.searchParams.get('public') === 'false' ? false : undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const themes = await ThemeExportService.getThemes({
      createdBy: session.user.id,
      isPublic,
      search,
      limit,
      offset,
    });

    return json({
      success: true,
      data: themes,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch themes',
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    const theme = await ThemeExportService.createTheme({
      ...data,
      createdBy: session.user.id,
    });

    return json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error('Error creating theme:', error);
    return json(
      {
        success: false,
        error: 'Failed to create theme',
      },
      { status: 500 }
    );
  }
};

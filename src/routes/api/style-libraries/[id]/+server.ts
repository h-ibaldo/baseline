import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StyleLibraryService } from '$lib/server/services/style-libraries.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const library = await StyleLibraryService.getStyleLibraryById(params.id);
    
    if (!library) {
      return json(
        {
          success: false,
          error: 'Style library not found',
        },
        { status: 404 }
      );
    }

    // Check if user can access this library
    if (!library.isPublic && library.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    return json({
      success: true,
      data: library,
    });
  } catch (error) {
    console.error('Error fetching style library:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch style library',
      },
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const library = await StyleLibraryService.getStyleLibraryById(params.id);
    
    if (!library) {
      return json(
        {
          success: false,
          error: 'Style library not found',
        },
        { status: 404 }
      );
    }

    // Check if user can edit this library
    if (library.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedLibrary = await StyleLibraryService.updateStyleLibrary(params.id, data);

    return json({
      success: true,
      data: updatedLibrary,
    });
  } catch (error) {
    console.error('Error updating style library:', error);
    return json(
      {
        success: false,
        error: 'Failed to update style library',
      },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const library = await StyleLibraryService.getStyleLibraryById(params.id);
    
    if (!library) {
      return json(
        {
          success: false,
          error: 'Style library not found',
        },
        { status: 404 }
      );
    }

    // Check if user can delete this library
    if (library.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    await StyleLibraryService.deleteStyleLibrary(params.id);

    return json({
      success: true,
      message: 'Style library deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting style library:', error);
    return json(
      {
        success: false,
        error: 'Failed to delete style library',
      },
      { status: 500 }
    );
  }
};

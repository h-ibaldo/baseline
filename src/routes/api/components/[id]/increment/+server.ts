import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComponentService } from '$lib/server/services/components.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const POST: RequestHandler = async ({ params, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const component = await ComponentService.getComponentById(params.id);
    
    if (!component) {
      return json(
        {
          success: false,
          error: 'Component not found',
        },
        { status: 404 }
      );
    }

    // Check if user can use this component
    if (!component.isPublic && component.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    await ComponentService.incrementUsage(params.id);

    return json({
      success: true,
      message: 'Usage count incremented',
    });
  } catch (error) {
    console.error('Error incrementing component usage:', error);
    return json(
      {
        success: false,
        error: 'Failed to increment usage count',
      },
      { status: 500 }
    );
  }
};

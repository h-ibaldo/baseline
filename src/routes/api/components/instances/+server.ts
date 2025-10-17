import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComponentService } from '$lib/server/services/components.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    const { componentId, pageId, overrides, position } = data;
    
    if (!componentId) {
      return json(
        {
          success: false,
          error: 'Component ID is required',
        },
        { status: 400 }
      );
    }

    // Verify component exists and user can access it
    const component = await ComponentService.getComponentById(componentId);
    if (!component) {
      return json(
        {
          success: false,
          error: 'Component not found',
        },
        { status: 404 }
      );
    }

    if (!component.isPublic && component.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    const instance = await ComponentService.createInstance({
      componentId,
      pageId,
      overrides: overrides ? JSON.stringify(overrides) : undefined,
      position: position ? JSON.stringify(position) : undefined,
    });

    return json({
      success: true,
      data: instance,
      message: 'Component instance created successfully',
    });
  } catch (error) {
    console.error('Error creating component instance:', error);
    return json(
      {
        success: false,
        error: 'Failed to create component instance',
      },
      { status: 500 }
    );
  }
};

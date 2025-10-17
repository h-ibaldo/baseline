import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComponentService } from '$lib/server/services/components.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const GET: RequestHandler = async ({ params, locals }) => {
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

    // Check if user can access this component
    if (!component.isPublic && component.createdBy !== session.user.id) {
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
      data: component,
    });
  } catch (error) {
    console.error('Error fetching component:', error);
    return json(
      {
        success: false,
        error: 'Failed to fetch component',
      },
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
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

    // Check if user can edit this component
    if (component.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedComponent = await ComponentService.updateComponent(params.id, data);

    return json({
      success: true,
      data: updatedComponent,
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return json(
      {
        success: false,
        error: 'Failed to update component',
      },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
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

    // Check if user can delete this component
    if (component.createdBy !== session.user.id) {
      return json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    await ComponentService.deleteComponent(params.id);

    return json({
      success: true,
      message: 'Component deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting component:', error);
    return json(
      {
        success: false,
        error: 'Failed to delete component',
      },
      { status: 500 }
    );
  }
};

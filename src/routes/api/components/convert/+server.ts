import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ComponentService } from '$lib/server/services/components.js';
import { requireAuth } from '$lib/server/middleware/auth.js';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await requireAuth(locals);
  
  try {
    const data = await request.json();
    
    const { elements, name, description, category } = data;
    
    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return json(
        {
          success: false,
          error: 'No elements provided for conversion',
        },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return json(
        {
          success: false,
          error: 'Component name is required',
        },
        { status: 400 }
      );
    }

    const component = await ComponentService.convertDesignToComponent(
      {
        elements,
        name: name.trim(),
        description: description?.trim(),
        category: category?.trim(),
      },
      session.user.id
    );

    return json({
      success: true,
      data: component,
      message: 'Design successfully converted to component',
    });
  } catch (error) {
    console.error('Error converting design to component:', error);
    return json(
      {
        success: false,
        error: 'Failed to convert design to component',
      },
      { status: 500 }
    );
  }
};

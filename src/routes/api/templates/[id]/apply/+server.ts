/**
 * Template Application API
 * POST /api/templates/[id]/apply - Create new page from template
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import { getTemplateById } from '$lib/server/services/templates';
import { createPage } from '$lib/server/services/pages';

/**
 * POST /api/templates/[id]/apply
 * Create a new page from template
 */
export const POST: RequestHandler = requireAuth(async ({ params, request, locals }) => {
	try {
		const { id } = params;
		const { slug, title } = await request.json();

		// Validation
		if (!slug?.trim()) {
			return json({ error: 'Page slug is required' }, { status: 400 });
		}

		if (!title?.trim()) {
			return json({ error: 'Page title is required' }, { status: 400 });
		}

		// Get template
		const template = await getTemplateById(id);
		if (!template) {
			return json({ error: 'Template not found' }, { status: 404 });
		}

		// Create page from template content
		const page = await createPage({
			slug: slug.trim(),
			title: title.trim(),
			designEvents: template.content, // Use template content as design events
			authorId: locals.user.id
		});

		return json({ page }, { status: 201 });
	} catch (error) {
		console.error('Failed to apply template:', error);

		// Handle unique constraint violation (duplicate slug)
		if (error instanceof Error && error.message.includes('Unique constraint')) {
			return json({ error: 'A page with this slug already exists' }, { status: 409 });
		}

		return json({ error: 'Failed to apply template' }, { status: 500 });
	}
});

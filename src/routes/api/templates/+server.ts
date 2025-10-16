/**
 * Templates API
 * GET /api/templates - List all templates
 * POST /api/templates - Create new template
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth, requireAdmin } from '$lib/server/middleware/auth';
import * as templatesService from '$lib/server/services/templates';

/**
 * GET /api/templates
 * List all templates
 */
export const GET: RequestHandler = requireAuth(async ({ url }) => {
	try {
		const category = url.searchParams.get('category');

		const templates = category
			? await templatesService.getTemplatesByCategory(category)
			: await templatesService.getAllTemplates();

		return json({ templates });
	} catch (error) {
		console.error('Failed to fetch templates:', error);
		return json({ error: 'Failed to fetch templates' }, { status: 500 });
	}
});

/**
 * POST /api/templates
 * Create new template (admin only)
 */
export const POST: RequestHandler = requireAdmin(async ({ request, locals }) => {
	try {
		const data = await request.json();

		// Validation
		if (!data.name?.trim()) {
			return json({ error: 'Template name is required' }, { status: 400 });
		}

		if (!data.content) {
			return json({ error: 'Template content is required' }, { status: 400 });
		}

		const template = await templatesService.createTemplate({
			name: data.name.trim(),
			description: data.description,
			category: data.category,
			content: data.content,
			thumbnail: data.thumbnail,
			createdBy: locals.user.id
		});

		return json(template, { status: 201 });
	} catch (error) {
		console.error('Failed to create template:', error);
		return json({ error: 'Failed to create template' }, { status: 500 });
	}
});

/**
 * DELETE /api/templates
 * Delete template by ID (admin only)
 */
export const DELETE: RequestHandler = requireAdmin(async ({ request }) => {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'Template ID is required' }, { status: 400 });
		}

		await templatesService.deleteTemplate(id);

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete template:', error);
		return json({ error: 'Failed to delete template' }, { status: 500 });
	}
});

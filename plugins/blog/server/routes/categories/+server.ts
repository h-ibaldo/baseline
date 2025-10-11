/**
 * Categories API
 *
 * GET /api/categories - List all categories
 * POST /api/categories - Create new category (requires admin/editor auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCategories, createCategory } from '../../services/categories';
import { requireAuth, requireRole } from '$lib/server/middleware/auth';

export const GET: RequestHandler = async (event) => {
	const includeEmpty = event.url.searchParams.get('includeEmpty') === 'true';

	try {
		const categories = await getCategories({ includeEmpty });
		return json({ categories });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch categories' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	// Require editor or admin role
	await requireRole(event, ['admin', 'editor']);

	try {
		const data = await event.request.json();

		// Validate required fields
		if (!data.slug || !data.name) {
			return json({ error: 'Missing required fields: slug, name' }, { status: 400 });
		}

		const category = await createCategory(data);
		return json(category, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create category' },
			{ status: 500 }
		);
	}
};

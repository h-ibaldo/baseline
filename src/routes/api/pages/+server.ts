/**
 * Pages API
 *
 * GET /api/pages - List all pages (requires auth)
 * POST /api/pages - Create new page (requires auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPages, createPage } from '$lib/server/services/pages';
import { requireAuth } from '$lib/server/middleware/auth';

export const GET: RequestHandler = async (event) => {
	// Require authentication
	await requireAuth(event);

	const status = event.url.searchParams.get('status') as 'draft' | 'published' | 'archived' | null;
	const limit = parseInt(event.url.searchParams.get('limit') || '50');
	const offset = parseInt(event.url.searchParams.get('offset') || '0');

	try {
		const result = await getPages({
			status: status || undefined,
			limit,
			offset
		});

		return json(result);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch pages' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	// Require authentication
	const user = await requireAuth(event);

	try {
		const data = await event.request.json();

		// Validate required fields
		if (!data.slug || !data.title || !data.designEvents) {
			return json(
				{ error: 'Missing required fields: slug, title, designEvents' },
				{ status: 400 }
			);
		}

		// Use authenticated user as author
		const page = await createPage({
			...data,
			authorId: user.id
		});

		return json(page, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create page' },
			{ status: 500 }
		);
	}
};


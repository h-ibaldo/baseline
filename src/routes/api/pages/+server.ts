/**
 * Pages API
 * 
 * GET /api/pages - List all pages
 * POST /api/pages - Create new page
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPages, createPage } from '$lib/server/services/pages';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status') as 'draft' | 'published' | 'archived' | null;
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

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

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.slug || !data.title || !data.designEvents || !data.authorId) {
			return json(
				{ error: 'Missing required fields: slug, title, designEvents, authorId' },
				{ status: 400 }
			);
		}

		const page = await createPage(data);

		return json(page, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create page' },
			{ status: 500 }
		);
	}
};


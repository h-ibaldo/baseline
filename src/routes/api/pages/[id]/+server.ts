/**
 * Single Page API
 * 
 * GET /api/pages/[id] - Get page by ID
 * PUT /api/pages/[id] - Update page
 * DELETE /api/pages/[id] - Delete page
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPageById, updatePage, deletePage } from '$lib/server/services/pages';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const page = await getPageById(params.id);

		if (!page) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		return json(page);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch page' },
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const data = await request.json();
		const page = await updatePage(params.id, data);

		return json(page);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to update page' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		await deletePage(params.id);
		return json({ success: true });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to delete page' },
			{ status: 500 }
		);
	}
};


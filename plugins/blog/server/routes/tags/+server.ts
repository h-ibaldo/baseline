/**
 * Tags API
 *
 * GET /api/tags - List all tags
 * POST /api/tags - Create new tag (requires auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTags, createTag, searchTags } from '../../services/tags';
import { requireAuth } from '$lib/server/middleware/auth';

export const GET: RequestHandler = async (event) => {
	const includeEmpty = event.url.searchParams.get('includeEmpty') === 'true';
	const search = event.url.searchParams.get('search');

	try {
		let tags;

		if (search) {
			tags = await searchTags(search);
		} else {
			tags = await getTags({ includeEmpty });
		}

		return json({ tags });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch tags' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	// Require authentication
	await requireAuth(event);

	try {
		const data = await event.request.json();

		// Validate required fields
		if (!data.slug || !data.name) {
			return json({ error: 'Missing required fields: slug, name' }, { status: 400 });
		}

		const tag = await createTag(data);
		return json(tag, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create tag' },
			{ status: 500 }
		);
	}
};

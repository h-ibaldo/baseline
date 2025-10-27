/**
 * GET /api/media - List all media
 * DELETE /api/media/:id - Delete media (will be in [id]/+server.ts)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware/auth';
import { listMedia } from '$lib/server/services/media';

export const GET: RequestHandler = requireAuth(async ({ url, locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const mimeType = url.searchParams.get('type') || undefined;

	const { media, total } = await listMedia({
		teamId: user.teamId,
		limit,
		offset,
		mimeType
	});

	return json({ media, total, limit, offset });
});

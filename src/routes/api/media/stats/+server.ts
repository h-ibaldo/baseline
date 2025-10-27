/**
 * GET /api/media/stats - Get media statistics
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware/auth';
import { getMediaStats } from '$lib/server/services/media';

export const GET: RequestHandler = requireAuth(async ({ locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	const stats = await getMediaStats(user.teamId);

	return json(stats);
});

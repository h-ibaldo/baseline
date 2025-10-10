/**
 * GET /api/media/stats
 * Get storage statistics
 */

import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import { getStorageStats } from '$lib/server/services/upload';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const user = await requireAuth(event);

	const stats = await getStorageStats(user.id);

	return json(stats);
};

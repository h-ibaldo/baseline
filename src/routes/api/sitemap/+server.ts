/**
 * Sitemap API Endpoints
 *
 * Admin endpoints for sitemap management
 */

import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import { getSitemapStats, getSitemapEntries } from '$lib/server/services/sitemap';

/**
 * GET /api/sitemap - Get sitemap statistics
 */
export const GET = requireAuth(async () => {
	try {
		const stats = await getSitemapStats();
		return json(stats);
	} catch (error) {
		console.error('Error getting sitemap stats:', error);
		return json({ error: 'Failed to get sitemap statistics' }, { status: 500 });
	}
});

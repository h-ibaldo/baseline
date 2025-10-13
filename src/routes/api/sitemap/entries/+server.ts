/**
 * Sitemap Entries API
 *
 * View all sitemap entries (admin only)
 */

import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/middleware/auth';
import { getSitemapEntries } from '$lib/server/services/sitemap';

/**
 * GET /api/sitemap/entries - Get all sitemap entries
 */
export const GET = requireAdmin(async () => {
	try {
		const entries = await getSitemapEntries();
		return json({ entries, total: entries.length });
	} catch (error) {
		console.error('Error getting sitemap entries:', error);
		return json({ error: 'Failed to get sitemap entries' }, { status: 500 });
	}
});

/**
 * Sitemap API Endpoints
 *
 * Admin endpoints for sitemap management
 */

import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/middleware/auth';
import { getSitemapStats } from '$lib/server/services/sitemap';
import type { RequestHandler } from './$types';

/**
 * GET /api/sitemap - Get sitemap statistics
 */
export const GET: RequestHandler = async (event) => {
    await requireAdmin(event);

    try {
        const stats = await getSitemapStats();
        return json(stats);
    } catch (error) {
        console.error('Error getting sitemap stats:', error);
        return json({ error: 'Failed to get sitemap statistics' }, { status: 500 });
    }
};

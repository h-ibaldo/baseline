/**
 * Content Block Usage Increment API
 * POST /api/content-blocks/[id]/increment - Increment usage count
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import * as blocksService from '$lib/server/services/content-blocks';

/**
 * POST /api/content-blocks/[id]/increment
 * Increment block usage count (no auth required - simple counter)
 */
export const POST: RequestHandler = async ({ params }) => {
	try {
		if (!params.id) {
			return json({ error: 'Block ID is required' }, { status: 400 });
		}

		await blocksService.incrementUsage(params.id);

		return json({ success: true });
	} catch (error) {
		console.error('Failed to increment block usage:', error);
		return json({ error: 'Failed to increment block usage' }, { status: 500 });
	}
};

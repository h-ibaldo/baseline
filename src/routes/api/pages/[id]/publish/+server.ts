/**
 * Publish Page API
 * 
 * POST /api/pages/[id]/publish - Publish a page
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { publishPageFromDesign } from '$lib/server/services/publishing';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const options = await request.json().catch(() => ({}));

		const result = await publishPageFromDesign(params.id, options);

		if (!result.success) {
			return json(
				{ error: result.errors?.join(', ') || 'Failed to publish page' },
				{ status: 400 }
			);
		}

		return json(result);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to publish page' },
			{ status: 500 }
		);
	}
};


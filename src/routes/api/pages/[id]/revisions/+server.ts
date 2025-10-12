/**
 * Page Revisions API
 *
 * GET /api/pages/[id]/revisions - Get all revisions for a page
 * POST /api/pages/[id]/revisions - Create a new revision
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPageRevisions, createRevision } from '$lib/server/services/pages';
import { requireAuth } from '$lib/server/middleware/auth';

export const GET: RequestHandler = async (event) => {
	await requireAuth(event);

	const pageId = event.params.id;

	try {
		const revisions = await getPageRevisions(pageId);
		return json(revisions);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch revisions' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	const user = await requireAuth(event);

	const pageId = event.params.id;

	try {
		await createRevision(pageId, user.id);
		return json({ success: true }, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create revision' },
			{ status: 500 }
		);
	}
};

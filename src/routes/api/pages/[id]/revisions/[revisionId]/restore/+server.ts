/**
 * Restore Page Revision API
 *
 * POST /api/pages/[id]/revisions/[revisionId]/restore - Restore page to specific revision
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { restoreRevision } from '$lib/server/services/pages';
import { requireAuth } from '$lib/server/middleware/auth';

export const POST: RequestHandler = async (event) => {
	const user = await requireAuth(event);

	const pageId = event.params.id;
	const revisionId = event.params.revisionId;

	try {
		await restoreRevision(pageId, revisionId, user.id);
		return json({ success: true, message: 'Page restored to revision' });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to restore revision' },
			{ status: 500 }
		);
	}
};

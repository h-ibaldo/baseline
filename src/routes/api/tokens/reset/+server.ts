/**
 * POST /api/tokens/reset - Reset tokens to defaults
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/middleware/auth';
import { resetTokens } from '$lib/server/services/tokens';

export const POST: RequestHandler = requireRole(['owner', 'manager'], async ({ locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	const tokens = await resetTokens(user.teamId);

	return json({ tokens });
});

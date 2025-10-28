/**
 * GET /api/tokens - Get design tokens
 * PUT /api/tokens - Update design tokens
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware/auth';
import { getTokens, updateTokens } from '$lib/server/services/tokens';

export const GET: RequestHandler = requireAuth(async ({ locals }) => {
	const user = locals.user;
	console.log('[GET /api/tokens] User:', user);

	if (!user.teamId) {
		console.log('[GET /api/tokens] ERROR: User has no teamId');
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	console.log('[GET /api/tokens] Fetching tokens for team:', user.teamId);
	const tokens = await getTokens(user.teamId);
	console.log('[GET /api/tokens] Tokens loaded successfully');

	return json({ tokens });
});

export const PUT: RequestHandler = requireAuth(async ({ request, locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	// Only owners and managers can update tokens
	if (!['owner', 'manager'].includes(user.role)) {
		return json({ error: 'Insufficient permissions' }, { status: 403 });
	}

	const { tokens } = await request.json();

	if (!tokens) {
		return json({ error: 'Tokens data required' }, { status: 400 });
	}

	const updated = await updateTokens(user.teamId, tokens);

	return json({ tokens: updated });
});

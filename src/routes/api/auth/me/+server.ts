/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware/auth';

export const GET: RequestHandler = requireAuth(async ({ locals }) => {
	// Don't return passwordHash to client
	const { passwordHash: _, ...userWithoutPassword } = locals.user;

	return json({ user: userWithoutPassword });
});

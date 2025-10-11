/**
 * GET /api/auth/me
 * Get current authenticated user
 */

import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const user = await requireAuth(event);

	return json({
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		avatarUrl: user.avatarUrl,
		status: user.status,
		createdAt: user.createdAt,
		lastLoginAt: user.lastLoginAt
	});
};

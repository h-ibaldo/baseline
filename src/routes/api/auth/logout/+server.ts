/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */

import { json } from '@sveltejs/kit';
import { logout } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const refreshToken = cookies.get('refresh_token');

	if (refreshToken) {
		await logout(refreshToken);
	}

	// Clear refresh token cookie
	cookies.delete('refresh_token', { path: '/' });

	return json({ success: true });
};

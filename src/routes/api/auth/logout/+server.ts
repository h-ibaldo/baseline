/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logout } from '$lib/server/services/auth';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { refreshToken } = await request.json();

		if (!refreshToken) {
			return json({ error: 'Refresh token is required' }, { status: 400 });
		}

		await logout(refreshToken);

		return json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

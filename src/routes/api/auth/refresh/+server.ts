/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { refresh } from '$lib/server/services/auth';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { refreshToken } = await request.json();

		if (!refreshToken) {
			return json({ error: 'Refresh token is required' }, { status: 400 });
		}

		const result = await refresh(refreshToken);

		if ('error' in result) {
			return json({ error: result.error }, { status: 401 });
		}

		return json({
			accessToken: result.tokens.accessToken,
			refreshToken: result.tokens.refreshToken
		});
	} catch (error) {
		console.error('Refresh error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

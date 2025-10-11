/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { json, error } from '@sveltejs/kit';
import { refresh } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		throw error(401, 'Refresh token not found');
	}

	const result = await refresh(refreshToken);

	if ('error' in result) {
		// Clear invalid refresh token
		cookies.delete('refresh_token', { path: '/' });
		throw error(401, result.error);
	}

	// Update refresh token in cookie
	cookies.set('refresh_token', result.tokens.refreshToken, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	});

	// Return new access token
	return json({
		accessToken: result.tokens.accessToken
	});
};

/**
 * POST /api/auth/register
 * Register a new user
 */

import { json, error } from '@sveltejs/kit';
import { register } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const { email, password, name } = body;

	// Validation
	if (!email || !password || !name) {
		throw error(400, 'Email, password, and name are required');
	}

	if (password.length < 8) {
		throw error(400, 'Password must be at least 8 characters');
	}

	if (!email.includes('@')) {
		throw error(400, 'Invalid email format');
	}

	// Register user
	const result = await register({ email, password, name });

	if ('error' in result) {
		throw error(400, result.error);
	}

	// Set refresh token in HTTP-only cookie
	cookies.set('refresh_token', result.tokens.refreshToken, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	});

	// Return user and access token
	return json({
		user: {
			id: result.user.id,
			email: result.user.email,
			name: result.user.name,
			role: result.user.role,
			avatarUrl: result.user.avatarUrl
		},
		accessToken: result.tokens.accessToken
	});
};

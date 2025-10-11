/**
 * POST /api/auth/login
 * Login with email and password
 */

import { json, error } from '@sveltejs/kit';
import { login } from '$lib/server/services/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const { email, password } = body;

	// Validation
	if (!email || !password) {
		throw error(400, 'Email and password are required');
	}

	// Login
	const result = await login(email, password);

	if ('error' in result) {
		throw error(401, result.error);
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
			avatarUrl: result.user.avatarUrl,
			createdAt: result.user.createdAt,
			lastLoginAt: result.user.lastLoginAt
		},
		accessToken: result.tokens.accessToken
	});
};

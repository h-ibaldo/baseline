/**
 * POST /api/auth/login
 * Login with email and password
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { login } from '$lib/server/services/auth';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const result = await login(email, password);

		if ('error' in result) {
			return json({ error: result.error }, { status: 401 });
		}

		// Don't return passwordHash to client
		const { passwordHash: _, ...userWithoutPassword } = result.user;

		return json({
			user: userWithoutPassword,
			accessToken: result.tokens.accessToken,
			refreshToken: result.tokens.refreshToken
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

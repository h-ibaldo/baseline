/**
 * POST /api/auth/register
 * Register a new user account
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { register } from '$lib/server/services/auth';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password, name } = await request.json();

		// Validate input
		if (!email || !password || !name) {
			return json({ error: 'Email, password, and name are required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate password strength (minimum 8 characters)
		if (password.length < 8) {
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		const result = await register({ email, password, name });

		if ('error' in result) {
			return json({ error: result.error }, { status: 400 });
		}

		// Don't return passwordHash to client
		const { passwordHash: _, ...userWithoutPassword } = result.user;

		return json(
			{
				user: userWithoutPassword,
				accessToken: result.tokens.accessToken,
				refreshToken: result.tokens.refreshToken
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Registration error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

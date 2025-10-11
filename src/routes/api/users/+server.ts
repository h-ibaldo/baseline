/**
 * Users API
 *
 * GET /api/users - List all users (requires admin auth)
 * POST /api/users - Create new user (requires admin auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/middleware/auth';
import { db } from '$lib/server/db/client';
import { hashPassword } from '$lib/server/services/auth';

export const GET: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	try {
		const users = await db.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				status: true,
				createdAt: true,
				lastLoginAt: true
			}
		});

		return json({ users });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch users' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	try {
		const data = await event.request.json();

		// Validate required fields
		if (!data.email || !data.name || !data.password) {
			return json(
				{ error: 'Missing required fields: email, name, password' },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email: data.email }
		});

		if (existingUser) {
			return json({ error: 'User with this email already exists' }, { status: 409 });
		}

		// Hash password
		const passwordHash = await hashPassword(data.password);

		// Create user
		const user = await db.user.create({
			data: {
				email: data.email,
				name: data.name,
				passwordHash,
				role: data.role || 'author',
				status: data.status || 'active'
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				status: true,
				createdAt: true,
				lastLoginAt: true
			}
		});

		return json(user, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create user' },
			{ status: 500 }
		);
	}
};

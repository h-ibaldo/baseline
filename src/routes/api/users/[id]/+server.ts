/**
 * User Detail API
 *
 * GET /api/users/[id] - Get user by ID (requires admin auth)
 * PATCH /api/users/[id] - Update user (requires admin auth)
 * DELETE /api/users/[id] - Delete user (requires admin auth)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/middleware/auth';
import { db } from '$lib/server/db/client';
import { hashPassword } from '$lib/server/services/auth';

export const GET: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	const { id } = event.params;

	try {
		const user = await db.user.findUnique({
			where: { id },
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

		if (!user) {
			throw error(404, 'User not found');
		}

		return json(user);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to fetch user' },
			{ status: 500 }
		);
	}
};

export const PATCH: RequestHandler = async (event) => {
	// Require admin authentication
	const admin = await requireAdmin(event);

	const { id } = event.params;

	try {
		const data = await event.request.json();

		// Prevent admin from suspending themselves
		if (admin.id === id && data.status === 'suspended') {
			return json({ error: 'You cannot suspend your own account' }, { status: 400 });
		}

		// Prevent admin from demoting themselves
		if (admin.id === id && data.role && data.role !== 'admin') {
			return json({ error: 'You cannot change your own role' }, { status: 400 });
		}

		// Build update data
		const updateData: any = {};

		if (data.email) updateData.email = data.email;
		if (data.name) updateData.name = data.name;
		if (data.role) updateData.role = data.role;
		if (data.status) updateData.status = data.status;

		// Hash password if provided
		if (data.password) {
			updateData.passwordHash = await hashPassword(data.password);
		}

		// Update user
		const user = await db.user.update({
			where: { id },
			data: updateData,
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

		return json(user);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to update user' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async (event) => {
	// Require admin authentication
	const admin = await requireAdmin(event);

	const { id } = event.params;

	try {
		// Prevent admin from deleting themselves
		if (admin.id === id) {
			return json({ error: 'You cannot delete your own account' }, { status: 400 });
		}

		// Delete user (this will cascade delete sessions)
		await db.user.delete({
			where: { id }
		});

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to delete user' },
			{ status: 500 }
		);
	}
};

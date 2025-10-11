/**
 * Settings API
 *
 * GET /api/settings - Get all settings (requires auth)
 * POST /api/settings - Update/create setting (requires admin auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, requireAdmin } from '$lib/server/middleware/auth';
import { db } from '$lib/server/db/client';

export const GET: RequestHandler = async (event) => {
	// Require authentication
	await requireAuth(event);

	try {
		const settings = await db.setting.findMany({
			orderBy: { key: 'asc' }
		});

		return json({ settings });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch settings' },
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
		if (!data.key) {
			return json({ error: 'Missing required field: key' }, { status: 400 });
		}

		// Upsert setting (update if exists, create if not)
		const setting = await db.setting.upsert({
			where: { key: data.key },
			update: {
				value: data.value || '',
				description: data.description || null
			},
			create: {
				key: data.key,
				value: data.value || '',
				description: data.description || null
			}
		});

		return json(setting);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to save setting' },
			{ status: 500 }
		);
	}
};

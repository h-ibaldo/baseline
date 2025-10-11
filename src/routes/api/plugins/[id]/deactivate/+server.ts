/**
 * Plugin Deactivation API
 *
 * POST /api/plugins/[id]/deactivate - Deactivate a plugin (requires admin auth)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/middleware/auth';
import { deactivatePlugin } from '$lib/server/services/plugins';

export const POST: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	const { id } = event.params;

	try {
		const plugin = await deactivatePlugin(id);

		return json({
			success: true,
			plugin: {
				...plugin,
				settings: plugin.settings ? JSON.parse(plugin.settings) : {}
			}
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate plugin';

		if (errorMessage.includes('not found')) {
			throw error(404, 'Plugin not found');
		}

		return json({ error: errorMessage }, { status: 500 });
	}
};

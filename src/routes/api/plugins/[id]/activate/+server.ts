/**
 * Plugin Activation API
 *
 * POST /api/plugins/[id]/activate - Activate a plugin (requires admin auth)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/middleware/auth';
import { activatePlugin } from '$lib/server/services/plugins';

export const POST: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	const { id } = event.params;

	try {
		const plugin = await activatePlugin(id);

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

		// Check for specific error types
		const errorMessage = err instanceof Error ? err.message : 'Failed to activate plugin';

		if (errorMessage.includes('not found')) {
			throw error(404, 'Plugin not found');
		}

		if (errorMessage.includes('dependency')) {
			throw error(400, errorMessage);
		}

		return json({ error: errorMessage }, { status: 500 });
	}
};

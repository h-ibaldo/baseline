/**
 * Plugin Detail API
 *
 * GET /api/plugins/[id] - Get plugin details (requires admin auth)
 * PATCH /api/plugins/[id] - Update plugin settings (requires admin auth)
 * DELETE /api/plugins/[id] - Uninstall plugin (requires admin auth)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/middleware/auth';
import {
	getPluginById,
	updatePluginSettings,
	uninstallPlugin
} from '$lib/server/services/plugins';
import { getPluginRegistry } from '$lib/core/plugins';

export const GET: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	const { id } = event.params;

	try {
		// Get from database
		const dbPlugin = await getPluginById(id);

		if (!dbPlugin) {
			throw error(404, 'Plugin not found');
		}

		// Get from registry
		const registry = getPluginRegistry();
		const regPlugin = registry.getPlugin(id);

		return json({
			...dbPlugin,
			settings: dbPlugin.settings ? JSON.parse(dbPlugin.settings) : {},
			manifest: regPlugin?.manifest || null,
			isLoaded: !!regPlugin
		});
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to fetch plugin' },
			{ status: 500 }
		);
	}
};

export const PATCH: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	const { id } = event.params;

	try {
		const data = await event.request.json();

		// Update settings
		if (data.settings) {
			const plugin = await updatePluginSettings(id, data.settings);
			return json({
				...plugin,
				settings: plugin.settings ? JSON.parse(plugin.settings) : {}
			});
		}

		throw error(400, 'No settings provided');
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to update plugin' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	const { id } = event.params;

	try {
		// Deactivate first if active
		const registry = getPluginRegistry();
		if (registry.isActive(id)) {
			await registry.deactivate(id);
		}

		// Unregister from registry
		await registry.unregister(id);

		// Delete from database
		await uninstallPlugin(id);

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to uninstall plugin' },
			{ status: 500 }
		);
	}
};

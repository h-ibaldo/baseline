/**
 * Plugins API
 *
 * GET /api/plugins - List all plugins (requires admin auth)
 * POST /api/plugins - Install a plugin (requires admin auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/middleware/auth';
import {
	getInstalledPlugins,
	installPlugin,
	getPluginStats
} from '$lib/server/services/plugins';
import { getPluginRegistry } from '$lib/core/plugins';

export const GET: RequestHandler = async (event) => {
	// Require admin authentication
	await requireAdmin(event);

	try {
		// Get installed plugins from database
		const installedPlugins = await getInstalledPlugins();

		// Get registry plugins (loaded from disk)
		const registry = getPluginRegistry();
		const registryPlugins = registry.getAllPlugins();

		// Combine data: registry plugins with database status
		const plugins = registryPlugins.map((regPlugin) => {
			const dbPlugin = installedPlugins.find((p) => p.id === regPlugin.manifest.id);

			return {
				// From manifest
				id: regPlugin.manifest.id,
				name: regPlugin.manifest.name,
				version: regPlugin.manifest.version,
				description: regPlugin.manifest.description,
				author: regPlugin.manifest.author,
				capabilities: regPlugin.manifest.capabilities || [],

				// From database
				isInstalled: !!dbPlugin,
				isActive: dbPlugin?.isActive || false,
				installedAt: dbPlugin?.installedAt || null,
				settings: dbPlugin?.settings ? JSON.parse(dbPlugin.settings) : {},

				// From registry
				isLoaded: true
			};
		});

		// Get stats
		const stats = await getPluginStats();

		return json({
			plugins,
			stats
		});
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch plugins' },
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
		if (!data.id || !data.name || !data.version) {
			return json(
				{ error: 'Missing required fields: id, name, version' },
				{ status: 400 }
			);
		}

		// Install plugin
		const plugin = await installPlugin({
			id: data.id,
			name: data.name,
			version: data.version,
			isActive: data.isActive || false,
			settings: data.settings || {}
		});

		return json(plugin, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to install plugin' },
			{ status: 500 }
		);
	}
};

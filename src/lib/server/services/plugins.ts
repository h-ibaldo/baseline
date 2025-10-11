/**
 * Plugins Service
 *
 * Database operations for plugin management
 * Server-side only
 */

import { db } from '../db/client';
import type { Plugin as PluginModel } from '@prisma/client';
import { getPluginRegistry } from '$lib/core/plugins';

export interface PluginData {
	id: string;
	name: string;
	version: string;
	isActive: boolean;
	settings?: Record<string, any>;
}

/**
 * Get all installed plugins from database
 */
export async function getInstalledPlugins(): Promise<PluginModel[]> {
	return db.plugin.findMany({
		orderBy: { installedAt: 'desc' }
	});
}

/**
 * Get a specific plugin by ID
 */
export async function getPluginById(id: string): Promise<PluginModel | null> {
	return db.plugin.findUnique({
		where: { id }
	});
}

/**
 * Install a plugin (add to database)
 */
export async function installPlugin(data: PluginData): Promise<PluginModel> {
	return db.plugin.create({
		data: {
			id: data.id,
			name: data.name,
			version: data.version,
			isActive: data.isActive,
			settings: data.settings ? JSON.stringify(data.settings) : null
		}
	});
}

/**
 * Uninstall a plugin (remove from database)
 */
export async function uninstallPlugin(id: string): Promise<void> {
	await db.plugin.delete({
		where: { id }
	});
}

/**
 * Activate a plugin
 */
export async function activatePlugin(id: string): Promise<PluginModel> {
	// Update database
	const plugin = await db.plugin.update({
		where: { id },
		data: { isActive: true }
	});

	// Activate in registry (runtime)
	const registry = getPluginRegistry();
	await registry.activate(id);

	return plugin;
}

/**
 * Deactivate a plugin
 */
export async function deactivatePlugin(id: string): Promise<PluginModel> {
	// Deactivate in registry first (runtime)
	const registry = getPluginRegistry();
	await registry.deactivate(id);

	// Update database
	const plugin = await db.plugin.update({
		where: { id },
		data: { isActive: false }
	});

	return plugin;
}

/**
 * Update plugin settings
 */
export async function updatePluginSettings(
	id: string,
	settings: Record<string, any>
): Promise<PluginModel> {
	// Update database
	const plugin = await db.plugin.update({
		where: { id },
		data: {
			settings: JSON.stringify(settings)
		}
	});

	// Update registry (runtime)
	const registry = getPluginRegistry();
	await registry.updatePluginSettings(id, settings);

	return plugin;
}

/**
 * Get plugin settings
 */
export async function getPluginSettings(id: string): Promise<Record<string, any>> {
	const plugin = await db.plugin.findUnique({
		where: { id },
		select: { settings: true }
	});

	if (!plugin?.settings) {
		return {};
	}

	try {
		return JSON.parse(plugin.settings);
	} catch {
		return {};
	}
}

/**
 * Sync installed plugins with registry
 * Load plugins from disk and ensure they match database
 */
export async function syncPlugins(): Promise<{
	loaded: number;
	activated: number;
	errors: string[];
}> {
	const registry = getPluginRegistry();
	const errors: string[] = [];
	let loaded = 0;
	let activated = 0;

	try {
		// Get all plugins from database
		const installedPlugins = await getInstalledPlugins();

		// Load each plugin into registry
		for (const dbPlugin of installedPlugins) {
			try {
				// Check if plugin is already in registry
				const registryPlugin = registry.getPlugin(dbPlugin.id);

				if (!registryPlugin) {
					// Plugin in database but not in registry - needs to be loaded
					// This will be handled by the plugin loader in a future step
					errors.push(`Plugin ${dbPlugin.id} is installed but not found on disk`);
					continue;
				}

				loaded++;

				// Activate if marked as active in database
				if (dbPlugin.isActive && !registry.isActive(dbPlugin.id)) {
					await registry.activate(dbPlugin.id);
					activated++;
				}

				// Load settings
				if (dbPlugin.settings) {
					try {
						const settings = JSON.parse(dbPlugin.settings);
						await registry.updatePluginSettings(dbPlugin.id, settings);
					} catch (err) {
						errors.push(`Failed to parse settings for ${dbPlugin.id}`);
					}
				}
			} catch (err) {
				errors.push(`Error loading plugin ${dbPlugin.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
			}
		}

		return { loaded, activated, errors };
	} catch (err) {
		errors.push(`Failed to sync plugins: ${err instanceof Error ? err.message : 'Unknown error'}`);
		return { loaded, activated, errors };
	}
}

/**
 * Get plugin statistics
 */
export async function getPluginStats(): Promise<{
	total: number;
	active: number;
	inactive: number;
}> {
	const [total, active] = await Promise.all([
		db.plugin.count(),
		db.plugin.count({ where: { isActive: true } })
	]);

	return {
		total,
		active,
		inactive: total - active
	};
}

/**
 * Check if a plugin is installed
 */
export async function isPluginInstalled(id: string): Promise<boolean> {
	const plugin = await db.plugin.findUnique({
		where: { id },
		select: { id: true }
	});

	return !!plugin;
}

/**
 * Get active plugins
 */
export async function getActivePlugins(): Promise<PluginModel[]> {
	return db.plugin.findMany({
		where: { isActive: true },
		orderBy: { name: 'asc' }
	});
}

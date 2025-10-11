import type { Handle } from '@sveltejs/kit';
import { getPluginRegistry } from '$lib/core/plugins';
import { db } from '$lib/server/db/client';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

// Initialize plugins on server startup
let pluginsInitialized = false;

async function initializePlugins() {
	if (pluginsInitialized) return;

	try {
		const registry = getPluginRegistry();
		const pluginsDir = join(process.cwd(), 'plugins');

		// Check if plugins directory exists
		if (!existsSync(pluginsDir)) {
			console.log('No plugins directory found, skipping plugin initialization');
			pluginsInitialized = true;
			return;
		}

		// Discover and register all plugins from disk
		const pluginFolders = readdirSync(pluginsDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		console.log(`📦 Discovering plugins: ${pluginFolders.join(', ')}`);

		// Known plugins - we'll use static imports to avoid Vite issues
		// In production, this could be made more dynamic
		const availablePlugins: Record<string, () => Promise<any>> = {
			blog: () => import('$lib/../../plugins/blog/manifest')
		};

		for (const folder of pluginFolders) {
			const pluginPath = join(pluginsDir, folder);
			const manifestPath = join(pluginPath, 'manifest.ts');

			if (existsSync(manifestPath) && availablePlugins[folder]) {
				try {
					// Import the plugin manifest using static import map
					const manifestModule = await availablePlugins[folder]();
					const manifest = manifestModule.manifest || manifestModule.default;

					if (!manifest) {
						console.error(`❌ No manifest found in plugin: ${folder}`);
						continue;
					}

					// Check if already registered
					const existing = registry.getPlugin(manifest.id);
					if (existing) {
						console.log(`⏭️  Plugin already registered: ${manifest.name} (${manifest.id})`);
						continue;
					}

					// Register the plugin in the registry
					await registry.register(manifest, pluginPath);
					console.log(`✅ Registered plugin: ${manifest.name} (${manifest.id})`);
				} catch (error) {
					console.error(`❌ Failed to register plugin ${folder}:`, error);
				}
			}
		}

		// Sync with database - activate plugins that are marked as active
		try {
			const dbPlugins = await db.plugin.findMany({
				where: { isActive: true }
			});

			console.log(`🔄 Syncing ${dbPlugins.length} active plugin(s) from database...`);

			for (const dbPlugin of dbPlugins) {
				try {
					const plugin = registry.getPlugin(dbPlugin.id);
					if (plugin && !plugin.isActive) {
						await registry.activate(dbPlugin.id);
						console.log(`⚡ Activated plugin: ${dbPlugin.name} (${dbPlugin.id})`);
					}
				} catch (error) {
					console.error(`❌ Failed to activate plugin ${dbPlugin.id}:`, error);
				}
			}
		} catch (error) {
			console.error('Failed to sync plugins with database:', error);
		}

		pluginsInitialized = true;
		console.log('✨ Plugin system initialized');
	} catch (error) {
		console.error('Failed to initialize plugins:', error);
		pluginsInitialized = true; // Set to true anyway to avoid retry loops
	}
}

// SvelteKit handle hook
export const handle: Handle = async ({ event, resolve }) => {
	// Initialize plugins on first request
	if (!pluginsInitialized) {
		await initializePlugins();
	}

	// Check if this is a plugin route
	const registry = getPluginRegistry();
	const path = event.url.pathname;

	// Handle plugin API routes dynamically
	if (path.startsWith('/api/')) {
		const matchedPlugin = registry.matchRoute(path);
		if (matchedPlugin) {
			// This route belongs to a plugin
			// The route will be handled by the plugin's API files in plugins/{name}/server/routes/
			// SvelteKit will automatically resolve to those files
			console.log(`🔌 Plugin route matched: ${path} -> ${matchedPlugin.manifest.id}`);
		}
	}

	// Handle plugin admin routes dynamically
	if (path.startsWith('/admin/')) {
		const matchedPlugin = registry.matchRoute(path);
		if (matchedPlugin) {
			// This admin route belongs to a plugin
			console.log(`🔌 Plugin admin route matched: ${path} -> ${matchedPlugin.manifest.id}`);
		}
	}

	// Continue with normal request handling
	const response = await resolve(event);
	return response;
};

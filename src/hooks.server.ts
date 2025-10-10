import type { Handle } from '@sveltejs/kit';
import { getPluginRegistry } from '$lib/core/plugins';
import { join } from 'path';
import { existsSync } from 'fs';

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

		// Load blog plugin
		const blogPluginPath = join(pluginsDir, 'blog');
		if (existsSync(blogPluginPath)) {
			try {
				// Import the blog plugin manifest
				const { manifest } = await import('../plugins/blog/manifest.js');

				// Register the plugin
				await registry.register(manifest, blogPluginPath);

				console.log(`✅ Registered plugin: ${manifest.name} (${manifest.id})`);

				// Note: We don't auto-activate here - activation is controlled via the admin UI
				// and persisted in the database
			} catch (error) {
				console.error('Failed to register blog plugin:', error);
			}
		}

		pluginsInitialized = true;
		console.log('Plugin system initialized');
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

	// Continue with normal request handling
	const response = await resolve(event);
	return response;
};

/**
 * Plugin Registry
 *
 * Central registry for managing plugins in LineBasis
 * Singleton pattern - only one instance exists
 */

import type {
	Plugin,
	PluginManifest,
	IPluginRegistry,
	PluginHooks,
	PluginError,
	PluginErrorCode
} from './types';
import { PluginError as PluginErrorClass, PluginErrorCode as ErrorCode } from './types';

export class PluginRegistry implements IPluginRegistry {
	private static instance: PluginRegistry;
	private plugins: Map<string, Plugin> = new Map();
	private activePlugins: Set<string> = new Set();
	private routeCache: Map<string, Plugin> = new Map();

	private constructor() {
		// Private constructor for singleton
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): PluginRegistry {
		if (!PluginRegistry.instance) {
			PluginRegistry.instance = new PluginRegistry();
		}
		return PluginRegistry.instance;
	}

	/**
	 * Register a new plugin
	 */
	async register(manifest: PluginManifest, rootPath: string): Promise<void> {
		if (this.plugins.has(manifest.id)) {
			throw new PluginErrorClass(
				`Plugin ${manifest.id} is already registered`,
				manifest.id,
				ErrorCode.ALREADY_INSTALLED
			);
		}

		// Create plugin instance
		const plugin: Plugin = {
			manifest,
			rootPath,
			isActive: false,
			installedAt: new Date(),
			settings: {},

			initialize: async () => {
				if (manifest.hooks?.onActivate) {
					await manifest.hooks.onActivate();
				}
			},

			shutdown: async () => {
				if (manifest.hooks?.onDeactivate) {
					await manifest.hooks.onDeactivate();
				}
			},

			handleRequest: undefined // Will be set by plugin loader
		};

		this.plugins.set(manifest.id, plugin);
	}

	/**
	 * Unregister a plugin
	 */
	async unregister(pluginId: string): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) {
			throw new PluginErrorClass(
				`Plugin ${pluginId} not found`,
				pluginId,
				ErrorCode.NOT_FOUND
			);
		}

		// Deactivate if active
		if (this.isActive(pluginId)) {
			await this.deactivate(pluginId);
		}

		// Run uninstall hook
		if (plugin.manifest.hooks?.onUninstall) {
			await plugin.manifest.hooks.onUninstall();
		}

		this.plugins.delete(pluginId);
		this.clearRouteCache();
	}

	/**
	 * Activate a plugin
	 */
	async activate(pluginId: string): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) {
			throw new PluginErrorClass(
				`Plugin ${pluginId} not found`,
				pluginId,
				ErrorCode.NOT_FOUND
			);
		}

		if (this.activePlugins.has(pluginId)) {
			return; // Already active
		}

		// Check dependencies
		await this.checkDependencies(plugin.manifest);

		// Initialize plugin
		await plugin.initialize();

		// Mark as active
		this.activePlugins.add(pluginId);
		plugin.isActive = true;

		// Clear route cache to rebuild
		this.clearRouteCache();
	}

	/**
	 * Deactivate a plugin
	 */
	async deactivate(pluginId: string): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) {
			throw new PluginErrorClass(
				`Plugin ${pluginId} not found`,
				pluginId,
				ErrorCode.NOT_FOUND
			);
		}

		if (!this.activePlugins.has(pluginId)) {
			return; // Already inactive
		}

		// Shutdown plugin
		await plugin.shutdown();

		// Mark as inactive
		this.activePlugins.delete(pluginId);
		plugin.isActive = false;

		// Clear route cache
		this.clearRouteCache();
	}

	/**
	 * Get a specific plugin
	 */
	getPlugin(pluginId: string): Plugin | undefined {
		return this.plugins.get(pluginId);
	}

	/**
	 * Get all registered plugins
	 */
	getAllPlugins(): Plugin[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * Get only active plugins
	 */
	getActivePlugins(): Plugin[] {
		return Array.from(this.plugins.values()).filter((p) => p.isActive);
	}

	/**
	 * Check if plugin is active
	 */
	isActive(pluginId: string): boolean {
		return this.activePlugins.has(pluginId);
	}

	/**
	 * Load all active plugins from database
	 */
	async loadActivePlugins(): Promise<void> {
		// This will be implemented when we integrate with the database
		// For now, it's a placeholder
	}

	/**
	 * Reload a specific plugin
	 */
	async reloadPlugin(pluginId: string): Promise<void> {
		const wasActive = this.isActive(pluginId);

		if (wasActive) {
			await this.deactivate(pluginId);
		}

		// Re-load the plugin manifest
		// This will be implemented by the loader

		if (wasActive) {
			await this.activate(pluginId);
		}
	}

	/**
	 * Execute a hook across all active plugins
	 */
	async executeHook<T>(hookName: keyof PluginHooks, ...args: any[]): Promise<T[]> {
		const results: T[] = [];

		for (const plugin of this.getActivePlugins()) {
			const hook = plugin.manifest.hooks?.[hookName];
			if (hook && typeof hook === 'function') {
				try {
					const result = await (hook as Function)(...args);
					if (result !== undefined) {
						results.push(result);
					}
				} catch (error) {
					console.error(`Error executing hook ${hookName} in plugin ${plugin.manifest.id}:`, error);
					// Continue with other plugins even if one fails
				}
			}
		}

		return results;
	}

	/**
	 * Match a route to a plugin
	 */
	matchRoute(path: string): Plugin | null {
		// Check cache first
		if (this.routeCache.has(path)) {
			return this.routeCache.get(path) || null;
		}

		// Search active plugins
		for (const plugin of this.getActivePlugins()) {
			// Check API routes
			if (plugin.manifest.apiRoutes) {
				for (const route of plugin.manifest.apiRoutes) {
					if (this.pathMatches(path, route.path)) {
						this.routeCache.set(path, plugin);
						return plugin;
					}
				}
			}

			// Check public routes
			if (plugin.manifest.publicRoutes) {
				for (const route of plugin.manifest.publicRoutes) {
					if (this.pathMatches(path, route.path)) {
						this.routeCache.set(path, plugin);
						return plugin;
					}
				}
			}
		}

		return null;
	}

	/**
	 * Get admin navigation items from all active plugins
	 */
	getAdminNavItems(): any[] {
		const navItems: any[] = [];

		for (const plugin of this.getActivePlugins()) {
			if (plugin.manifest.adminNav) {
				navItems.push(...plugin.manifest.adminNav);
			}
		}

		// Sort by order
		return navItems.sort((a, b) => (a.order || 100) - (b.order || 100));
	}

	/**
	 * Get plugin settings
	 */
	getPluginSettings(pluginId: string): Record<string, any> {
		const plugin = this.plugins.get(pluginId);
		return plugin?.settings || {};
	}

	/**
	 * Update plugin settings
	 */
	async updatePluginSettings(pluginId: string, settings: Record<string, any>): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) {
			throw new PluginErrorClass(
				`Plugin ${pluginId} not found`,
				pluginId,
				ErrorCode.NOT_FOUND
			);
		}

		plugin.settings = { ...plugin.settings, ...settings };

		// Persist to database
		// This will be implemented when we integrate with the database
	}

	/**
	 * Private: Check if path matches route pattern
	 */
	private pathMatches(path: string, pattern: string): boolean {
		// Simple exact match for now
		// Can be enhanced with parameter matching later
		if (path === pattern) {
			return true;
		}

		// Check if pattern has parameters (e.g., /api/posts/[id])
		const patternRegex = pattern
			.replace(/\[([^\]]+)\]/g, '([^/]+)') // Replace [id] with capture group
			.replace(/\//g, '\\/'); // Escape slashes

		const regex = new RegExp(`^${patternRegex}$`);
		return regex.test(path);
	}

	/**
	 * Private: Check plugin dependencies
	 */
	private async checkDependencies(manifest: PluginManifest): Promise<void> {
		// Check if dependent plugins are active
		if (manifest.requires.plugins) {
			for (const [pluginId, version] of Object.entries(manifest.requires.plugins)) {
				if (!this.isActive(pluginId)) {
					throw new PluginErrorClass(
						`Required plugin ${pluginId} is not active`,
						manifest.id,
						ErrorCode.DEPENDENCY_MISSING
					);
				}

				// TODO: Add semantic version checking
			}
		}
	}

	/**
	 * Private: Clear route cache
	 */
	private clearRouteCache(): void {
		this.routeCache.clear();
	}

	/**
	 * Reset registry (for testing)
	 */
	public reset(): void {
		this.plugins.clear();
		this.activePlugins.clear();
		this.routeCache.clear();
	}
}

/**
 * Export singleton instance getter
 */
export function getPluginRegistry(): PluginRegistry {
	return PluginRegistry.getInstance();
}

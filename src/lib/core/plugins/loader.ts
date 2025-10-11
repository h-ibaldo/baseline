/**
 * Plugin Loader
 *
 * Responsible for loading plugins from disk and validating them
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import type { Plugin, PluginManifest, IPluginLoader } from './types';
import { PluginError, PluginErrorCode } from './types';
import { getPluginRegistry } from './registry';

export class PluginLoader implements IPluginLoader {
	private pluginsDirectory: string;

	constructor(pluginsDirectory: string = 'plugins') {
		this.pluginsDirectory = pluginsDirectory;
	}

	/**
	 * Load a plugin from a directory
	 */
	async loadPlugin(pluginPath: string): Promise<Plugin> {
		try {
			// Read manifest file
			const manifestPath = join(pluginPath, 'manifest.ts');
			const manifest = await this.loadManifest(manifestPath);

			// Validate manifest
			if (!this.validateManifest(manifest)) {
				throw new PluginError(
					`Invalid manifest for plugin at ${pluginPath}`,
					manifest.id || 'unknown',
					PluginErrorCode.INVALID_MANIFEST
				);
			}

			// Check dependencies
			const depsOk = await this.checkDependencies(manifest);
			if (!depsOk) {
				throw new PluginError(
					`Dependency check failed for plugin ${manifest.id}`,
					manifest.id,
					PluginErrorCode.DEPENDENCY_MISSING
				);
			}

			// Register with registry
			const registry = getPluginRegistry();
			await registry.register(manifest, pluginPath);

			const plugin = registry.getPlugin(manifest.id);
			if (!plugin) {
				throw new PluginError(
					`Failed to register plugin ${manifest.id}`,
					manifest.id,
					PluginErrorCode.ACTIVATION_FAILED
				);
			}

			return plugin;
		} catch (error) {
			if (error instanceof PluginError) {
				throw error;
			}
			throw new PluginError(
				`Failed to load plugin from ${pluginPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
				'unknown',
				PluginErrorCode.ACTIVATION_FAILED
			);
		}
	}

	/**
	 * Discover all plugins in the plugins directory
	 */
	async discoverPlugins(): Promise<string[]> {
		try {
			const entries = await readdir(this.pluginsDirectory, { withFileTypes: true });
			const pluginPaths: string[] = [];

			for (const entry of entries) {
				if (entry.isDirectory()) {
					const pluginPath = join(this.pluginsDirectory, entry.name);
					const manifestPath = join(pluginPath, 'manifest.ts');

					try {
						await stat(manifestPath);
						pluginPaths.push(pluginPath);
					} catch {
						// No manifest found, skip
						continue;
					}
				}
			}

			return pluginPaths;
		} catch (error) {
			console.error('Failed to discover plugins:', error);
			return [];
		}
	}

	/**
	 * Load all discovered plugins
	 */
	async loadAllPlugins(): Promise<Plugin[]> {
		const pluginPaths = await this.discoverPlugins();
		const plugins: Plugin[] = [];

		for (const path of pluginPaths) {
			try {
				const plugin = await this.loadPlugin(path);
				plugins.push(plugin);
			} catch (error) {
				console.error(`Failed to load plugin at ${path}:`, error);
				// Continue with other plugins
			}
		}

		return plugins;
	}

	/**
	 * Validate plugin manifest
	 */
	validateManifest(manifest: PluginManifest): boolean {
		// Required fields
		if (!manifest.id || typeof manifest.id !== 'string') {
			console.error('Plugin manifest missing required field: id');
			return false;
		}

		if (!manifest.name || typeof manifest.name !== 'string') {
			console.error('Plugin manifest missing required field: name');
			return false;
		}

		if (!manifest.version || typeof manifest.version !== 'string') {
			console.error('Plugin manifest missing required field: version');
			return false;
		}

		if (!manifest.description || typeof manifest.description !== 'string') {
			console.error('Plugin manifest missing required field: description');
			return false;
		}

		// Validate version format (basic semantic versioning check)
		const versionRegex = /^\d+\.\d+\.\d+(-[a-z0-9]+)?$/i;
		if (!versionRegex.test(manifest.version)) {
			console.error(`Invalid version format: ${manifest.version}`);
			return false;
		}

		// Validate ID format (should be scoped like @linebasis/blog)
		const idRegex = /^@[a-z0-9-]+\/[a-z0-9-]+$/;
		if (!idRegex.test(manifest.id)) {
			console.error(`Invalid plugin ID format: ${manifest.id}. Expected format: @scope/name`);
			return false;
		}

		// Validate routes if present
		if (manifest.apiRoutes) {
			for (const route of manifest.apiRoutes) {
				if (!route.path || typeof route.path !== 'string') {
					console.error('API route missing path');
					return false;
				}
				if (!route.handler || typeof route.handler !== 'function') {
					console.error('API route missing handler');
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Check if plugin dependencies are satisfied
	 */
	async checkDependencies(manifest: PluginManifest): Promise<boolean> {
		// Check core version requirement
		const coreVersion = this.getCoreVersion();
		if (!this.satisfiesVersion(coreVersion, manifest.requires.core)) {
			console.error(
				`Plugin ${manifest.id} requires core ${manifest.requires.core}, but current version is ${coreVersion}`
			);
			return false;
		}

		// Check plugin dependencies
		if (manifest.requires.plugins) {
			const registry = getPluginRegistry();

			for (const [pluginId, requiredVersion] of Object.entries(manifest.requires.plugins)) {
				const dependentPlugin = registry.getPlugin(pluginId);

				if (!dependentPlugin) {
					console.error(`Plugin ${manifest.id} requires ${pluginId}, but it is not installed`);
					return false;
				}

				if (!this.satisfiesVersion(dependentPlugin.manifest.version, requiredVersion)) {
					console.error(
						`Plugin ${manifest.id} requires ${pluginId}@${requiredVersion}, but ${dependentPlugin.manifest.version} is installed`
					);
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Private: Load manifest from file
	 */
	private async loadManifest(manifestPath: string): Promise<PluginManifest> {
		try {
			// Use dynamic import for ESM compatibility
			const module = await import(manifestPath);
			const manifest = module.default || module.manifest;

			if (!manifest) {
				throw new Error('Manifest file does not export a default or named "manifest" export');
			}

			return manifest;
		} catch (error) {
			throw new Error(
				`Failed to load manifest from ${manifestPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Private: Get core version
	 */
	private getCoreVersion(): string {
		// Read from package.json or environment
		// For now, return a hardcoded version
		return '1.0.0';
	}

	/**
	 * Private: Check if version satisfies requirement
	 * Simple implementation - can be replaced with semver library
	 */
	private satisfiesVersion(current: string, required: string): boolean {
		// Remove leading caret/tilde
		const cleanRequired = required.replace(/^[\^~]/, '');

		const [currentMajor, currentMinor, currentPatch] = current.split('.').map(Number);
		const [requiredMajor, requiredMinor, requiredPatch] = cleanRequired.split('.').map(Number);

		// Caret (^) allows changes that do not modify left-most non-zero digit
		if (required.startsWith('^')) {
			if (requiredMajor > 0) {
				return currentMajor === requiredMajor && current >= cleanRequired;
			}
			if (requiredMinor > 0) {
				return currentMajor === 0 && currentMinor === requiredMinor && current >= cleanRequired;
			}
			return current === cleanRequired;
		}

		// Tilde (~) allows patch-level changes
		if (required.startsWith('~')) {
			return (
				currentMajor === requiredMajor && currentMinor === requiredMinor && current >= cleanRequired
			);
		}

		// Exact match
		return current === cleanRequired;
	}
}

/**
 * Export loader instance getter
 */
let loaderInstance: PluginLoader | null = null;

export function getPluginLoader(pluginsDirectory?: string): PluginLoader {
	if (!loaderInstance) {
		loaderInstance = new PluginLoader(pluginsDirectory);
	}
	return loaderInstance;
}

/**
 * Plugin Hooks System
 *
 * Provides a way for plugins to hook into core system events
 */

import type { PluginHooks } from './types';
import { getPluginRegistry } from './registry';

/**
 * Hook execution context
 */
export interface HookContext {
	pluginId: string;
	timestamp: Date;
	data?: any;
}

/**
 * Hook result
 */
export interface HookResult<T = any> {
	pluginId: string;
	success: boolean;
	result?: T;
	error?: Error;
	executionTime: number;
}

/**
 * Hooks Manager
 * Centralized way to execute hooks across all active plugins
 */
export class HooksManager {
	private static instance: HooksManager;

	private constructor() {}

	public static getInstance(): HooksManager {
		if (!HooksManager.instance) {
			HooksManager.instance = new HooksManager();
		}
		return HooksManager.instance;
	}

	/**
	 * Execute a hook across all active plugins
	 * Returns results from all plugins that implement this hook
	 */
	async execute<T>(hookName: keyof PluginHooks, ...args: any[]): Promise<HookResult<T>[]> {
		const registry = getPluginRegistry();
		const results: HookResult<T>[] = [];

		for (const plugin of registry.getActivePlugins()) {
			const hook = plugin.manifest.hooks?.[hookName];

			if (hook && typeof hook === 'function') {
				const startTime = Date.now();

				try {
					const result = await (hook as Function)(...args);
					const executionTime = Date.now() - startTime;

					results.push({
						pluginId: plugin.manifest.id,
						success: true,
						result,
						executionTime
					});
				} catch (error) {
					const executionTime = Date.now() - startTime;

					console.error(`Error executing hook ${hookName} in plugin ${plugin.manifest.id}:`, error);

					results.push({
						pluginId: plugin.manifest.id,
						success: false,
						error: error instanceof Error ? error : new Error('Unknown error'),
						executionTime
					});
				}
			}
		}

		return results;
	}

	/**
	 * Execute a filter hook - each plugin can modify the data
	 * Data is passed through each plugin sequentially
	 */
	async filter<T>(hookName: keyof PluginHooks, initialValue: T, ...args: any[]): Promise<T> {
		const registry = getPluginRegistry();
		let value = initialValue;

		for (const plugin of registry.getActivePlugins()) {
			const hook = plugin.manifest.hooks?.[hookName];

			if (hook && typeof hook === 'function') {
				try {
					const result = await (hook as Function)(value, ...args);
					if (result !== undefined) {
						value = result;
					}
				} catch (error) {
					console.error(
						`Error executing filter hook ${hookName} in plugin ${plugin.manifest.id}:`,
						error
					);
					// Continue with current value
				}
			}
		}

		return value;
	}

	/**
	 * Execute hooks until one returns a truthy value
	 * Useful for "can" or "should" type hooks
	 */
	async until<T>(
		hookName: keyof PluginHooks,
		...args: any[]
	): Promise<{ found: boolean; result?: T; pluginId?: string }> {
		const registry = getPluginRegistry();

		for (const plugin of registry.getActivePlugins()) {
			const hook = plugin.manifest.hooks?.[hookName];

			if (hook && typeof hook === 'function') {
				try {
					const result = await hook(...args);
					if (result) {
						return {
							found: true,
							result,
							pluginId: plugin.manifest.id
						};
					}
				} catch (error) {
					console.error(
						`Error executing until hook ${hookName} in plugin ${plugin.manifest.id}:`,
						error
					);
					// Continue checking other plugins
				}
			}
		}

		return { found: false };
	}

	/**
	 * Check if any active plugin has a specific hook
	 */
	hasHook(hookName: keyof PluginHooks): boolean {
		const registry = getPluginRegistry();

		for (const plugin of registry.getActivePlugins()) {
			const hook = plugin.manifest.hooks?.[hookName];
			if (hook && typeof hook === 'function') {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get all plugins that implement a specific hook
	 */
	getPluginsWithHook(hookName: keyof PluginHooks): string[] {
		const registry = getPluginRegistry();
		const pluginIds: string[] = [];

		for (const plugin of registry.getActivePlugins()) {
			const hook = plugin.manifest.hooks?.[hookName];
			if (hook && typeof hook === 'function') {
				pluginIds.push(plugin.manifest.id);
			}
		}

		return pluginIds;
	}
}

/**
 * Convenience functions for common hook operations
 */

/**
 * Execute a hook and return all results
 */
export async function executeHook<T>(
	hookName: keyof PluginHooks,
	...args: any[]
): Promise<HookResult<T>[]> {
	const manager = HooksManager.getInstance();
	return manager.execute(hookName, ...args);
}

/**
 * Execute a filter hook
 */
export async function filterHook<T>(
	hookName: keyof PluginHooks,
	initialValue: T,
	...args: any[]
): Promise<T> {
	const manager = HooksManager.getInstance();
	return manager.filter(hookName, initialValue, ...args);
}

/**
 * Execute a hook until one returns truthy
 */
export async function untilHook<T>(
	hookName: keyof PluginHooks,
	...args: any[]
): Promise<{ found: boolean; result?: T; pluginId?: string }> {
	const manager = HooksManager.getInstance();
	return manager.until(hookName, ...args);
}

/**
 * Check if any plugin has a hook
 */
export function hasHook(hookName: keyof PluginHooks): boolean {
	const manager = HooksManager.getInstance();
	return manager.hasHook(hookName);
}

/**
 * Get plugins with a specific hook
 */
export function getPluginsWithHook(hookName: keyof PluginHooks): string[] {
	const manager = HooksManager.getInstance();
	return manager.getPluginsWithHook(hookName);
}

/**
 * Export manager instance getter
 */
export function getHooksManager(): HooksManager {
	return HooksManager.getInstance();
}

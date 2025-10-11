/**
 * Plugin System - Public API
 *
 * Main entry point for the LineBasis plugin system
 */

// Types
export type {
	Plugin,
	PluginManifest,
	PluginNavItem,
	PluginRoute,
	PluginPage,
	PluginSetting,
	PluginHooks,
	PluginDependency,
	PluginMetadata,
	PluginInstallOptions,
	IPluginRegistry,
	IPluginLoader
} from './types';

export { PluginError, PluginErrorCode } from './types';

// Registry
export { PluginRegistry, getPluginRegistry } from './registry';

// Loader
export { PluginLoader, getPluginLoader } from './loader';

// Hooks
export {
	HooksManager,
	getHooksManager,
	executeHook,
	filterHook,
	untilHook,
	hasHook,
	getPluginsWithHook
} from './hooks';

export type { HookContext, HookResult } from './hooks';

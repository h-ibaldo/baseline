/**
 * Plugin System Types
 *
 * Core type definitions for the LineBasis plugin architecture
 */

import type { RequestHandler } from '@sveltejs/kit';
import type { ComponentType } from 'svelte';
import type { SitemapEntry } from '$lib/server/services/sitemap';

/**
 * Plugin navigation item
 */
export interface PluginNavItem {
	label: string;
	path: string;
	icon?: string;
	order?: number;
	roles?: string[]; // Which roles can see this nav item
}

/**
 * Plugin route definition
 */
export interface PluginRoute {
	path: string; // e.g., '/api/posts'
	handler: RequestHandler;
	methods?: ('GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT')[];
}

/**
 * Plugin page definition
 */
export interface PluginPage {
	path: string; // e.g., '/admin/posts'
	component: ComponentType;
	requireAuth?: boolean;
	requireRoles?: string[];
}

/**
 * Plugin setting schema
 */
export interface PluginSetting {
	key: string;
	type: 'string' | 'number' | 'boolean' | 'json';
	default: string;
	label?: string;
	description?: string;
	required?: boolean;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
	// Installation hooks
	onInstall?: () => Promise<void>;
	onUninstall?: () => Promise<void>;
	onActivate?: () => Promise<void>;
	onDeactivate?: () => Promise<void>;

	// Content hooks
	beforePagePublish?: (page: any) => Promise<any>;
	afterPagePublish?: (page: any) => Promise<void>;
	beforePageDelete?: (pageId: string) => Promise<void>;
	afterPageDelete?: (pageId: string) => Promise<void>;

	// Admin hooks
	onAdminInit?: () => Promise<void>;
	adminMenuFilter?: (menu: PluginNavItem[]) => PluginNavItem[];

	// User hooks
	afterUserRegister?: (user: any) => Promise<void>;
	beforeUserDelete?: (userId: string) => Promise<void>;

	// SEO hooks
	getSitemapEntries?: () => Promise<SitemapEntry[]>;
}

/**
 * Plugin dependency specification
 */
export interface PluginDependency {
	core: string; // Semantic version of core (e.g., '^1.0.0')
	plugins?: Record<string, string>; // Other plugins and their versions
}

/**
 * Plugin manifest - defines everything about a plugin
 */
export interface PluginManifest {
	// Identity
	id: string; // Unique identifier (e.g., '@linebasis/blog')
	name: string; // Display name
	version: string; // Semantic version
	description: string;
	author: string;
	license?: string;
	homepage?: string;
	repository?: string;

	// Dependencies
	requires: PluginDependency;

	// Database
	prismaSchema?: string; // Path to Prisma schema file (relative to plugin root)
	migrations?: string; // Path to migrations directory

	// Routes
	apiRoutes?: PluginRoute[];
	publicRoutes?: PluginRoute[];

	// Admin UI
	adminPages?: PluginPage[];
	adminNav?: PluginNavItem[];

	// Configuration
	settings?: PluginSetting[];

	// Hooks
	hooks?: PluginHooks;

	// Capabilities (what this plugin provides)
	capabilities?: string[]; // e.g., ['blog', 'comments', 'rss']

	// Permissions required
	permissions?: string[]; // e.g., ['database:write', 'files:write']
}

/**
 * Plugin instance - runtime representation
 */
export interface Plugin {
	manifest: PluginManifest;
	rootPath: string; // Absolute path to plugin directory
	isActive: boolean;
	installedAt: Date;
	settings: Record<string, any>;

	// Plugin initialization
	initialize(): Promise<void>;
	shutdown(): Promise<void>;

	// Route handling
	handleRequest?(event: any): Promise<Response | null>;
}

/**
 * Plugin metadata stored in database
 */
export interface PluginMetadata {
	id: string;
	name: string;
	version: string;
	isActive: boolean;
	settings: string; // JSON
	installedAt: Date;
	updatedAt: Date;
}

/**
 * Plugin installation options
 */
export interface PluginInstallOptions {
	activate?: boolean; // Activate after install (default: true)
	skipDependencyCheck?: boolean; // Skip dependency validation (dangerous)
	runMigrations?: boolean; // Run database migrations (default: true)
}

/**
 * Plugin registry interface
 */
export interface IPluginRegistry {
	// Registration
	register(manifest: PluginManifest, rootPath: string): Promise<void>;
	unregister(pluginId: string): Promise<void>;

	// Activation
	activate(pluginId: string): Promise<void>;
	deactivate(pluginId: string): Promise<void>;

	// Queries
	getPlugin(pluginId: string): Plugin | undefined;
	getAllPlugins(): Plugin[];
	getActivePlugins(): Plugin[];
	isActive(pluginId: string): boolean;

	// Loading
	loadActivePlugins(): Promise<void>;
	reloadPlugin(pluginId: string): Promise<void>;

	// Hooks
	executeHook<T>(hookName: keyof PluginHooks, ...args: any[]): Promise<T[]>;

	// Routes
	matchRoute(path: string): Plugin | null;
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
	constructor(
		message: string,
		public pluginId: string,
		public code: PluginErrorCode
	) {
		super(message);
		this.name = 'PluginError';
	}
}

export enum PluginErrorCode {
	NOT_FOUND = 'PLUGIN_NOT_FOUND',
	ALREADY_INSTALLED = 'PLUGIN_ALREADY_INSTALLED',
	DEPENDENCY_MISSING = 'PLUGIN_DEPENDENCY_MISSING',
	INCOMPATIBLE_VERSION = 'PLUGIN_INCOMPATIBLE_VERSION',
	ACTIVATION_FAILED = 'PLUGIN_ACTIVATION_FAILED',
	DEACTIVATION_FAILED = 'PLUGIN_DEACTIVATION_FAILED',
	INVALID_MANIFEST = 'PLUGIN_INVALID_MANIFEST',
	PERMISSION_DENIED = 'PLUGIN_PERMISSION_DENIED'
}

/**
 * Plugin loader interface
 */
export interface IPluginLoader {
	loadPlugin(pluginPath: string): Promise<Plugin>;
	validateManifest(manifest: PluginManifest): boolean;
	checkDependencies(manifest: PluginManifest): Promise<boolean>;
}

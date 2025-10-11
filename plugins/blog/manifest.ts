/**
 * Blog Plugin Manifest
 *
 * @linebasis/blog - Full-featured blog system for LineBasis
 */

import type { PluginManifest } from '../../src/lib/core/plugins';

export const manifest: PluginManifest = {
	// Identity
	id: '@linebasis/blog',
	name: 'Blog System',
	version: '1.0.0',
	description: 'Full-featured blog with posts, categories, tags, SEO, and RSS feed support',
	author: 'LineBasis Team',
	license: 'MIT',
	homepage: 'https://linebasis.org/plugins/blog',
	repository: 'https://github.com/linebasis/linebasis',

	// Dependencies
	requires: {
		core: '^1.0.0',
		plugins: {} // No dependencies on other plugins
	},

	// Database
	prismaSchema: './prisma/schema.prisma',
	migrations: './prisma/migrations',

	// Admin Navigation
	adminNav: [
		{
			label: 'Posts',
			path: '/admin/posts',
			icon: '📝',
			order: 20,
			roles: ['admin', 'editor', 'author']
		},
		{
			label: 'Categories',
			path: '/admin/categories',
			icon: '📁',
			order: 21,
			roles: ['admin', 'editor']
		},
		{
			label: 'Tags',
			path: '/admin/tags',
			icon: '🏷️',
			order: 22,
			roles: ['admin', 'editor']
		}
	],

	// Settings
	settings: [
		{
			key: 'blog_posts_per_page',
			type: 'number',
			default: '10',
			label: 'Posts per page',
			description: 'Number of posts to display on blog index page',
			required: true
		},
		{
			key: 'blog_allow_comments',
			type: 'boolean',
			default: 'false',
			label: 'Allow comments',
			description: 'Enable commenting on blog posts (requires comment plugin)'
		},
		{
			key: 'blog_show_author',
			type: 'boolean',
			default: 'true',
			label: 'Show author',
			description: 'Display author name on blog posts'
		},
		{
			key: 'blog_show_date',
			type: 'boolean',
			default: 'true',
			label: 'Show publish date',
			description: 'Display publish date on blog posts'
		},
		{
			key: 'blog_excerpt_length',
			type: 'number',
			default: '200',
			label: 'Excerpt length',
			description: 'Number of characters to show in post excerpts'
		},
		{
			key: 'blog_rss_enabled',
			type: 'boolean',
			default: 'true',
			label: 'Enable RSS feed',
			description: 'Generate RSS feed at /blog/feed.xml'
		}
	],

	// Lifecycle Hooks
	hooks: {
		onInstall: async () => {
			console.log('📝 Blog plugin installed');
		},

		onUninstall: async () => {
			console.log('📝 Blog plugin uninstalled');
		},

		onActivate: async () => {
			console.log('📝 Blog plugin activated');
			// Could initialize default categories, sample posts, etc.
		},

		onDeactivate: async () => {
			console.log('📝 Blog plugin deactivated');
		},

		// Admin hooks
		onAdminInit: async () => {
			console.log('📝 Blog admin initialized');
		},

		// Content hooks
		afterPagePublish: async (page) => {
			console.log(`📝 Blog plugin: Page "${page.title}" was published`);
			// Could update related posts, regenerate sitemap, etc.
		}
	},

	// Capabilities this plugin provides
	capabilities: ['blog', 'posts', 'categories', 'tags', 'rss', 'seo'],

	// Permissions required
	permissions: ['database:write', 'files:read', 'api:write']
};

export default manifest;

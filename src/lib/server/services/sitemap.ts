/**
 * Sitemap Service
 *
 * Generates XML sitemaps for SEO
 * Includes published pages and entries from plugins via hooks
 */

import { prisma } from '../db/client';
import { HooksManager } from '$lib/core/plugins/hooks';

export interface SitemapEntry {
	url: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
	_isPluginEntry?: boolean; // Internal flag for tracking
}

/**
 * Get sitemap configuration from settings
 */
async function getSitemapConfig(): Promise<{ baseUrl: string }> {
	const setting = await prisma.setting.findUnique({
		where: { key: 'site_url' }
	});

	const rawUrl = setting?.value || 'http://localhost:5173';
	// Normalize: drop trailing slash to avoid double slashes when composing URLs
	const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
	return { baseUrl };
}

/**
 * Get all published pages for sitemap
 */
async function getPublishedPages(): Promise<SitemapEntry[]> {
	const pages = await prisma.page.findMany({
		where: {
			status: 'published'
		},
		select: {
			slug: true,
			updatedAt: true
		},
		orderBy: {
			updatedAt: 'desc'
		}
	});

	const { baseUrl } = await getSitemapConfig();

	return pages.map((page) => ({
		url: `${baseUrl}/${encodeURI(page.slug)}`,
		lastmod: page.updatedAt.toISOString(),
		changefreq: 'weekly' as const,
		priority: page.slug === 'index' || page.slug === 'home' ? 1.0 : 0.8
	}));
}

/**
 * Normalize plugin-provided URL
 * - If relative, prefix with baseUrl
 * - If absolute, ensure no double slashes and proper encoding
 */
function normalizePluginUrl(url: string, baseUrl: string): string {
	// Relative path: prefix with baseUrl
	if (url.startsWith('/')) {
		return `${baseUrl}${encodeURI(url)}`;
	}

	// Absolute URL: normalize double slashes and encode path
	try {
		const parsed = new URL(url);
		parsed.pathname = encodeURI(decodeURI(parsed.pathname));
		return parsed.toString();
	} catch {
		// Invalid URL: treat as relative
		return `${baseUrl}${encodeURI(url.startsWith('/') ? url : '/' + url)}`;
	}
}

/**
 * Get plugin-provided sitemap entries via hooks
 */
async function getPluginEntries(): Promise<SitemapEntry[]> {
	try {
		const { baseUrl } = await getSitemapConfig();
		const hooks = HooksManager.getInstance();
		const results = await hooks.execute<SitemapEntry[]>('getSitemapEntries');

		// Flatten and filter successful results
		const pluginEntries = results.flatMap((r) =>
			r.success && Array.isArray(r.result) ? r.result : []
		);

		// Normalize URLs and mark as plugin entries
		return pluginEntries.map((entry) => ({
			...entry,
			url: normalizePluginUrl(entry.url, baseUrl),
			_isPluginEntry: true
		}));
	} catch (error) {
		console.error('Error fetching plugin sitemap entries:', error);
		return [];
	}
}

/**
 * Get all sitemap entries
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
	const [pages, pluginEntries] = await Promise.all([getPublishedPages(), getPluginEntries()]);

	const { baseUrl } = await getSitemapConfig();

	// Add homepage
	const homepage: SitemapEntry = {
		url: baseUrl,
		lastmod: new Date().toISOString(),
		changefreq: 'daily',
		priority: 1.0
	};

	return [homepage, ...pages, ...pluginEntries];
}

/**
 * Generate XML sitemap
 */
export async function generateSitemap(): Promise<string> {
	const entries = await getSitemapEntries();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}
  </url>`
	)
	.join('\n')}
</urlset>`;

	return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Get sitemap statistics
 */
export async function getSitemapStats() {
	const entries = await getSitemapEntries();

	// Count using internal flag
	const pluginCount = entries.filter((e) => e._isPluginEntry).length;

	return {
		total: entries.length,
		pages: entries.length - pluginCount,
		pluginEntries: pluginCount,
		lastGenerated: new Date().toISOString()
	};
}

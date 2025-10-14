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
 * Get plugin-provided sitemap entries via hooks
 */
async function getPluginEntries(): Promise<SitemapEntry[]> {
	try {
		const hooks = HooksManager.getInstance();
		const results = await hooks.execute<SitemapEntry[]>('getSitemapEntries');

		// Flatten and filter successful results
		const pluginEntries = results.flatMap((r) =>
			r.success && Array.isArray(r.result) ? r.result : []
		);

		return pluginEntries;
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
	const { baseUrl } = await getSitemapConfig();

	// Count homepage and core pages (not from plugins)
	const coreEntries = entries.filter(
		(e) => e.url === baseUrl || (!e.url.includes('/blog/') && !e.url.match(/\/[a-z-]+\/[^/]+$/))
	);

	return {
		total: entries.length,
		pages: coreEntries.length,
		pluginEntries: entries.length - coreEntries.length,
		lastGenerated: new Date().toISOString()
	};
}

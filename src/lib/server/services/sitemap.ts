/**
 * Sitemap Service
 *
 * Generates XML sitemaps for SEO
 * Includes published pages and blog posts (if blog plugin is active)
 */

import { prisma } from '../db/client';

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

	const baseUrl = setting?.value || 'http://localhost:5173';
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
		url: `${baseUrl}/${page.slug}`,
		lastmod: page.updatedAt.toISOString(),
		changefreq: 'weekly' as const,
		priority: page.slug === 'index' || page.slug === 'home' ? 1.0 : 0.8
	}));
}

/**
 * Get blog posts for sitemap (if blog plugin is active)
 */
async function getBlogPosts(): Promise<SitemapEntry[]> {
	try {
		// Check if blog plugin is active
		const blogPlugin = await prisma.plugin.findUnique({
			where: { id: '@linebasis/blog' }
		});

		if (!blogPlugin || !blogPlugin.isActive) {
			return [];
		}

		// Check if Post model exists (blog plugin schema)
		const posts = await (prisma as any).post?.findMany({
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

		if (!posts) {
			return [];
		}

		const { baseUrl } = await getSitemapConfig();

		return posts.map((post: any) => ({
			url: `${baseUrl}/blog/${post.slug}`,
			lastmod: post.updatedAt.toISOString(),
			changefreq: 'monthly' as const,
			priority: 0.7
		}));
	} catch (error) {
		// Blog plugin not installed or Post model doesn't exist
		console.error('Error fetching blog posts for sitemap:', error);
		return [];
	}
}

/**
 * Get all sitemap entries
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
	const [pages, blogPosts] = await Promise.all([getPublishedPages(), getBlogPosts()]);

	const { baseUrl } = await getSitemapConfig();

	// Add homepage
	const homepage: SitemapEntry = {
		url: baseUrl,
		lastmod: new Date().toISOString(),
		changefreq: 'daily',
		priority: 1.0
	};

	return [homepage, ...pages, ...blogPosts];
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

	return {
		total: entries.length,
		pages: entries.filter((e) => !e.url.includes('/blog/')).length,
		blogPosts: entries.filter((e) => e.url.includes('/blog/')).length,
		lastGenerated: new Date().toISOString()
	};
}

/**
 * Robots.txt Service
 *
 * Generates robots.txt for search engine crawler control
 * Always includes sitemap reference for SEO
 */

import { prisma } from '../db/client';

/**
 * Get robots.txt configuration from settings
 */
async function getRobotsConfig(): Promise<{
	baseUrl: string;
	allowAll: boolean;
	disallowPaths: string[];
	crawlDelay?: number;
}> {
	const [siteUrl, allowAll, disallowPaths, crawlDelay] = await Promise.all([
		prisma.setting.findUnique({ where: { key: 'site_url' } }),
		prisma.setting.findUnique({ where: { key: 'robots_allow_all' } }),
		prisma.setting.findUnique({ where: { key: 'robots_disallow_paths' } }),
		prisma.setting.findUnique({ where: { key: 'robots_crawl_delay' } })
	]);

	// Normalize base URL (remove trailing slash)
	const rawUrl = siteUrl?.value || 'http://localhost:5173';
	const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

	// Parse settings with defaults
	const allow = allowAll?.value === 'true' || allowAll?.value === '1' || allowAll === null;

	let paths: string[] = [];
	if (disallowPaths?.value) {
		try {
			const parsed = JSON.parse(disallowPaths.value);
			if (Array.isArray(parsed)) {
				paths = parsed.filter((p): p is string => typeof p === 'string');
			}
		} catch {
			// Invalid JSON, use empty array
		}
	}

	let delay: number | undefined;
	if (crawlDelay?.value) {
		const parsed = Number(crawlDelay.value);
		if (!isNaN(parsed) && parsed > 0) {
			delay = parsed;
		}
	}

	return {
		baseUrl,
		allowAll: allow,
		disallowPaths: paths,
		crawlDelay: delay
	};
}

/**
 * Generate robots.txt content
 */
export async function generateRobots(): Promise<string> {
	const config = await getRobotsConfig();

	const lines: string[] = ['# robots.txt for LineBasis', '', 'User-agent: *'];

	if (config.allowAll && config.disallowPaths.length === 0) {
		// Allow all crawlers
		lines.push('Disallow:');
	} else {
		// Add custom disallow paths
		if (config.disallowPaths.length > 0) {
			for (const path of config.disallowPaths) {
				lines.push(`Disallow: ${path}`);
			}
		} else {
			// If allowAll is false but no paths specified, block everything
			lines.push('Disallow: /');
		}
	}

	// Add crawl delay if specified
	if (config.crawlDelay !== undefined) {
		lines.push(`Crawl-delay: ${config.crawlDelay}`);
	}

	// Always include sitemap
	lines.push('');
	lines.push(`Sitemap: ${config.baseUrl}/sitemap.xml`);

	return lines.join('\n') + '\n';
}

/**
 * Get robots.txt statistics
 */
export async function getRobotsStats() {
	const config = await getRobotsConfig();

	return {
		allowAll: config.allowAll,
		disallowPathCount: config.disallowPaths.length,
		disallowPaths: config.disallowPaths,
		crawlDelay: config.crawlDelay,
		sitemapUrl: `${config.baseUrl}/sitemap.xml`,
		lastGenerated: new Date().toISOString()
	};
}

/**
 * Sitemap XML Route
 *
 * Publicly accessible sitemap at /sitemap.xml
 * No authentication required (needed for search engines)
 */

import { generateSitemap } from '$lib/server/services/sitemap';

export async function GET() {
	try {
		const xml = await generateSitemap();

		// Weak ETag based on content; sufficient for sitemap cache validation
		const etag = 'W/"' + Buffer.from(xml).toString('base64').slice(0, 16) + '"';

		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
				'ETag': etag
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);

		return new Response('Error generating sitemap', {
			status: 500,
			headers: {
				'Content-Type': 'text/plain'
			}
		});
	}
}

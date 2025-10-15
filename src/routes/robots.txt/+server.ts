/**
 * Robots.txt Public Endpoint
 *
 * Serves robots.txt for search engine crawlers
 * Public endpoint with caching for performance
 */

import type { RequestHandler } from './$types';
import { generateRobots } from '$lib/server/services/robots';
import { createHash } from 'crypto';

export const GET: RequestHandler = async () => {
	try {
		const robots = await generateRobots();

		// Generate weak ETag for cache validation
		const etag = `W/"${createHash('md5').update(robots).digest('hex').slice(0, 16)}"`;

		return new Response(robots, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
				ETag: etag
			}
		});
	} catch (error) {
		console.error('Failed to generate robots.txt:', error);

		// Return minimal safe robots.txt on error
		const fallback = `# robots.txt\n\nUser-agent: *\nDisallow:\n`;

		return new Response(fallback, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=60'
			}
		});
	}
};

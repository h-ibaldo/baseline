/**
 * Published Page SSR
 * 
 * Renders published pages from database
 * Route: /[slug] (e.g., /about-us, /contact)
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPageBySlug } from '$lib/server/services/pages';

export const load: PageServerLoad = async ({ params }) => {
	const page = await getPageBySlug(params.slug);

	if (!page || page.status !== 'published') {
		throw error(404, 'Page not found');
	}

	return {
		page: {
			id: page.id,
			slug: page.slug,
			title: page.title,
			description: page.description,
			html: page.publishedHtml,
			css: page.publishedCss,
			metaTitle: page.metaTitle,
			metaDescription: page.metaDescription,
			metaImage: page.metaImage,
			publishedAt: page.publishedAt?.toISOString()
		}
	};
};


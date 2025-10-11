/**
 * Posts API
 *
 * GET /api/posts - List all posts (requires auth)
 * POST /api/posts - Create new post (requires auth)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPosts, createPost } from '$lib/server/services/posts';
import { requireAuth } from '$lib/server/middleware/auth';

export const GET: RequestHandler = async (event) => {
	// Require authentication
	await requireAuth(event);

	const status = event.url.searchParams.get('status') as
		| 'draft'
		| 'published'
		| 'scheduled'
		| 'archived'
		| null;
	const authorId = event.url.searchParams.get('authorId');
	const categoryId = event.url.searchParams.get('categoryId');
	const tagId = event.url.searchParams.get('tagId');
	const search = event.url.searchParams.get('search');
	const limit = parseInt(event.url.searchParams.get('limit') || '50');
	const offset = parseInt(event.url.searchParams.get('offset') || '0');

	try {
		const result = await getPosts({
			status: status || undefined,
			authorId: authorId || undefined,
			categoryId: categoryId || undefined,
			tagId: tagId || undefined,
			search: search || undefined,
			limit,
			offset
		});

		return json(result);
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch posts' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	// Require authentication
	const user = await requireAuth(event);

	try {
		const data = await event.request.json();

		// Validate required fields
		if (!data.slug || !data.title || !data.content) {
			return json(
				{ error: 'Missing required fields: slug, title, content' },
				{ status: 400 }
			);
		}

		// Create post with authenticated user as author
		const post = await createPost({
			...data,
			authorId: user.id,
			scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined
		});

		return json(post, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create post' },
			{ status: 500 }
		);
	}
};

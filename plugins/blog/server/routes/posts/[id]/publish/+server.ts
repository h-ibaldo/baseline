/**
 * Post Publish API
 *
 * POST /api/posts/[id]/publish - Publish post
 * POST /api/posts/[id]/unpublish - Unpublish post
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPostById, publishPost, unpublishPost } from '$lib/server/services/posts';
import { requireAuth } from '$lib/server/middleware/auth';

export const POST: RequestHandler = async (event) => {
	// Require authentication
	const user = await requireAuth(event);

	const { id } = event.params;

	try {
		// Check if user is author or has editor/admin role
		const existingPost = await getPostById(id);
		if (!existingPost) {
			throw error(404, 'Post not found');
		}

		if (
			existingPost.authorId !== user.id &&
			user.role !== 'admin' &&
			user.role !== 'editor'
		) {
			throw error(403, 'You do not have permission to publish this post');
		}

		const post = await publishPost(id);

		return json({ success: true, post });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to publish post' },
			{ status: 500 }
		);
	}
};

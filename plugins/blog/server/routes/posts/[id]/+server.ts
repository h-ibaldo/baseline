/**
 * Post Detail API
 *
 * GET /api/posts/[id] - Get post by ID
 * PATCH /api/posts/[id] - Update post
 * DELETE /api/posts/[id] - Delete post
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPostById, updatePost, deletePost } from '$lib/server/services/posts';
import { requireAuth } from '$lib/server/middleware/auth';

export const GET: RequestHandler = async (event) => {
	// Require authentication
	await requireAuth(event);

	const { id } = event.params;

	try {
		const post = await getPostById(id);

		if (!post) {
			throw error(404, 'Post not found');
		}

		return json(post);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to fetch post' },
			{ status: 500 }
		);
	}
};

export const PATCH: RequestHandler = async (event) => {
	// Require authentication
	const user = await requireAuth(event);

	const { id } = event.params;

	try {
		const data = await event.request.json();

		// Check if user is author or admin
		const existingPost = await getPostById(id);
		if (!existingPost) {
			throw error(404, 'Post not found');
		}

		if (existingPost.authorId !== user.id && user.role !== 'admin') {
			throw error(403, 'You do not have permission to edit this post');
		}

		// Update post
		const post = await updatePost(id, {
			...data,
			scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined
		});

		return json(post);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to update post' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async (event) => {
	// Require authentication
	const user = await requireAuth(event);

	const { id } = event.params;

	try {
		// Check if user is author or admin
		const existingPost = await getPostById(id);
		if (!existingPost) {
			throw error(404, 'Post not found');
		}

		if (existingPost.authorId !== user.id && user.role !== 'admin') {
			throw error(403, 'You do not have permission to delete this post');
		}

		await deletePost(id);

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Failed to delete post' },
			{ status: 500 }
		);
	}
};

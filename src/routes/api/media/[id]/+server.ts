/**
 * GET /api/media/:id - Get single media
 * PUT /api/media/:id - Update media metadata
 * DELETE /api/media/:id - Delete media
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware/auth';
import { getMediaById, updateMedia, deleteMedia } from '$lib/server/services/media';

export const GET: RequestHandler = requireAuth(async ({ params, locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	const media = await getMediaById(params.id, user.teamId);

	if (!media) {
		return json({ error: 'Media not found' }, { status: 404 });
	}

	return json({ media });
});

export const PUT: RequestHandler = requireAuth(async ({ params, request, locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	const { altText, filename } = await request.json();

	const result = await updateMedia(params.id, user.teamId, { altText, filename });

	if ('error' in result) {
		return json({ error: result.error }, { status: 404 });
	}

	return json({ media: result.media });
});

export const DELETE: RequestHandler = requireAuth(async ({ params, locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	const result = await deleteMedia(params.id, user.teamId);

	if ('error' in result) {
		return json({ error: result.error }, { status: 404 });
	}

	return json({ success: true });
});

/**
 * Media API
 *
 * GET /api/media - List media files
 * DELETE /api/media - Delete media file
 */

import { json, error } from '@sveltejs/kit';
import { requireAuth, requireOwnershipOrAdmin } from '$lib/server/middleware/auth';
import { getMedia } from '$lib/server/services/media';
import { deleteFile } from '$lib/server/services/upload';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	await requireAuth(event);

	const type = event.url.searchParams.get('type') || undefined;
	const limit = parseInt(event.url.searchParams.get('limit') || '50');
	const offset = parseInt(event.url.searchParams.get('offset') || '0');

	try {
		const result = await getMedia({ type, limit, offset });
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch media';
		throw error(500, message);
	}
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireAuth(event);

	try {
		const { id } = await event.request.json();

		if (!id) {
			throw error(400, 'Media ID is required');
		}

		// Get media to check ownership
		const media = await getMedia({ limit: 1, offset: 0 });
		const mediaItem = media.media.find((m) => m.id === id);

		if (!mediaItem) {
			throw error(404, 'Media not found');
		}

		// Check ownership or admin
		await requireOwnershipOrAdmin(event, mediaItem.uploadedBy);

		// Delete file
		await deleteFile(id);

		return json({ success: true });
	} catch (err) {
		if (err instanceof Response) throw err;
		const message = err instanceof Error ? err.message : 'Failed to delete media';
		throw error(500, message);
	}
};

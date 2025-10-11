/**
 * POST /api/media/upload
 * Upload a media file
 */

import { json, error } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import { uploadFile } from '$lib/server/services/upload';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const user = await requireAuth(event);

	try {
		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		const altText = formData.get('altText') as string | null;
		const caption = formData.get('caption') as string | null;
		const optimize = formData.get('optimize') !== 'false';

		if (!file) {
			throw error(400, 'No file provided');
		}

		const result = await uploadFile(file, user.id, {
			altText: altText || undefined,
			caption: caption || undefined,
			optimize
		});

		return json(result, { status: 201 });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Upload failed';
		throw error(500, message);
	}
};

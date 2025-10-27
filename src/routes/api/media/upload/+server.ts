/**
 * POST /api/media/upload - Upload media file
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware/auth';
import { uploadMedia } from '$lib/server/services/media';

export const POST: RequestHandler = requireAuth(async ({ request, locals }) => {
	const user = locals.user;

	if (!user.teamId) {
		return json({ error: 'User must belong to a team' }, { status: 403 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const altText = formData.get('altText') as string | undefined;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		const result = await uploadMedia({
			file,
			userId: user.id,
			teamId: user.teamId,
			altText
		});

		if ('error' in result) {
			return json({ error: result.error }, { status: 400 });
		}

		return json({ media: result.media }, { status: 201 });
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
});

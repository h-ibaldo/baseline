/**
 * Draft Autosave API
 * POST /api/pages/[id]/autosave - Autosave draft content
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import * as draftsService from '$lib/server/services/drafts';

/**
 * POST /api/pages/[id]/autosave
 * Autosave draft content for a page
 */
export const POST: RequestHandler = requireAuth(async ({ params, request, locals }) => {
	try {
		if (!params.id) {
			return json({ error: 'Page ID is required' }, { status: 400 });
		}

		const { draftContent } = await request.json();

		if (!draftContent) {
			return json({ error: 'Draft content is required' }, { status: 400 });
		}

		// Verify the user owns this page
		const draft = await draftsService.getDraft(params.id);

		// Check ownership (author or admin can autosave)
		if (draft.id !== params.id) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		const result = await draftsService.autosaveDraft(params.id, { draftContent });

		return json({
			success: true,
			lastSavedAt: result.lastSavedAt,
			hasUnsavedChanges: result.hasUnsavedChanges
		});
	} catch (error) {
		console.error('Autosave failed:', error);
		return json(
			{ error: 'Failed to autosave draft', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
});

/**
 * GET /api/pages/[id]/autosave
 * Get draft content for a page
 */
export const GET: RequestHandler = requireAuth(async ({ params, locals }) => {
	try {
		if (!params.id) {
			return json({ error: 'Page ID is required' }, { status: 400 });
		}

		const draft = await draftsService.getDraft(params.id);

		return json({
			draftContent: draft.draftContent,
			designEvents: draft.designEvents,
			lastSavedAt: draft.lastSavedAt,
			hasUnsavedChanges: draft.hasUnsavedChanges
		});
	} catch (error) {
		console.error('Failed to get draft:', error);
		return json(
			{ error: 'Failed to get draft', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
});

/**
 * DELETE /api/pages/[id]/autosave
 * Clear draft content (discard changes)
 */
export const DELETE: RequestHandler = requireAuth(async ({ params, locals }) => {
	try {
		if (!params.id) {
			return json({ error: 'Page ID is required' }, { status: 400 });
		}

		await draftsService.clearDraft(params.id);

		return json({ success: true });
	} catch (error) {
		console.error('Failed to clear draft:', error);
		return json(
			{ error: 'Failed to clear draft', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
});

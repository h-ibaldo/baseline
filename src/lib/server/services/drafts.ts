/**
 * Draft Autosave Service
 * Handles autosave operations for page drafts
 */

import { db } from '$lib/server/db/client';

export interface AutosaveData {
	draftContent: string; // JSON string of design events
}

/**
 * Autosave draft content for a page
 * Non-blocking operation for smooth UX
 */
export async function autosaveDraft(pageId: string, data: AutosaveData) {
	return await db.page.update({
		where: { id: pageId },
		data: {
			draftContent: data.draftContent,
			lastSavedAt: new Date(),
			hasUnsavedChanges: false
		},
		select: {
			id: true,
			lastSavedAt: true,
			hasUnsavedChanges: true
		}
	});
}

/**
 * Get draft content for a page
 */
export async function getDraft(pageId: string) {
	const page = await db.page.findUnique({
		where: { id: pageId },
		select: {
			id: true,
			draftContent: true,
			designEvents: true,
			lastSavedAt: true,
			hasUnsavedChanges: true
		}
	});

	if (!page) {
		throw new Error('Page not found');
	}

	return page;
}

/**
 * Clear draft content (after publish or discard)
 */
export async function clearDraft(pageId: string) {
	return await db.page.update({
		where: { id: pageId },
		data: {
			draftContent: null,
			hasUnsavedChanges: false
		},
		select: {
			id: true,
			hasUnsavedChanges: true
		}
	});
}

/**
 * Mark page as having unsaved changes
 */
export async function markUnsaved(pageId: string) {
	return await db.page.update({
		where: { id: pageId },
		data: {
			hasUnsavedChanges: true
		},
		select: {
			id: true,
			hasUnsavedChanges: true
		}
	});
}

/**
 * Get all pages with unsaved drafts for a user
 */
export async function getUnsavedDrafts(userId: string) {
	return await db.page.findMany({
		where: {
			authorId: userId,
			hasUnsavedChanges: true
		},
		select: {
			id: true,
			slug: true,
			title: true,
			lastSavedAt: true,
			updatedAt: true
		},
		orderBy: {
			lastSavedAt: 'desc'
		}
	});
}

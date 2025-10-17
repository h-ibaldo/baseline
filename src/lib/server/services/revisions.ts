/**
 * Page Revisions Service
 * Manages version history for pages
 */

import { db } from '$lib/server/db/client';

export interface CreateRevisionData {
	pageId: string;
	title?: string;
	designEvents: string;
	metadata?: string;
	createdBy: string;
}

/**
 * Create a new page revision
 */
export async function createRevision(data: CreateRevisionData) {
	// Get the next version number
	const latestRevision = await db.pageRevision.findFirst({
		where: { pageId: data.pageId },
		orderBy: { version: 'desc' },
		select: { version: true }
	});

	const nextVersion = (latestRevision?.version || 0) + 1;

	return await db.pageRevision.create({
		data: {
			pageId: data.pageId,
			version: nextVersion,
			title: data.title,
			designEvents: data.designEvents,
			metadata: data.metadata,
			createdBy: data.createdBy
		},
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});
}

/**
 * Get all revisions for a page
 */
export async function getPageRevisions(pageId: string) {
	return await db.pageRevision.findMany({
		where: { pageId },
		orderBy: { version: 'desc' },
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});
}

/**
 * Get a specific revision by ID
 */
export async function getRevisionById(id: string) {
	const revision = await db.pageRevision.findUnique({
		where: { id },
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});

	if (!revision) {
		throw new Error('Revision not found');
	}

	return revision;
}

/**
 * Get a specific version of a page
 */
export async function getRevisionByVersion(pageId: string, version: number) {
	const revision = await db.pageRevision.findFirst({
		where: {
			pageId,
			version
		},
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});

	if (!revision) {
		throw new Error('Revision not found');
	}

	return revision;
}

/**
 * Delete a revision
 */
export async function deleteRevision(id: string) {
	return await db.pageRevision.delete({
		where: { id }
	});
}

/**
 * Delete all revisions for a page (used when deleting page)
 */
export async function deletePageRevisions(pageId: string) {
	return await db.pageRevision.deleteMany({
		where: { pageId }
	});
}

/**
 * Get revision count for a page
 */
export async function getRevisionCount(pageId: string): Promise<number> {
	return await db.pageRevision.count({
		where: { pageId }
	});
}

/**
 * Get latest revision for a page
 */
export async function getLatestRevision(pageId: string) {
	return await db.pageRevision.findFirst({
		where: { pageId },
		orderBy: { version: 'desc' },
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});
}

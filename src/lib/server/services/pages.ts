/**
 * Page Service
 * 
 * CRUD operations for pages in the CMS
 * Server-side only
 */

import { prisma } from '../db/client';
import type { Page, Prisma } from '@prisma/client';

export type PageStatus = 'draft' | 'published' | 'archived';

export interface CreatePageInput {
	slug: string;
	title: string;
	description?: string;
	designEvents: string; // JSON string
	authorId: string;
	metaTitle?: string;
	metaDescription?: string;
}

export interface UpdatePageInput {
	slug?: string;
	title?: string;
	description?: string;
	designEvents?: string;
	designState?: string;
	status?: PageStatus;
	metaTitle?: string;
	metaDescription?: string;
	metaImage?: string;
}

export interface PublishPageInput {
	html: string;
	css: string;
	js?: string;
}

/**
 * Create a new page
 */
export async function createPage(data: CreatePageInput): Promise<Page> {
	return prisma.page.create({
		data: {
			...data,
			status: 'draft'
		}
	});
}

/**
 * Get page by ID
 */
export async function getPageById(id: string): Promise<Page | null> {
	return prisma.page.findUnique({
		where: { id },
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true
				}
			}
		}
	});
}

/**
 * Get page by slug
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
	return prisma.page.findUnique({
		where: { slug },
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true
				}
			}
		}
	});
}

/**
 * Get all pages with optional filtering
 */
export async function getPages(options?: {
	status?: PageStatus;
	authorId?: string;
	limit?: number;
	offset?: number;
}): Promise<{ pages: Page[]; total: number }> {
	const where: Prisma.PageWhereInput = {};

	if (options?.status) {
		where.status = options.status;
	}

	if (options?.authorId) {
		where.authorId = options.authorId;
	}

	const [pages, total] = await Promise.all([
		prisma.page.findMany({
			where,
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true
					}
				}
			},
			orderBy: { updatedAt: 'desc' },
			take: options?.limit,
			skip: options?.offset
		}),
		prisma.page.count({ where })
	]);

	return { pages, total };
}

/**
 * Get published pages only
 */
export async function getPublishedPages(): Promise<Page[]> {
	return prisma.page.findMany({
		where: { status: 'published' },
		orderBy: { publishedAt: 'desc' }
	});
}

/**
 * Update page
 */
export async function updatePage(id: string, data: UpdatePageInput): Promise<Page> {
	return prisma.page.update({
		where: { id },
		data
	});
}

/**
 * Publish page
 * Updates status and stores generated HTML/CSS
 */
export async function publishPage(id: string, publishData: PublishPageInput): Promise<Page> {
	return prisma.page.update({
		where: { id },
		data: {
			status: 'published',
			publishedHtml: publishData.html,
			publishedCss: publishData.css,
			publishedJs: publishData.js,
			publishedAt: new Date()
		}
	});
}

/**
 * Unpublish page
 */
export async function unpublishPage(id: string): Promise<Page> {
	return prisma.page.update({
		where: { id },
		data: {
			status: 'draft'
		}
	});
}

/**
 * Delete page
 */
export async function deletePage(id: string): Promise<void> {
	await prisma.page.delete({
		where: { id }
	});
}

/**
 * Create page revision
 * Saves current state as a revision for version history
 */
export async function createPageRevision(
	pageId: string,
	designEvents: string,
	createdBy: string
): Promise<void> {
	await prisma.pageRevision.create({
		data: {
			pageId,
			designEvents,
			createdBy
		}
	});
}

/**
 * Get page revisions
 */
export async function getPageRevisions(pageId: string): Promise<any[]> {
	return prisma.pageRevision.findMany({
		where: { pageId },
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Search pages by title or description
 */
export async function searchPages(query: string): Promise<Page[]> {
	return prisma.page.findMany({
		where: {
			OR: [
				{ title: { contains: query, mode: 'insensitive' } },
				{ description: { contains: query, mode: 'insensitive' } }
			]
		},
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		},
		orderBy: { updatedAt: 'desc' }
	});
}


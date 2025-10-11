/**
 * Tags Service
 *
 * CRUD operations for blog tags
 * Server-side only
 */

import { prisma } from '$lib/server/db/client';
import type { Tag } from '@prisma/client';

export interface CreateTagInput {
	slug: string;
	name: string;
}

export interface UpdateTagInput {
	slug?: string;
	name?: string;
}

/**
 * Create tag
 */
export async function createTag(data: CreateTagInput): Promise<Tag> {
	return db.tag.create({
		data
	});
}

/**
 * Get tag by ID
 */
export async function getTagById(id: string) {
	return db.tag.findUnique({
		where: { id },
		include: {
			posts: {
				include: {
					post: {
						select: {
							id: true,
							slug: true,
							title: true,
							status: true
						}
					}
				}
			}
		}
	});
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string) {
	return db.tag.findUnique({
		where: { slug },
		include: {
			posts: {
				include: {
					post: {
						select: {
							id: true,
							slug: true,
							title: true,
							excerpt: true,
							status: true,
							publishedAt: true
						}
					}
				},
				where: {
					post: {
						status: 'published'
					}
				}
			}
		}
	});
}

/**
 * Get all tags
 */
export async function getTags(options?: { includeEmpty?: boolean }) {
	const tags = await db.tag.findMany({
		include: {
			posts: {
				include: {
					post: {
						select: {
							id: true,
							status: true
						}
					}
				}
			}
		},
		orderBy: { name: 'asc' }
	});

	// Filter out empty tags if requested
	if (!options?.includeEmpty) {
		return tags.filter((tag) => tag.posts.length > 0);
	}

	return tags;
}

/**
 * Update tag
 */
export async function updateTag(id: string, data: UpdateTagInput): Promise<Tag> {
	return db.tag.update({
		where: { id },
		data
	});
}

/**
 * Delete tag
 */
export async function deleteTag(id: string): Promise<void> {
	await db.tag.delete({
		where: { id }
	});
}

/**
 * Get popular tags (by post count)
 */
export async function getPopularTags(limit: number = 10) {
	const tags = await db.tag.findMany({
		include: {
			posts: {
				where: {
					post: {
						status: 'published'
					}
				}
			}
		}
	});

	// Sort by post count
	const sortedTags = tags
		.map((tag) => ({
			...tag,
			postCount: tag.posts.length
		}))
		.filter((tag) => tag.postCount > 0)
		.sort((a, b) => b.postCount - a.postCount)
		.slice(0, limit);

	return sortedTags;
}

/**
 * Search tags by name
 */
export async function searchTags(query: string) {
	return db.tag.findMany({
		where: {
			name: {
				contains: query,
				mode: 'insensitive'
			}
		},
		orderBy: { name: 'asc' },
		take: 20
	});
}

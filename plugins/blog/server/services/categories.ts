/**
 * Categories Service
 *
 * CRUD operations for blog categories
 * Server-side only
 */

import { prisma } from '$lib/server/db/client';
import type { Category } from '@prisma/client';

export interface CreateCategoryInput {
	slug: string;
	name: string;
	description?: string;
	parentId?: string;
	metaTitle?: string;
	metaDescription?: string;
}

export interface UpdateCategoryInput {
	slug?: string;
	name?: string;
	description?: string;
	parentId?: string;
	metaTitle?: string;
	metaDescription?: string;
}

/**
 * Create category
 */
export async function createCategory(data: CreateCategoryInput): Promise<Category> {
	return prisma.category.create({
		data
	});
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
	return db.category.findUnique({
		where: { id },
		include: {
			parent: true,
			children: true,
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
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
	return db.category.findUnique({
		where: { slug },
		include: {
			parent: true,
			children: true,
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
 * Get all categories
 */
export async function getCategories(options?: {
	parentId?: string;
	includeEmpty?: boolean;
}) {
	const where: any = {};

	if (options?.parentId !== undefined) {
		where.parentId = options.parentId;
	}

	const categories = await db.category.findMany({
		where,
		include: {
			parent: true,
			children: true,
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

	// Filter out empty categories if requested
	if (!options?.includeEmpty) {
		return categories.filter((cat) => cat.posts.length > 0);
	}

	return categories;
}

/**
 * Update category
 */
export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
	return db.category.update({
		where: { id },
		data
	});
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<void> {
	await db.category.delete({
		where: { id }
	});
}

/**
 * Get category hierarchy (tree structure)
 */
export async function getCategoryTree() {
	const rootCategories = await db.category.findMany({
		where: { parentId: null },
		include: {
			children: {
				include: {
					children: true,
					posts: true
				}
			},
			posts: true
		},
		orderBy: { name: 'asc' }
	});

	return rootCategories;
}

/**
 * Posts Service
 *
 * CRUD operations for blog posts
 * Server-side only
 */

import { prisma } from '$lib/server/db/client';
import type { Post } from '@prisma/client';

export interface CreatePostInput {
	slug: string;
	title: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	status?: 'draft' | 'published' | 'scheduled' | 'archived';
	authorId: string;
	metaTitle?: string;
	metaDescription?: string;
	metaImage?: string;
	scheduledFor?: Date;
	categoryIds?: string[];
	tagIds?: string[];
}

export interface UpdatePostInput {
	slug?: string;
	title?: string;
	excerpt?: string;
	content?: string;
	featuredImage?: string;
	status?: 'draft' | 'published' | 'scheduled' | 'archived';
	metaTitle?: string;
	metaDescription?: string;
	metaImage?: string;
	scheduledFor?: Date;
	categoryIds?: string[];
	tagIds?: string[];
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostInput): Promise<Post> {
	const { categoryIds, tagIds, ...postData } = data;

	const post = await db.post.create({
		data: {
			...postData,
			publishedAt: data.status === 'published' ? new Date() : null,
			categories: categoryIds
				? {
						create: categoryIds.map((categoryId) => ({
							category: { connect: { id: categoryId } }
						}))
					}
				: undefined,
			tags: tagIds
				? {
						create: tagIds.map((tagId) => ({
							tag: { connect: { id: tagId } }
						}))
					}
				: undefined
		}
	});

	return post;
}

/**
 * Get post by ID
 */
export async function getPostById(id: string) {
	return db.post.findUnique({
		where: { id },
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					avatarUrl: true
				}
			},
			categories: {
				include: {
					category: true
				}
			},
			tags: {
				include: {
					tag: true
				}
			}
		}
	});
}

/**
 * Get post by slug
 */
export async function getPostBySlug(slug: string) {
	return db.post.findUnique({
		where: { slug },
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true,
					avatarUrl: true
				}
			},
			categories: {
				include: {
					category: true
				}
			},
			tags: {
				include: {
					tag: true
				}
			}
		}
	});
}

/**
 * Get all posts with filtering
 */
export async function getPosts(options?: {
	status?: 'draft' | 'published' | 'scheduled' | 'archived';
	authorId?: string;
	categoryId?: string;
	tagId?: string;
	search?: string;
	limit?: number;
	offset?: number;
}) {
	const where: any = {};

	if (options?.status) {
		where.status = options.status;
	}

	if (options?.authorId) {
		where.authorId = options.authorId;
	}

	if (options?.categoryId) {
		where.categories = {
			some: {
				categoryId: options.categoryId
			}
		};
	}

	if (options?.tagId) {
		where.tags = {
			some: {
				tagId: options.tagId
			}
		};
	}

	if (options?.search) {
		where.OR = [
			{ title: { contains: options.search, mode: 'insensitive' } },
			{ excerpt: { contains: options.search, mode: 'insensitive' } },
			{ content: { contains: options.search, mode: 'insensitive' } }
		];
	}

	const [posts, total] = await Promise.all([
		db.post.findMany({
			where,
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				},
				categories: {
					include: {
						category: true
					}
				},
				tags: {
					include: {
						tag: true
					}
				}
			},
			orderBy: { createdAt: 'desc' },
			take: options?.limit,
			skip: options?.offset
		}),
		db.post.count({ where })
	]);

	return { posts, total };
}

/**
 * Update post
 */
export async function updatePost(id: string, data: UpdatePostInput): Promise<Post> {
	const { categoryIds, tagIds, ...postData } = data;

	// If status changed to published, set publishedAt
	if (data.status === 'published') {
		const existingPost = await db.post.findUnique({ where: { id } });
		if (existingPost && existingPost.status !== 'published') {
			(postData as any).publishedAt = new Date();
		}
	}

	// Update post with categories and tags
	const post = await db.post.update({
		where: { id },
		data: {
			...postData,
			categories: categoryIds
				? {
						deleteMany: {},
						create: categoryIds.map((categoryId) => ({
							category: { connect: { id: categoryId } }
						}))
					}
				: undefined,
			tags: tagIds
				? {
						deleteMany: {},
						create: tagIds.map((tagId) => ({
							tag: { connect: { id: tagId } }
						}))
					}
				: undefined
		}
	});

	return post;
}

/**
 * Delete post
 */
export async function deletePost(id: string): Promise<void> {
	await db.post.delete({
		where: { id }
	});
}

/**
 * Publish post
 */
export async function publishPost(id: string): Promise<Post> {
	return db.post.update({
		where: { id },
		data: {
			status: 'published',
			publishedAt: new Date()
		}
	});
}

/**
 * Unpublish post
 */
export async function unpublishPost(id: string): Promise<Post> {
	return db.post.update({
		where: { id },
		data: {
			status: 'draft',
			publishedAt: null
		}
	});
}

/**
 * Get published posts for public display
 */
export async function getPublishedPosts(options?: {
	categorySlug?: string;
	tagSlug?: string;
	limit?: number;
	offset?: number;
}) {
	const where: any = {
		status: 'published',
		publishedAt: { lte: new Date() }
	};

	if (options?.categorySlug) {
		where.categories = {
			some: {
				category: {
					slug: options.categorySlug
				}
			}
		};
	}

	if (options?.tagSlug) {
		where.tags = {
			some: {
				tag: {
					slug: options.tagSlug
				}
			}
		};
	}

	const [posts, total] = await Promise.all([
		db.post.findMany({
			where,
			include: {
				author: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				categories: {
					include: {
						category: {
							select: {
								id: true,
								slug: true,
								name: true
							}
						}
					}
				},
				tags: {
					include: {
						tag: {
							select: {
								id: true,
								slug: true,
								name: true
							}
						}
					}
				}
			},
			orderBy: { publishedAt: 'desc' },
			take: options?.limit,
			skip: options?.offset
		}),
		db.post.count({ where })
	]);

	return { posts, total };
}

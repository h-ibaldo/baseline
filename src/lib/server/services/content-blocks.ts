/**
 * Content Blocks Service
 * CRUD operations for reusable content blocks
 */

import { prisma } from '../db/client';
import type { ContentBlock } from '@prisma/client';

export interface CreateBlockData {
	name: string;
	description?: string;
	category?: string;
	content: string;
	properties?: string;
	thumbnail?: string;
	isPublic?: boolean;
	createdBy: string;
}

export interface UpdateBlockData {
	name?: string;
	description?: string;
	category?: string;
	content?: string;
	properties?: string;
	thumbnail?: string;
	isPublic?: boolean;
}

/**
 * Get all content blocks (public + user's private)
 */
export async function getAllBlocks(userId: string): Promise<ContentBlock[]> {
	return prisma.contentBlock.findMany({
		where: {
			OR: [{ isPublic: true }, { createdBy: userId }]
		},
		include: {
			creator: {
				select: { name: true, email: true }
			}
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Get block by ID
 */
export async function getBlockById(id: string): Promise<ContentBlock | null> {
	return prisma.contentBlock.findUnique({
		where: { id },
		include: {
			creator: {
				select: { name: true, email: true }
			}
		}
	});
}

/**
 * Get blocks by category
 */
export async function getBlocksByCategory(category: string, userId: string): Promise<ContentBlock[]> {
	return prisma.contentBlock.findMany({
		where: {
			category,
			OR: [{ isPublic: true }, { createdBy: userId }]
		},
		include: {
			creator: {
				select: { name: true, email: true }
			}
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Create new content block
 */
export async function createBlock(data: CreateBlockData): Promise<ContentBlock> {
	return prisma.contentBlock.create({
		data: {
			name: data.name,
			description: data.description,
			category: data.category || 'custom',
			content: data.content,
			properties: data.properties,
			thumbnail: data.thumbnail,
			isPublic: data.isPublic || false,
			createdBy: data.createdBy
		}
	});
}

/**
 * Update content block
 */
export async function updateBlock(id: string, data: UpdateBlockData): Promise<ContentBlock> {
	const updateData: any = {};

	if (data.name !== undefined) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.category !== undefined) updateData.category = data.category;
	if (data.content !== undefined) {
		updateData.content = data.content;
		updateData.version = { increment: 1 };
	}
	if (data.properties !== undefined) updateData.properties = data.properties;
	if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
	if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

	return prisma.contentBlock.update({
		where: { id },
		data: updateData
	});
}

/**
 * Delete content block
 */
export async function deleteBlock(id: string): Promise<ContentBlock> {
	return prisma.contentBlock.delete({
		where: { id }
	});
}

/**
 * Increment usage count
 */
export async function incrementUsage(id: string): Promise<void> {
	await prisma.contentBlock.update({
		where: { id },
		data: { usageCount: { increment: 1 } }
	});
}

/**
 * Get block statistics
 */
export async function getBlockStats(userId: string) {
	const [total, byCategory, myBlocks] = await Promise.all([
		prisma.contentBlock.count({
			where: { OR: [{ isPublic: true }, { createdBy: userId }] }
		}),
		prisma.contentBlock.groupBy({
			by: ['category'],
			where: { OR: [{ isPublic: true }, { createdBy: userId }] },
			_count: true
		}),
		prisma.contentBlock.count({
			where: { createdBy: userId }
		})
	]);

	return {
		total,
		myBlocks,
		byCategory: byCategory.reduce((acc: Record<string, number>, item) => {
			acc[item.category || 'custom'] = item._count;
			return acc;
		}, {})
	};
}

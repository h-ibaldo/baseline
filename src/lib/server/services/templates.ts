/**
 * Templates Service
 * CRUD operations for page templates
 */

import { prisma } from '../db/client';
import type { Template } from '@prisma/client';

export interface CreateTemplateData {
	name: string;
	description?: string;
	category?: string;
	content: string;
	thumbnail?: string;
	createdBy: string;
}

export interface UpdateTemplateData {
	name?: string;
	description?: string;
	category?: string;
	content?: string;
	thumbnail?: string;
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<Template[]> {
	return prisma.template.findMany({
		include: {
			creator: {
				select: { name: true, email: true }
			}
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string): Promise<Template | null> {
	return prisma.template.findUnique({
		where: { id },
		include: {
			creator: {
				select: { name: true, email: true }
			}
		}
	});
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: string): Promise<Template[]> {
	return prisma.template.findMany({
		where: { category },
		include: {
			creator: {
				select: { name: true, email: true }
			}
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Create new template
 */
export async function createTemplate(data: CreateTemplateData): Promise<Template> {
	return prisma.template.create({
		data: {
			name: data.name,
			description: data.description,
			category: data.category || 'general',
			content: data.content,
			thumbnail: data.thumbnail,
			createdBy: data.createdBy
		}
	});
}

/**
 * Update template
 */
export async function updateTemplate(id: string, data: UpdateTemplateData): Promise<Template> {
	const updateData: any = {};

	if (data.name !== undefined) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.category !== undefined) updateData.category = data.category;
	if (data.content !== undefined) {
		updateData.content = data.content;
		// Increment version when content changes
		updateData.version = { increment: 1 };
	}
	if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;

	return prisma.template.update({
		where: { id },
		data: updateData
	});
}

/**
 * Delete template
 */
export async function deleteTemplate(id: string): Promise<Template> {
	return prisma.template.delete({
		where: { id }
	});
}

/**
 * Get template statistics
 */
export async function getTemplateStats() {
	const [total, byCategory] = await Promise.all([
		prisma.template.count(),
		prisma.template.groupBy({
			by: ['category'],
			_count: true
		})
	]);

	return {
		total,
		byCategory: byCategory.reduce((acc: Record<string, number>, item) => {
			acc[item.category || 'general'] = item._count;
			return acc;
		}, {})
	};
}

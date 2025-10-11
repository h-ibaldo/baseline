/**
 * Media Service
 * 
 * CRUD operations for media library
 * Server-side only
 */

import { prisma } from '../db/client';
import type { Media } from '@prisma/client';

export interface CreateMediaInput {
	filename: string;
	path: string;
	url: string;
	mimeType: string;
	size: number;
	width?: number;
	height?: number;
	altText?: string;
	caption?: string;
	uploadedBy: string;
}

export interface UpdateMediaInput {
	filename?: string;
	altText?: string;
	caption?: string;
}

/**
 * Create media entry
 */
export async function createMedia(data: CreateMediaInput): Promise<Media> {
	return prisma.media.create({
		data
	});
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string): Promise<Media | null> {
	return prisma.media.findUnique({
		where: { id },
		include: {
			uploader: {
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
 * Get all media with optional filtering
 */
export async function getMedia(options?: {
	mimeType?: string;
	uploadedBy?: string;
	limit?: number;
	offset?: number;
}): Promise<{ media: Media[]; total: number }> {
	const where: any = {};

	if (options?.mimeType) {
		where.mimeType = { startsWith: options.mimeType };
	}

	if (options?.uploadedBy) {
		where.uploadedBy = options.uploadedBy;
	}

	const result = await Promise.all([
		prisma.media.findMany({
			where,
			include: {
				uploader: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: { createdAt: 'desc' },
			take: options?.limit,
			skip: options?.offset
		}),
		prisma.media.count({ where })
	});

	return { media: result[0], total: result[1] };
}

/**
 * Get media by type (images, videos, etc.)
 */
export async function getMediaByType(type: 'image' | 'video' | 'audio' | 'document'): Promise<Media[]> {
	const mimeTypePrefixes = {
		image: 'image/',
		video: 'video/',
		audio: 'audio/',
		document: ['application/pdf', 'application/msword', 'application/vnd']
	};

	const prefix = mimeTypePrefixes[type];

	if (Array.isArray(prefix)) {
		return prisma.media.findMany({
			where: {
				OR: prefix.map((p) => ({ mimeType: { startsWith: p } }))
			},
			orderBy: { createdAt: 'desc' }
		});
	}

	return prisma.media.findMany({
		where: {
			mimeType: { startsWith: prefix }
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Update media metadata
 */
export async function updateMedia(id: string, data: UpdateMediaInput): Promise<Media> {
	return prisma.media.update({
		where: { id },
		data
	});
}

/**
 * Delete media
 */
export async function deleteMedia(id: string): Promise<void> {
	await prisma.media.delete({
		where: { id }
	});
}

/**
 * Search media by filename or alt text
 */
export async function searchMedia(query: string): Promise<Media[]> {
	return prisma.media.findMany({
		where: {
			OR: [
				{ filename: { contains: query, mode: 'insensitive' } },
				{ altText: { contains: query, mode: 'insensitive' } },
				{ caption: { contains: query, mode: 'insensitive' } }
			]
		},
		include: {
			uploader: {
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
 * Get total media size for a user
 */
export async function getUserMediaSize(userId: string): Promise<number> {
	const result = await prisma.media.aggregate({
		where: { uploadedBy: userId },
		_sum: { size: true }
	});

	return result._sum.size || 0;
}

/**
 * Get total media count for a user
 */
export async function getUserMediaCount(userId: string): Promise<number> {
	return prisma.media.count({
		where: { uploadedBy: userId }
	});
}


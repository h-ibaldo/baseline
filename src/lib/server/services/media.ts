/**
 * Media Service
 * Handles file uploads, image optimization, and media management
 */

import { db } from '../db/client';
import sharp from 'sharp';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import type { Media } from '@prisma/client';

const UPLOAD_DIR = 'static/uploads';
const MAX_IMAGE_WIDTH = 2400;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true });
	}
}

/**
 * Upload and process media file
 */
export async function uploadMedia(data: {
	file: File;
	userId: string;
	teamId: string;
	altText?: string;
}): Promise<{ media: Media } | { error: string }> {
	const { file, userId, teamId, altText } = data;

	// Validate file size
	if (file.size > MAX_FILE_SIZE) {
		return { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
	}

	// Validate file type
	const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
	const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

	if (!isImage && !isVideo) {
		return { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed' };
	}

	await ensureUploadDir();

	try {
		// Generate unique filename
		const ext = path.extname(file.name);
		const filename = `${nanoid()}-${Date.now()}${ext}`;
		const filepath = path.join(UPLOAD_DIR, filename);
		const url = `/uploads/${filename}`;

		// Get file buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		let width: number | undefined;
		let height: number | undefined;
		let processedBuffer = buffer;

		// Process images with Sharp
		if (isImage) {
			const image = sharp(buffer);
			const metadata = await image.metadata();

			width = metadata.width;
			height = metadata.height;

			// Resize if too large
			if (width && width > MAX_IMAGE_WIDTH) {
				image.resize(MAX_IMAGE_WIDTH, undefined, {
					fit: 'inside',
					withoutEnlargement: true
				});
			}

			// Convert to WebP for better compression (except GIFs)
			if (file.type !== 'image/gif') {
				processedBuffer = await image.webp({ quality: 85 }).toBuffer();
			} else {
				processedBuffer = await image.toBuffer();
			}
		}

		// Write file to disk
		await writeFile(filepath, processedBuffer);

		// Create database entry
		const media = await db.media.create({
			data: {
				filename: file.name,
				path: filepath,
				url,
				mimeType: file.type,
				size: processedBuffer.length,
				width,
				height,
				altText,
				teamId,
				uploadedBy: userId
			}
		});

		return { media };
	} catch (error) {
		console.error('Media upload error:', error);
		return { error: 'Failed to upload media' };
	}
}

/**
 * List all media for a team
 */
export async function listMedia(data: {
	teamId: string;
	limit?: number;
	offset?: number;
	mimeType?: string;
}): Promise<{ media: Media[]; total: number }> {
	const { teamId, limit = 50, offset = 0, mimeType } = data;

	const where = {
		teamId,
		...(mimeType && { mimeType: { contains: mimeType } })
	};

	const [media, total] = await Promise.all([
		db.media.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: limit,
			skip: offset,
			include: {
				uploader: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		}),
		db.media.count({ where })
	]);

	return { media, total };
}

/**
 * Get single media by ID
 */
export async function getMediaById(id: string, teamId: string): Promise<Media | null> {
	return db.media.findFirst({
		where: { id, teamId }
	});
}

/**
 * Update media metadata
 */
export async function updateMedia(
	id: string,
	teamId: string,
	data: { altText?: string; filename?: string }
): Promise<{ media: Media } | { error: string }> {
	const media = await getMediaById(id, teamId);

	if (!media) {
		return { error: 'Media not found' };
	}

	const updated = await db.media.update({
		where: { id },
		data
	});

	return { media: updated };
}

/**
 * Delete media
 */
export async function deleteMedia(
	id: string,
	teamId: string
): Promise<{ success: boolean } | { error: string }> {
	const media = await getMediaById(id, teamId);

	if (!media) {
		return { error: 'Media not found' };
	}

	try {
		// Delete file from disk
		if (existsSync(media.path)) {
			await unlink(media.path);
		}

		// Delete from database
		await db.media.delete({ where: { id } });

		return { success: true };
	} catch (error) {
		console.error('Media delete error:', error);
		return { error: 'Failed to delete media' };
	}
}

/**
 * Get media stats for a team
 */
export async function getMediaStats(teamId: string): Promise<{
	total: number;
	images: number;
	videos: number;
	totalSize: number;
}> {
	const allMedia = await db.media.findMany({
		where: { teamId },
		select: { mimeType: true, size: true }
	});

	return {
		total: allMedia.length,
		images: allMedia.filter((m) => m.mimeType.startsWith('image/')).length,
		videos: allMedia.filter((m) => m.mimeType.startsWith('video/')).length,
		totalSize: allMedia.reduce((sum, m) => sum + m.size, 0)
	};
}

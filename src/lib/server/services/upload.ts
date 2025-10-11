/**
 * Upload Service
 * Handles file uploads, validation, and storage
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { db } from '../db/client';

const UPLOAD_DIR = 'static/uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf', 'video/mp4'];

export interface UploadResult {
	id: string;
	filename: string;
	path: string;
	url: string;
	mimeType: string;
	size: number;
	width?: number;
	height?: number;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
	try {
		await fs.access(UPLOAD_DIR);
	} catch {
		await fs.mkdir(UPLOAD_DIR, { recursive: true });
	}
}

/**
 * Validate file type
 */
function isValidFileType(mimeType: string): boolean {
	return ALLOWED_FILE_TYPES.includes(mimeType);
}

/**
 * Validate file size
 */
function isValidFileSize(size: number): boolean {
	return size <= MAX_FILE_SIZE;
}

/**
 * Get file extension from mime type
 */
function getExtension(mimeType: string): string {
	const extensions: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/png': 'png',
		'image/gif': 'gif',
		'image/webp': 'webp',
		'image/svg+xml': 'svg',
		'application/pdf': 'pdf',
		'video/mp4': 'mp4'
	};
	return extensions[mimeType] || 'bin';
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string, mimeType: string): string {
	const id = nanoid(10);
	const ext = getExtension(mimeType);
	const safeName = originalName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.substring(0, 50);
	return `${safeName}-${id}.${ext}`;
}

/**
 * Get image dimensions using sharp
 */
async function getImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
	try {
		const metadata = await sharp(filePath).metadata();
		return {
			width: metadata.width || 0,
			height: metadata.height || 0
		};
	} catch {
		return null;
	}
}

/**
 * Optimize image using sharp
 */
async function optimizeImage(filePath: string, mimeType: string): Promise<void> {
	try {
		// Skip SVG files
		if (mimeType === 'image/svg+xml') {
			return;
		}

		const image = sharp(filePath);
		const metadata = await image.metadata();

		// Resize if image is too large
		if (metadata.width && metadata.width > 2000) {
			await image.resize(2000, null, { withoutEnlargement: true }).toFile(filePath + '.tmp');
			await fs.rename(filePath + '.tmp', filePath);
		}

		// Optimize based on format
		if (mimeType === 'image/jpeg') {
			await sharp(filePath).jpeg({ quality: 85, progressive: true }).toFile(filePath + '.tmp');
			await fs.rename(filePath + '.tmp', filePath);
		} else if (mimeType === 'image/png') {
			await sharp(filePath).png({ compressionLevel: 9 }).toFile(filePath + '.tmp');
			await fs.rename(filePath + '.tmp', filePath);
		} else if (mimeType === 'image/webp') {
			await sharp(filePath).webp({ quality: 85 }).toFile(filePath + '.tmp');
			await fs.rename(filePath + '.tmp', filePath);
		}
	} catch (error) {
		console.error('Image optimization failed:', error);
		// Continue even if optimization fails
	}
}

/**
 * Upload and store file
 */
export async function uploadFile(
	file: File,
	userId: string,
	options?: {
		altText?: string;
		caption?: string;
		optimize?: boolean;
	}
): Promise<UploadResult> {
	// Validation
	if (!isValidFileType(file.type)) {
		throw new Error(`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
	}

	if (!isValidFileSize(file.size)) {
		throw new Error(`File too large: ${file.size} bytes. Maximum size: ${MAX_FILE_SIZE} bytes`);
	}

	// Ensure upload directory exists
	await ensureUploadDir();

	// Generate unique filename
	const filename = generateFilename(file.name, file.type);
	const relativePath = path.join('uploads', filename);
	const absolutePath = path.join(UPLOAD_DIR, filename);

	// Write file to disk
	const buffer = Buffer.from(await file.arrayBuffer());
	await fs.writeFile(absolutePath, buffer);

	// Get image dimensions if it's an image
	let dimensions: { width: number; height: number } | null = null;
	if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
		dimensions = await getImageDimensions(absolutePath);

		// Optimize image if requested
		if (options?.optimize !== false) {
			await optimizeImage(absolutePath, file.type);
		}
	}

	// Get final file size (may have changed after optimization)
	const stats = await fs.stat(absolutePath);
	const finalSize = stats.size;

	// Create media record in database
	const media = await db.media.create({
		data: {
			filename: file.name,
			path: relativePath,
			url: `/${relativePath}`,
			mimeType: file.type,
			size: finalSize,
			width: dimensions?.width,
			height: dimensions?.height,
			altText: options?.altText,
			caption: options?.caption,
			uploadedBy: userId
		}
	});

	return {
		id: media.id,
		filename: media.filename,
		path: media.path,
		url: media.url,
		mimeType: media.mimeType,
		size: media.size,
		width: media.width || undefined,
		height: media.height || undefined
	};
}

/**
 * Delete file from disk and database
 */
export async function deleteFile(mediaId: string): Promise<void> {
	const media = await db.media.findUnique({
		where: { id: mediaId }
	});

	if (!media) {
		throw new Error('Media not found');
	}

	// Delete from disk
	const absolutePath = path.join('static', media.path);
	try {
		await fs.unlink(absolutePath);
	} catch (error) {
		console.error('Failed to delete file from disk:', error);
		// Continue to delete from database even if file deletion fails
	}

	// Delete from database
	await db.media.delete({
		where: { id: mediaId }
	});
}

/**
 * Get storage statistics
 */
export async function getStorageStats(userId?: string): Promise<{
	totalFiles: number;
	totalSize: number;
	filesByType: Record<string, number>;
}> {
	const where = userId ? { uploadedBy: userId } : {};

	const files = await db.media.findMany({ where });

	const stats = {
		totalFiles: files.length,
		totalSize: files.reduce((sum, f) => sum + f.size, 0),
		filesByType: files.reduce(
			(acc, f) => {
				acc[f.mimeType] = (acc[f.mimeType] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	};

	return stats;
}

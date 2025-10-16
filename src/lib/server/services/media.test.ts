/**
 * Media Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma client before importing
vi.mock('../db/client', () => ({
	db: {
		media: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			count: vi.fn(),
			aggregate: vi.fn()
		}
	}
}));

// Import after mocking
import { mediaService } from './media';
import { db } from '../db/client';

const mockDb = vi.mocked(db);

describe('Media Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAll', () => {
		it('should return paginated media list', async () => {
			const mockMedia = [
				{
					id: 'media-1',
					filename: 'image1.jpg',
					url: '/uploads/image1.jpg',
					mimeType: 'image/jpeg',
					size: 1024,
					width: 800,
					height: 600,
					altText: null,
					uploaderId: 'user-1',
					createdAt: new Date(),
					uploader: {
						name: 'Test User'
					}
				}
			];

			mockDb.media.findMany.mockResolvedValue(mockMedia as never);

			const result = await mediaService.getAll({ limit: 10, offset: 0 });

			expect(result.media).toEqual(mockMedia);
			expect(mockDb.media.findMany).toHaveBeenCalledWith({
				include: { uploader: { select: { name: true } } },
				orderBy: { createdAt: 'desc' },
				take: 10,
				skip: 0
			});
		});

		it('should filter by type', async () => {
			mockDb.media.findMany.mockResolvedValue([]);

			await mediaService.getAll({ limit: 10, offset: 0, type: 'image' });

			expect(mockDb.media.findMany).toHaveBeenCalledWith({
				where: { mimeType: { startsWith: 'image/' } },
				include: { uploader: { select: { name: true } } },
				orderBy: { createdAt: 'desc' },
				take: 10,
				skip: 0
			});
		});
	});

	describe('getById', () => {
		it('should return media by id', async () => {
			const mockMedia = {
				id: 'media-1',
				filename: 'test.jpg',
				url: '/uploads/test.jpg',
				mimeType: 'image/jpeg',
				size: 2048,
				width: 1024,
				height: 768,
				altText: 'Test',
				uploaderId: 'user-1',
				createdAt: new Date()
			};

			mockDb.media.findUnique.mockResolvedValue(mockMedia as never);

			const result = await mediaService.getById('media-1');

			expect(result).toEqual(mockMedia);
			expect(mockDb.media.findUnique).toHaveBeenCalledWith({
				where: { id: 'media-1' }
			});
		});

		it('should return null for non-existent media', async () => {
			mockDb.media.findUnique.mockResolvedValue(null);

			const result = await mediaService.getById('non-existent');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create new media record', async () => {
			const mediaData = {
				filename: 'new.jpg',
				url: '/uploads/new.jpg',
				mimeType: 'image/jpeg',
				size: 4096,
				width: 1920,
				height: 1080,
				uploaderId: 'user-1'
			};

			const mockCreated = {
				id: 'media-2',
				...mediaData,
				altText: null,
				createdAt: new Date()
			};

			mockDb.media.create.mockResolvedValue(mockCreated as never);

			const result = await mediaService.create(mediaData);

			expect(result).toEqual(mockCreated);
			expect(mockDb.media.create).toHaveBeenCalledWith({
				data: mediaData
			});
		});
	});

	describe('update', () => {
		it('should update media metadata', async () => {
			const mockUpdated = {
				id: 'media-1',
				filename: 'updated.jpg',
				url: '/uploads/updated.jpg',
				mimeType: 'image/jpeg',
				size: 2048,
				width: 800,
				height: 600,
				altText: 'Updated alt text',
				uploaderId: 'user-1',
				createdAt: new Date()
			};

			mockDb.media.update.mockResolvedValue(mockUpdated as never);

			const result = await mediaService.update('media-1', { altText: 'Updated alt text' });

			expect(result).toEqual(mockUpdated);
			expect(mockDb.media.update).toHaveBeenCalledWith({
				where: { id: 'media-1' },
				data: { altText: 'Updated alt text' }
			});
		});
	});

	describe('delete', () => {
		it('should delete media record', async () => {
			const mockDeleted = {
				id: 'media-1',
				filename: 'deleted.jpg',
				url: '/uploads/deleted.jpg',
				mimeType: 'image/jpeg',
				size: 1024,
				width: 800,
				height: 600,
				altText: null,
				uploaderId: 'user-1',
				createdAt: new Date()
			};

			mockDb.media.delete.mockResolvedValue(mockDeleted as never);

			const result = await mediaService.delete('media-1');

			expect(result).toEqual(mockDeleted);
			expect(mockDb.media.delete).toHaveBeenCalledWith({
				where: { id: 'media-1' }
			});
		});
	});

	describe('getStats', () => {
		it('should return media statistics', async () => {
			mockDb.media.count.mockResolvedValue(50);
			mockDb.media.aggregate.mockResolvedValue({
				_sum: { size: 10485760 }
			} as never);

			const result = await mediaService.getStats();

			expect(result.totalFiles).toBe(50);
			expect(result.totalSize).toBe(10485760);
			expect(mockDb.media.count).toHaveBeenCalled();
			expect(mockDb.media.aggregate).toHaveBeenCalled();
		});

		it('should handle zero files', async () => {
			mockDb.media.count.mockResolvedValue(0);
			mockDb.media.aggregate.mockResolvedValue({
				_sum: { size: null }
			} as never);

			const result = await mediaService.getStats();

			expect(result.totalFiles).toBe(0);
			expect(result.totalSize).toBe(0);
		});
	});
});

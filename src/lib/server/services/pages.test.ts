/**
 * Page Service Tests
 *
 * Tests for page revision system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../db/client';
import {
	createPage,
	createRevision,
	getPageRevisions,
	restoreRevision,
	pruneRevisions
} from './pages';

describe('Page Revision System', () => {
	let testPageId: string;
	let testUserId: string;

	beforeEach(async () => {
		// Create test user
		const user = await prisma.user.create({
			data: {
				email: 'test@example.com',
				name: 'Test User',
				passwordHash: 'hashedpassword',
				role: 'author'
			}
		});
		testUserId = user.id;

		// Create test page
		const page = await createPage({
			slug: 'test-page',
			title: 'Test Page',
			designEvents: JSON.stringify([{ type: 'INITIAL' }]),
			authorId: testUserId
		});
		testPageId = page.id;
	});

	afterEach(async () => {
		// Clean up
		await prisma.pageRevision.deleteMany({ where: { pageId: testPageId } });
		await prisma.page.deleteMany({ where: { id: testPageId } });
		await prisma.user.deleteMany({ where: { id: testUserId } });
	});

	it('should create a revision snapshot', async () => {
		await createRevision(testPageId, testUserId);

		const revisions = await getPageRevisions(testPageId);
		expect(revisions).toHaveLength(1);
		expect(revisions[0].pageId).toBe(testPageId);
		expect(revisions[0].createdBy).toBe(testUserId);
	});

	it('should list all revisions with creator info', async () => {
		await createRevision(testPageId, testUserId);
		await createRevision(testPageId, testUserId);

		const revisions = await getPageRevisions(testPageId);
		expect(revisions).toHaveLength(2);
		expect(revisions[0].creator).toBeDefined();
		expect(revisions[0].creator.email).toBe('test@example.com');
	});

	it('should restore page to a previous revision', async () => {
		// Create initial revision
		await createRevision(testPageId, testUserId);
		const revisions = await getPageRevisions(testPageId);
		const firstRevisionId = revisions[0].id;

		// Update page
		await prisma.page.update({
			where: { id: testPageId },
			data: { designEvents: JSON.stringify([{ type: 'UPDATED' }]) }
		});

		// Restore to first revision
		await restoreRevision(testPageId, firstRevisionId, testUserId);

		// Verify restoration
		const page = await prisma.page.findUnique({ where: { id: testPageId } });
		expect(JSON.parse(page!.designEvents)).toEqual([{ type: 'INITIAL' }]);
	});

	it('should create a backup revision before restoring', async () => {
		await createRevision(testPageId, testUserId);
		const revisions = await getPageRevisions(testPageId);

		await restoreRevision(testPageId, revisions[0].id, testUserId);

		const allRevisions = await getPageRevisions(testPageId);
		expect(allRevisions.length).toBeGreaterThan(1);
	});

	it('should prune old revisions keeping last N', async () => {
		// Create 15 revisions
		for (let i = 0; i < 15; i++) {
			await createRevision(testPageId, testUserId);
		}

		// Prune to keep only 10
		await pruneRevisions(testPageId, 10);

		const revisions = await getPageRevisions(testPageId);
		expect(revisions).toHaveLength(10);
	});

	it('should sort revisions by creation date (newest first)', async () => {
		await createRevision(testPageId, testUserId);
		await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
		await createRevision(testPageId, testUserId);

		const revisions = await getPageRevisions(testPageId);
		expect(revisions[0].createdAt.getTime()).toBeGreaterThan(
			revisions[1].createdAt.getTime()
		);
	});

	it('should throw error when restoring non-existent revision', async () => {
		await expect(
			restoreRevision(testPageId, 'fake-revision-id', testUserId)
		).rejects.toThrow('Revision not found');
	});

	it('should throw error when creating revision for non-existent page', async () => {
		await expect(
			createRevision('fake-page-id', testUserId)
		).rejects.toThrow('Page not found');
	});
});

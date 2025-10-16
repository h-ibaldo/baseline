/**
 * Content Blocks API
 * GET /api/content-blocks - List all blocks
 * POST /api/content-blocks - Create new block
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth, requireAdmin } from '$lib/server/middleware/auth';
import * as blocksService from '$lib/server/services/content-blocks';

/**
 * GET /api/content-blocks
 * List all content blocks (public + user's private)
 */
export const GET: RequestHandler = requireAuth(async ({ locals, url }) => {
	try {
		const category = url.searchParams.get('category');

		const blocks = category
			? await blocksService.getBlocksByCategory(category, locals.user.id)
			: await blocksService.getAllBlocks(locals.user.id);

		return json({ blocks });
	} catch (error) {
		console.error('Failed to fetch blocks:', error);
		return json({ error: 'Failed to fetch blocks' }, { status: 500 });
	}
});

/**
 * POST /api/content-blocks
 * Create new content block
 */
export const POST: RequestHandler = requireAuth(async ({ request, locals }) => {
	try {
		const data = await request.json();

		// Validation
		if (!data.name?.trim()) {
			return json({ error: 'Block name is required' }, { status: 400 });
		}

		if (!data.content) {
			return json({ error: 'Block content is required' }, { status: 400 });
		}

		const block = await blocksService.createBlock({
			name: data.name.trim(),
			description: data.description,
			category: data.category,
			content: data.content,
			properties: data.properties,
			thumbnail: data.thumbnail,
			isPublic: data.isPublic,
			createdBy: locals.user.id
		});

		return json(block, { status: 201 });
	} catch (error) {
		console.error('Failed to create block:', error);
		return json({ error: 'Failed to create block' }, { status: 500 });
	}
});

/**
 * PUT /api/content-blocks
 * Update content block
 */
export const PUT: RequestHandler = requireAuth(async ({ request, locals }) => {
	try {
		const { id, ...data } = await request.json();

		if (!id) {
			return json({ error: 'Block ID is required' }, { status: 400 });
		}

		// Verify ownership
		const existing = await blocksService.getBlockById(id);
		if (!existing) {
			return json({ error: 'Block not found' }, { status: 404 });
		}

		if (existing.createdBy !== locals.user.id && locals.user.role !== 'admin') {
			return json({ error: 'Permission denied' }, { status: 403 });
		}

		const block = await blocksService.updateBlock(id, data);

		return json(block);
	} catch (error) {
		console.error('Failed to update block:', error);
		return json({ error: 'Failed to update block' }, { status: 500 });
	}
});

/**
 * DELETE /api/content-blocks
 * Delete content block
 */
export const DELETE: RequestHandler = requireAuth(async ({ request, locals }) => {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'Block ID is required' }, { status: 400 });
		}

		// Verify ownership
		const existing = await blocksService.getBlockById(id);
		if (!existing) {
			return json({ error: 'Block not found' }, { status: 404 });
		}

		if (existing.createdBy !== locals.user.id && locals.user.role !== 'admin') {
			return json({ error: 'Permission denied' }, { status: 403 });
		}

		await blocksService.deleteBlock(id);

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete block:', error);
		return json({ error: 'Failed to delete block' }, { status: 500 });
	}
});

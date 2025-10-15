/**
 * Sitemap Service Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Prisma client before importing
vi.mock('../db/client', () => ({
	prisma: {
		page: {
			findMany: vi.fn()
		},
		plugin: {
			findUnique: vi.fn()
		},
		setting: {
			findUnique: vi.fn()
		}
	}
}));

// Mock HooksManager
const mockHooksManager = {
	execute: vi.fn()
};

vi.mock('$lib/core/plugins/hooks', () => ({
	HooksManager: {
		getInstance: () => mockHooksManager
	}
}));

// Import after mocking
import { generateSitemap, getSitemapEntries, getSitemapStats } from './sitemap';
import { prisma } from '../db/client';

// Get mocked prisma for type-safe access
const mockPrisma = vi.mocked(prisma);

describe('Sitemap Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getSitemapEntries', () => {
		it('should return homepage and published pages', async () => {
			// Mock site URL setting
			mockPrisma.setting.findUnique.mockResolvedValue({
				key: 'site_url',
				value: 'https://example.com'
			});

			// Mock published pages
			mockPrisma.page.findMany.mockResolvedValue([
				{
					slug: 'about',
					updatedAt: new Date('2024-01-01')
				},
				{
					slug: 'contact',
					updatedAt: new Date('2024-01-02')
				}
			]);

			// Mock no plugin entries
			mockHooksManager.execute.mockResolvedValue([]);

			const entries = await getSitemapEntries();

			// Should have homepage + 2 pages
			expect(entries).toHaveLength(3);
			expect(entries[0].url).toBe('https://example.com');
			expect(entries[1].url).toBe('https://example.com/about');
			expect(entries[2].url).toBe('https://example.com/contact');
		});

		it('should include plugin-provided entries via hooks', async () => {
			// Mock site URL setting
			mockPrisma.setting.findUnique.mockResolvedValue({
				key: 'site_url',
				value: 'https://example.com'
			});

			// Mock pages
			mockPrisma.page.findMany.mockResolvedValue([]);

			// Mock plugin entries from blog plugin
			mockHooksManager.execute.mockResolvedValue([
				{
					success: true,
					result: [
						{
							url: 'https://example.com/blog/post-1',
							lastmod: '2024-01-01T00:00:00.000Z',
							changefreq: 'monthly',
							priority: 0.7
						}
					]
				}
			]);

			const entries = await getSitemapEntries();

			// Should have homepage + blog entry
			expect(entries).toHaveLength(2);
			expect(entries[0].url).toBe('https://example.com');
			expect(entries[1].url).toBe('https://example.com/blog/post-1');
			expect(entries[1].priority).toBe(0.7);
			expect(mockHooksManager.execute).toHaveBeenCalledWith('getSitemapEntries');
		});

		it('should use localhost as default URL', async () => {
			// Mock no site URL setting
			mockPrisma.setting.findUnique.mockResolvedValue(null);

			// Mock no pages
			mockPrisma.page.findMany.mockResolvedValue([]);

			// Mock no plugin entries
			mockHooksManager.execute.mockResolvedValue([]);

			const entries = await getSitemapEntries();

			expect(entries[0].url).toBe('http://localhost:5173');
		});

		it('should normalize plugin relative URLs', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});
			mockPrisma.page.findMany.mockResolvedValue([]);

			// Plugin returns relative path
			mockHooksManager.execute.mockResolvedValue([
				{
					success: true,
					result: [
						{
							url: '/blog/my-post',
							lastmod: '2024-01-01T00:00:00.000Z',
							changefreq: 'monthly',
							priority: 0.7
						}
					]
				}
			]);

			const entries = await getSitemapEntries();

			expect(entries[1].url).toBe('https://example.com/blog/my-post');
			expect(entries[1]._isPluginEntry).toBe(true);
		});

		it('should normalize baseUrl with trailing slash', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com/'
			});
			mockPrisma.page.findMany.mockResolvedValue([
				{ slug: 'about', updatedAt: new Date('2024-01-01') }
			]);
			mockHooksManager.execute.mockResolvedValue([]);

			const entries = await getSitemapEntries();

			// Trailing slash should be removed from baseUrl
			expect(entries[0].url).toBe('https://example.com');
			expect(entries[1].url).toBe('https://example.com/about');
			// No double slashes in path portion
			expect(entries[1].url.split('://')[1]).not.toContain('//');
		});

		it('should normalize absolute plugin URLs with double slashes', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});
			mockPrisma.page.findMany.mockResolvedValue([]);

			// Plugin returns absolute URL with double slashes
			mockHooksManager.execute.mockResolvedValue([
				{
					success: true,
					result: [
						{
							url: 'https://example.com//blog//post-1',
							lastmod: '2024-01-01T00:00:00.000Z',
							changefreq: 'monthly',
							priority: 0.7
						}
					]
				}
			]);

			const entries = await getSitemapEntries();

			// Should normalize double slashes
			expect(entries[1].url).toBe('https://example.com/blog/post-1');
			expect(entries[1].url).not.toContain('//blog');
			expect(entries[1].url).not.toContain('//post');
		});

		it('should encode special characters in plugin URLs', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});
			mockPrisma.page.findMany.mockResolvedValue([]);

			mockHooksManager.execute.mockResolvedValue([
				{
					success: true,
					result: [
						{
							url: '/blog/hello world',
							lastmod: '2024-01-01T00:00:00.000Z',
							changefreq: 'monthly',
							priority: 0.7
						}
					]
				}
			]);

			const entries = await getSitemapEntries();

			expect(entries[1].url).toContain('hello%20world');
		});

		it('should set higher priority for homepage and index pages', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});

			mockPrisma.page.findMany.mockResolvedValue([
				{ slug: 'index', updatedAt: new Date() },
				{ slug: 'about', updatedAt: new Date() }
			]);

			mockHooksManager.execute.mockResolvedValue([]);

			const entries = await getSitemapEntries();

			const indexPage = entries.find((e) => e.url.endsWith('/index'));
			const aboutPage = entries.find((e) => e.url.endsWith('/about'));

			expect(indexPage?.priority).toBe(1.0);
			expect(aboutPage?.priority).toBe(0.8);
		});
	});

	describe('generateSitemap', () => {
		it('should generate valid XML sitemap', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});

			mockPrisma.page.findMany.mockResolvedValue([
				{
					slug: 'about',
					updatedAt: new Date('2024-01-01T00:00:00Z')
				}
			]);

			mockHooksManager.execute.mockResolvedValue([]);

			const xml = await generateSitemap();

			// Should be valid XML
			expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
			expect(xml).toContain('</urlset>');

			// Should contain homepage
			expect(xml).toContain('<loc>https://example.com</loc>');

			// Should contain about page
			expect(xml).toContain('<loc>https://example.com/about</loc>');

			// Should have proper formatting
			expect(xml).toContain('<lastmod>');
			expect(xml).toContain('<changefreq>');
			expect(xml).toContain('<priority>');
		});

		it('should URL-encode and XML-escape special characters', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});

			mockPrisma.page.findMany.mockResolvedValue([
				{
					slug: 'test&special<chars>',
					updatedAt: new Date()
				}
			]);

			mockHooksManager.execute.mockResolvedValue([]);

			const xml = await generateSitemap();

			// & should be URL-encoded to %26, then XML-escaped to &amp;
			expect(xml).toContain('&amp;');
			// < and > should be URL-encoded to %3C and %3E
			expect(xml).toContain('%3C');
			expect(xml).toContain('%3E');
		});

		it('should include blog entries from plugin hooks', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({ value: 'https://example.com' });
			mockPrisma.page.findMany.mockResolvedValue([]);

			// Mock blog plugin returning entries via hook
			mockHooksManager.execute.mockResolvedValue([
				{
					success: true,
					result: [
						{
							url: '/blog/hello-world',
							lastmod: new Date('2024-02-01').toISOString(),
							changefreq: 'monthly',
							priority: 0.7
						}
					]
				}
			]);

			const xml = await generateSitemap();
			expect(xml).toContain('<loc>https://example.com/blog/hello-world</loc>');
		});
	});

	describe('getSitemapStats', () => {
		it('should return sitemap statistics', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});

			mockPrisma.page.findMany.mockResolvedValue([
				{ slug: 'about', updatedAt: new Date() },
				{ slug: 'contact', updatedAt: new Date() }
			]);

			mockHooksManager.execute.mockResolvedValue([]);

			const stats = await getSitemapStats();

			expect(stats.total).toBe(3); // homepage + 2 pages
			expect(stats.pages).toBe(3);
			expect(stats.pluginEntries).toBe(0);
			expect(stats.lastGenerated).toBeDefined();
		});

		it('should count plugin entries separately', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue({
				value: 'https://example.com'
			});

			mockPrisma.page.findMany.mockResolvedValue([
				{ slug: 'about', updatedAt: new Date() }
			]);

			// Mock 2 blog entries from plugin
			mockHooksManager.execute.mockResolvedValue([
				{
					success: true,
					result: [
						{
							url: 'https://example.com/blog/post-1',
							lastmod: '2024-01-01T00:00:00.000Z',
							changefreq: 'monthly',
							priority: 0.7
						},
						{
							url: 'https://example.com/blog/post-2',
							lastmod: '2024-01-02T00:00:00.000Z',
							changefreq: 'monthly',
							priority: 0.7
						}
					]
				}
			]);

			const stats = await getSitemapStats();

			expect(stats.total).toBe(4); // homepage + 1 page + 2 blog posts
			expect(stats.pages).toBe(2); // homepage + about
			expect(stats.pluginEntries).toBe(2); // 2 blog posts
		});
	});
});

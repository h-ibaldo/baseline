/**
 * Robots.txt Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma client
vi.mock('../db/client', () => ({
	prisma: {
		setting: {
			findUnique: vi.fn()
		}
	}
}));

// Import after mocking
import { generateRobots, getRobotsStats } from './robots';
import { prisma } from '../db/client';

// Get mocked prisma for type-safe access
const mockPrisma = vi.mocked(prisma);

describe('Robots Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('generateRobots', () => {
		it('should generate default robots.txt with allow all and sitemap', async () => {
			// Mock default settings (allow all)
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).toContain('User-agent: *');
			expect(robots).toContain('Disallow:');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
			expect(robots).toMatch(/^# robots\.txt/);
		});

		it('should normalize base URL with trailing slash', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com/' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			// Should remove trailing slash from sitemap URL
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
			expect(robots).not.toContain('example.com//sitemap.xml');
		});

		it('should use localhost as default URL', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue(null);

			const robots = await generateRobots();

			expect(robots).toContain('Sitemap: http://localhost:5173/sitemap.xml');
		});

		it('should include custom disallow paths', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_disallow_paths') {
					return Promise.resolve({
						key: 'robots_disallow_paths',
						value: JSON.stringify(['/admin/', '/api/', '/private/'])
					});
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).toContain('Disallow: /admin/');
			expect(robots).toContain('Disallow: /api/');
			expect(robots).toContain('Disallow: /private/');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
		});

		it('should handle crawl delay setting', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_crawl_delay') {
					return Promise.resolve({ key: 'robots_crawl_delay', value: '5' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).toContain('Crawl-delay: 5');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
		});

		it('should block all when allow_all is false and no paths specified', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_allow_all') {
					return Promise.resolve({ key: 'robots_allow_all', value: 'false' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).toContain('Disallow: /');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
		});

		it('should handle invalid JSON in disallow_paths gracefully', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_disallow_paths') {
					return Promise.resolve({
						key: 'robots_disallow_paths',
						value: 'invalid json'
					});
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			// Should fall back to allow all
			expect(robots).toContain('Disallow:');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
		});

		it('should filter non-string values from disallow_paths', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_disallow_paths') {
					return Promise.resolve({
						key: 'robots_disallow_paths',
						value: JSON.stringify(['/admin/', 123, null, '/api/', undefined])
					});
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).toContain('Disallow: /admin/');
			expect(robots).toContain('Disallow: /api/');
			expect(robots).not.toContain('Disallow: 123');
			expect(robots).not.toContain('Disallow: null');
		});

		it('should ignore invalid crawl delay values', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_crawl_delay') {
					return Promise.resolve({ key: 'robots_crawl_delay', value: 'invalid' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).not.toContain('Crawl-delay:');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
		});

		it('should ignore negative crawl delay', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_crawl_delay') {
					return Promise.resolve({ key: 'robots_crawl_delay', value: '-5' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).not.toContain('Crawl-delay:');
		});

		it('should generate complete robots.txt with all settings', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_allow_all') {
					return Promise.resolve({ key: 'robots_allow_all', value: 'true' });
				}
				if (args.where.key === 'robots_disallow_paths') {
					return Promise.resolve({
						key: 'robots_disallow_paths',
						value: JSON.stringify(['/admin/', '/private/'])
					});
				}
				if (args.where.key === 'robots_crawl_delay') {
					return Promise.resolve({ key: 'robots_crawl_delay', value: '10' });
				}
				return Promise.resolve(null);
			});

			const robots = await generateRobots();

			expect(robots).toContain('# robots.txt for LineBasis');
			expect(robots).toContain('User-agent: *');
			expect(robots).toContain('Disallow: /admin/');
			expect(robots).toContain('Disallow: /private/');
			expect(robots).toContain('Crawl-delay: 10');
			expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
		});
	});

	describe('getRobotsStats', () => {
		it('should return robots configuration statistics', async () => {
			mockPrisma.setting.findUnique.mockImplementation((args: any) => {
				if (args.where.key === 'site_url') {
					return Promise.resolve({ key: 'site_url', value: 'https://example.com' });
				}
				if (args.where.key === 'robots_disallow_paths') {
					return Promise.resolve({
						key: 'robots_disallow_paths',
						value: JSON.stringify(['/admin/', '/api/'])
					});
				}
				if (args.where.key === 'robots_crawl_delay') {
					return Promise.resolve({ key: 'robots_crawl_delay', value: '5' });
				}
				return Promise.resolve(null);
			});

			const stats = await getRobotsStats();

			expect(stats.allowAll).toBe(true);
			expect(stats.disallowPathCount).toBe(2);
			expect(stats.disallowPaths).toEqual(['/admin/', '/api/']);
			expect(stats.crawlDelay).toBe(5);
			expect(stats.sitemapUrl).toBe('https://example.com/sitemap.xml');
			expect(stats.lastGenerated).toBeDefined();
		});

		it('should return stats with defaults when no settings exist', async () => {
			mockPrisma.setting.findUnique.mockResolvedValue(null);

			const stats = await getRobotsStats();

			expect(stats.allowAll).toBe(true);
			expect(stats.disallowPathCount).toBe(0);
			expect(stats.disallowPaths).toEqual([]);
			expect(stats.crawlDelay).toBeUndefined();
			expect(stats.sitemapUrl).toBe('http://localhost:5173/sitemap.xml');
		});
	});
});

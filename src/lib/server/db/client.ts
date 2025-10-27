/**
 * Prisma Database Client
 *
 * Singleton instance of Prisma Client for database access.
 * Uses connection pooling and proper cleanup in development.
 */

import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Singleton pattern to prevent multiple Prisma Client instances
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
	log: dev ? ['query', 'error', 'warn'] : ['error']
});

if (dev) {
	globalForPrisma.prisma = db;
}

// Graceful shutdown
if (!dev) {
	process.on('beforeExit', async () => {
		await db.$disconnect();
	});
}

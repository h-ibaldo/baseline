/**
 * Prisma Database Client
 *
 * Singleton instance of Prisma Client for database access.
 * Uses connection pooling and proper cleanup in development.
 */

import { PrismaClient } from '@prisma/client';

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Singleton pattern to prevent multiple Prisma Client instances
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
	log: isDev ? ['query', 'error', 'warn'] : ['error']
});

if (isDev) {
	globalForPrisma.prisma = db;
}

// Graceful shutdown
if (!isDev) {
	process.on('beforeExit', async () => {
		await db.$disconnect();
	});
}

/**
 * Database Client
 * 
 * Prisma client singleton for database operations
 * Server-side only
 */

import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: dev ? ['query', 'error', 'warn'] : ['error']
	});

if (dev) globalForPrisma.prisma = prisma;

/**
 * Disconnect from database
 * Used for cleanup in tests or graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
	await prisma.$disconnect();
}

/**
 * Connect to database
 * Useful for testing connections
 */
export async function connectDatabase(): Promise<void> {
	await prisma.$connect();
}

/**
 * Check if database is connected
 */
export async function isDatabaseConnected(): Promise<boolean> {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch {
		return false;
	}
}


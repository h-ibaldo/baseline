/**
 * Vitest Test Setup
 * Runs before all tests
 */

// Setup environment variables for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.NODE_ENV = 'test';

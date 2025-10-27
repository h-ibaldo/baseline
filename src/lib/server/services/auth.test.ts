/**
 * Authentication Service Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../db/client';
import {
	register,
	login,
	hashPassword,
	verifyPassword,
	generateAccessToken,
	verifyAccessToken,
	refresh,
	logout
} from './auth';

// Cleanup: Delete test user before and after tests
const TEST_EMAIL = 'test-auth@example.com';

beforeAll(async () => {
	// Clean up any existing test user
	await db.user.deleteMany({ where: { email: TEST_EMAIL } });
});

afterAll(async () => {
	// Clean up test user
	await db.user.deleteMany({ where: { email: TEST_EMAIL } });
	await db.$disconnect();
});

describe('Password Hashing', () => {
	it('should hash passwords', async () => {
		const password = 'testpassword123';
		const hash = await hashPassword(password);

		expect(hash).toBeTruthy();
		expect(hash).not.toBe(password);
		expect(hash.length).toBeGreaterThan(30);
	});

	it('should verify correct passwords', async () => {
		const password = 'testpassword123';
		const hash = await hashPassword(password);

		const isValid = await verifyPassword(password, hash);
		expect(isValid).toBe(true);
	});

	it('should reject incorrect passwords', async () => {
		const password = 'testpassword123';
		const hash = await hashPassword(password);

		const isValid = await verifyPassword('wrongpassword', hash);
		expect(isValid).toBe(false);
	});
});

describe('User Registration', () => {
	it('should register a new user', async () => {
		const result = await register({
			email: TEST_EMAIL,
			password: 'password123',
			name: 'Test User'
		});

		expect(result).toHaveProperty('user');
		expect(result).toHaveProperty('tokens');

		if ('user' in result) {
			expect(result.user.email).toBe(TEST_EMAIL);
			expect(result.user.name).toBe('Test User');
			expect(result.user.role).toBe('designer');
			expect(result.tokens.accessToken).toBeTruthy();
			expect(result.tokens.refreshToken).toBeTruthy();
		}
	});

	it('should prevent duplicate email registration', async () => {
		const result = await register({
			email: TEST_EMAIL,
			password: 'password123',
			name: 'Duplicate User'
		});

		expect(result).toHaveProperty('error');
		if ('error' in result) {
			expect(result.error).toContain('already exists');
		}
	});
});

describe('User Login', () => {
	it('should login with correct credentials', async () => {
		const result = await login(TEST_EMAIL, 'password123');

		expect(result).toHaveProperty('user');
		expect(result).toHaveProperty('tokens');

		if ('user' in result) {
			expect(result.user.email).toBe(TEST_EMAIL);
			expect(result.tokens.accessToken).toBeTruthy();
			expect(result.tokens.refreshToken).toBeTruthy();
		}
	});

	it('should reject incorrect password', async () => {
		const result = await login(TEST_EMAIL, 'wrongpassword');

		expect(result).toHaveProperty('error');
		if ('error' in result) {
			expect(result.error).toContain('Invalid email or password');
		}
	});

	it('should reject non-existent user', async () => {
		const result = await login('nonexistent@example.com', 'password123');

		expect(result).toHaveProperty('error');
		if ('error' in result) {
			expect(result.error).toContain('Invalid email or password');
		}
	});
});

describe('JWT Tokens', () => {
	it('should generate and verify access tokens', async () => {
		const loginResult = await login(TEST_EMAIL, 'password123');

		if ('user' in loginResult) {
			const token = generateAccessToken(loginResult.user);
			expect(token).toBeTruthy();

			const payload = verifyAccessToken(token);
			expect(payload).toBeTruthy();
			expect(payload?.email).toBe(TEST_EMAIL);
			expect(payload?.userId).toBe(loginResult.user.id);
		}
	});

	it('should reject invalid tokens', () => {
		const payload = verifyAccessToken('invalid-token');
		expect(payload).toBeNull();
	});
});

describe('Token Refresh', () => {
	it('should refresh access token', async () => {
		const loginResult = await login(TEST_EMAIL, 'password123');

		if ('tokens' in loginResult) {
			const refreshResult = await refresh(loginResult.tokens.refreshToken);

			expect(refreshResult).toHaveProperty('tokens');
			if ('tokens' in refreshResult) {
				expect(refreshResult.tokens.accessToken).toBeTruthy();
				expect(refreshResult.tokens.refreshToken).toBeTruthy();
				// New refresh token should be different
				expect(refreshResult.tokens.refreshToken).not.toBe(loginResult.tokens.refreshToken);
			}
		}
	});

	it('should reject invalid refresh token', async () => {
		const result = await refresh('invalid-refresh-token');

		expect(result).toHaveProperty('error');
		if ('error' in result) {
			expect(result.error).toContain('Invalid or expired');
		}
	});
});

describe('Logout', () => {
	it('should invalidate refresh token on logout', async () => {
		const loginResult = await login(TEST_EMAIL, 'password123');

		if ('tokens' in loginResult) {
			// Logout
			await logout(loginResult.tokens.refreshToken);

			// Try to refresh with logged out token (should fail)
			const refreshResult = await refresh(loginResult.tokens.refreshToken);

			expect(refreshResult).toHaveProperty('error');
			if ('error' in refreshResult) {
				expect(refreshResult.error).toContain('Invalid or expired');
			}
		}
	});
});

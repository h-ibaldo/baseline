/**
 * Auth Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma client before importing
vi.mock('../db/client', () => ({
	db: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn()
		},
		session: {
			create: vi.fn(),
			findUnique: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn()
		}
	}
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
	default: {
		hash: vi.fn().mockResolvedValue('hashed_password'),
		compare: vi.fn()
	}
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn().mockReturnValue('mock_token'),
		verify: vi.fn()
	}
}));

// Import after mocking
import { authService } from './auth';
import { db } from '../db/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const mockDb = vi.mocked(db);
const mockBcrypt = vi.mocked(bcrypt);
const mockJwt = vi.mocked(jwt);

describe('Auth Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('login', () => {
		it('should login user with valid credentials', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				passwordHash: 'hashed_password',
				name: 'Test User',
				role: 'author' as const,
				status: 'active' as const
			};

			mockDb.user.findUnique.mockResolvedValue(mockUser);
			mockBcrypt.compare.mockResolvedValue(true as never);
			mockDb.session.create.mockResolvedValue({
				id: 'session-1',
				userId: 'user-1',
				refreshToken: 'mock_refresh_token',
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				createdAt: new Date()
			});

			const result = await authService.login('test@example.com', 'password123');

			expect(result).toEqual({
				accessToken: 'mock_token',
				refreshToken: 'mock_token',
				user: {
					id: 'user-1',
					email: 'test@example.com',
					name: 'Test User',
					role: 'author'
				}
			});
			expect(mockDb.user.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' }
			});
		});

		it('should throw error with invalid credentials', async () => {
			mockDb.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				passwordHash: 'hashed_password',
				name: 'Test',
				role: 'author' as const,
				status: 'active' as const
			});
			mockBcrypt.compare.mockResolvedValue(false as never);

			await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow(
				'Invalid credentials'
			);
		});

		it('should throw error for suspended user', async () => {
			mockDb.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				passwordHash: 'hashed_password',
				name: 'Test',
				role: 'author' as const,
				status: 'suspended' as const
			});

			await expect(authService.login('test@example.com', 'password')).rejects.toThrow(
				'Account suspended'
			);
		});
	});

	describe('verifyToken', () => {
		it('should verify valid access token', async () => {
			mockJwt.verify.mockReturnValue({
				userId: 'user-1',
				type: 'access'
			} as never);

			mockDb.user.findUnique.mockResolvedValue({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'author' as const,
				status: 'active' as const,
				passwordHash: 'hash',
				createdAt: new Date(),
				lastLoginAt: null
			});

			const result = await authService.verifyToken('valid_token');

			expect(result).toEqual({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'author'
			});
		});

		it('should throw error for invalid token', async () => {
			mockJwt.verify.mockImplementation(() => {
				throw new Error('Invalid token');
			});

			await expect(authService.verifyToken('invalid_token')).rejects.toThrow('Invalid token');
		});
	});

	describe('refreshAccessToken', () => {
		it('should refresh access token with valid refresh token', async () => {
			mockJwt.verify.mockReturnValue({
				userId: 'user-1',
				sessionId: 'session-1',
				type: 'refresh'
			} as never);

			mockDb.session.findUnique.mockResolvedValue({
				id: 'session-1',
				userId: 'user-1',
				refreshToken: 'refresh_token',
				expiresAt: new Date(Date.now() + 1000000),
				createdAt: new Date()
			});

			const result = await authService.refreshAccessToken('refresh_token');

			expect(result).toEqual({ accessToken: 'mock_token' });
		});

		it('should throw error for expired refresh token', async () => {
			mockJwt.verify.mockReturnValue({
				userId: 'user-1',
				sessionId: 'session-1',
				type: 'refresh'
			} as never);

			mockDb.session.findUnique.mockResolvedValue({
				id: 'session-1',
				userId: 'user-1',
				refreshToken: 'refresh_token',
				expiresAt: new Date(Date.now() - 1000),
				createdAt: new Date()
			});

			await expect(authService.refreshAccessToken('refresh_token')).rejects.toThrow(
				'Session expired'
			);
		});
	});

	describe('logout', () => {
		it('should delete session on logout', async () => {
			mockDb.session.delete.mockResolvedValue({
				id: 'session-1',
				userId: 'user-1',
				refreshToken: 'token',
				expiresAt: new Date(),
				createdAt: new Date()
			});

			await authService.logout('session-1');

			expect(mockDb.session.delete).toHaveBeenCalledWith({
				where: { id: 'session-1' }
			});
		});
	});
});

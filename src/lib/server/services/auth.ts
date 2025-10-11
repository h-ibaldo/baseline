/**
 * Authentication Service
 * Handles user authentication, JWT tokens, and session management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { db } from '../db/client';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: { id: string; email: string; role: string }): string {
	const payload: JWTPayload = {
		userId: user.id,
		email: user.email,
		role: user.role
	};
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token and store in database
 */
export async function generateRefreshToken(userId: string): Promise<string> {
	const token = nanoid(64);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

	await db.session.create({
		data: {
			userId,
			token,
			expiresAt
		}
	});

	return token;
}

/**
 * Verify and decode JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch (error) {
		return null;
	}
}

/**
 * Verify refresh token and get associated user
 */
export async function verifyRefreshToken(token: string): Promise<User | null> {
	const session = await db.session.findUnique({
		where: { token },
		include: { user: true }
	});

	if (!session || session.expiresAt < new Date()) {
		// Delete expired session
		if (session) {
			await db.session.delete({ where: { id: session.id } });
		}
		return null;
	}

	return session.user;
}

/**
 * Register a new user
 */
export async function register(data: {
	email: string;
	password: string;
	name: string;
	role?: string;
}): Promise<{ user: User; tokens: AuthTokens } | { error: string }> {
	// Check if user already exists
	const existing = await db.user.findUnique({
		where: { email: data.email }
	});

	if (existing) {
		return { error: 'User with this email already exists' };
	}

	// Hash password
	const passwordHash = await hashPassword(data.password);

	// Create user
	const user = await db.user.create({
		data: {
			email: data.email,
			passwordHash,
			name: data.name,
			role: data.role || 'author'
		}
	});

	// Generate tokens
	const accessToken = generateAccessToken(user);
	const refreshToken = await generateRefreshToken(user.id);

	return {
		user,
		tokens: { accessToken, refreshToken }
	};
}

/**
 * Login with email and password
 */
export async function login(
	email: string,
	password: string
): Promise<{ user: User; tokens: AuthTokens } | { error: string }> {
	// Find user
	const user = await db.user.findUnique({
		where: { email }
	});

	if (!user) {
		return { error: 'Invalid email or password' };
	}

	// Check if user is active
	if (user.status !== 'active') {
		return { error: 'Account is suspended' };
	}

	// Verify password
	const isValid = await verifyPassword(password, user.passwordHash);
	if (!isValid) {
		return { error: 'Invalid email or password' };
	}

	// Update last login
	await db.user.update({
		where: { id: user.id },
		data: { lastLoginAt: new Date() }
	});

	// Generate tokens
	const accessToken = generateAccessToken(user);
	const refreshToken = await generateRefreshToken(user.id);

	return {
		user,
		tokens: { accessToken, refreshToken }
	};
}

/**
 * Refresh access token using refresh token
 */
export async function refresh(
	refreshToken: string
): Promise<{ tokens: AuthTokens } | { error: string }> {
	const user = await verifyRefreshToken(refreshToken);

	if (!user) {
		return { error: 'Invalid or expired refresh token' };
	}

	// Generate new tokens
	const accessToken = generateAccessToken(user);
	const newRefreshToken = await generateRefreshToken(user.id);

	// Delete old refresh token
	await db.session.delete({ where: { token: refreshToken } });

	return {
		tokens: { accessToken, refreshToken: newRefreshToken }
	};
}

/**
 * Logout - delete refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
	await db.session.deleteMany({
		where: { token: refreshToken }
	});
}

/**
 * Logout from all devices - delete all user sessions
 */
export async function logoutAll(userId: string): Promise<void> {
	await db.session.deleteMany({
		where: { userId }
	});
}

/**
 * Get user by ID (for authenticated requests)
 */
export async function getUserById(userId: string): Promise<User | null> {
	return db.user.findUnique({
		where: { id: userId }
	});
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
	const result = await db.session.deleteMany({
		where: {
			expiresAt: {
				lt: new Date()
			}
		}
	});
	return result.count;
}

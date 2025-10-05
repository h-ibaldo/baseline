/**
 * User Service
 * 
 * CRUD operations for users and authentication
 * Server-side only
 */

import { prisma } from '../db/client';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export type UserRole = 'admin' | 'editor' | 'author' | 'subscriber';
export type UserStatus = 'active' | 'suspended';

export interface CreateUserInput {
	email: string;
	password: string;
	name: string;
	role?: UserRole;
}

export interface UpdateUserInput {
	email?: string;
	name?: string;
	role?: UserRole;
	status?: UserStatus;
	avatarUrl?: string;
}

const SALT_ROUNDS = 10;

/**
 * Create a new user
 */
export async function createUser(data: CreateUserInput): Promise<Omit<User, 'passwordHash'>> {
	const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			email: data.email,
			passwordHash,
			name: data.name,
			role: data.role || 'author'
		}
	});

	// Don't return password hash
	const { passwordHash: _, ...userWithoutPassword } = user;
	return userWithoutPassword;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
	const user = await prisma.user.findUnique({
		where: { id }
	});

	if (!user) return null;

	const { passwordHash: _, ...userWithoutPassword } = user;
	return userWithoutPassword;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
	return prisma.user.findUnique({
		where: { email }
	});
}

/**
 * Get all users
 */
export async function getUsers(options?: {
	role?: UserRole;
	status?: UserStatus;
}): Promise<Omit<User, 'passwordHash'>[]> {
	const where: any = {};

	if (options?.role) {
		where.role = options.role;
	}

	if (options?.status) {
		where.status = options.status;
	}

	const users = await prisma.user.findMany({
		where,
		orderBy: { createdAt: 'desc' }
	});

	return users.map(({ passwordHash: _, ...user }) => user);
}

/**
 * Update user
 */
export async function updateUser(
	id: string,
	data: UpdateUserInput
): Promise<Omit<User, 'passwordHash'>> {
	const user = await prisma.user.update({
		where: { id },
		data
	});

	const { passwordHash: _, ...userWithoutPassword } = user;
	return userWithoutPassword;
}

/**
 * Update user password
 */
export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
	const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

	await prisma.user.update({
		where: { id },
		data: { passwordHash }
	});
}

/**
 * Verify user password
 */
export async function verifyPassword(email: string, password: string): Promise<User | null> {
	const user = await getUserByEmail(email);

	if (!user) return null;

	const isValid = await bcrypt.compare(password, user.passwordHash);

	return isValid ? user : null;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
	await prisma.user.delete({
		where: { id }
	});
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(id: string): Promise<void> {
	await prisma.user.update({
		where: { id },
		data: { lastLoginAt: new Date() }
	});
}

/**
 * Check if user has permission for action
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
	const roleHierarchy = {
		subscriber: 0,
		author: 1,
		editor: 2,
		admin: 3
	};

	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}


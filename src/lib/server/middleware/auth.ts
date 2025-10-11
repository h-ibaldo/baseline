/**
 * Authentication Middleware
 * Protect routes and verify user permissions
 */

import { error, type RequestEvent } from '@sveltejs/kit';
import { verifyAccessToken, getUserById } from '../services/auth';
import type { User } from '@prisma/client';

export interface AuthenticatedEvent extends RequestEvent {
	locals: {
		user: User;
	};
}

/**
 * Extract JWT token from Authorization header or cookies
 */
function extractToken(event: RequestEvent): string | null {
	// Check Authorization header (Bearer token)
	const authHeader = event.request.headers.get('authorization');
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}

	// Check cookies
	const cookieToken = event.cookies.get('access_token');
	if (cookieToken) {
		return cookieToken;
	}

	return null;
}

/**
 * Require authentication - use in API routes
 * Throws 401 error if not authenticated
 */
export async function requireAuth(event: RequestEvent): Promise<User> {
	const token = extractToken(event);

	if (!token) {
		throw error(401, 'Authentication required');
	}

	const payload = verifyAccessToken(token);
	if (!payload) {
		throw error(401, 'Invalid or expired token');
	}

	const user = await getUserById(payload.userId);
	if (!user) {
		throw error(401, 'User not found');
	}

	if (user.status !== 'active') {
		throw error(403, 'Account is suspended');
	}

	return user;
}

/**
 * Require specific role(s)
 * Throws 403 error if user doesn't have required role
 */
export async function requireRole(
	event: RequestEvent,
	allowedRoles: string[]
): Promise<User> {
	const user = await requireAuth(event);

	if (!allowedRoles.includes(user.role)) {
		throw error(403, 'Insufficient permissions');
	}

	return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(event: RequestEvent): Promise<User> {
	return requireRole(event, ['admin']);
}

/**
 * Require editor role or higher (admin, editor)
 */
export async function requireEditor(event: RequestEvent): Promise<User> {
	return requireRole(event, ['admin', 'editor']);
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 * Does not throw errors
 */
export async function optionalAuth(event: RequestEvent): Promise<User | null> {
	const token = extractToken(event);

	if (!token) {
		return null;
	}

	const payload = verifyAccessToken(token);
	if (!payload) {
		return null;
	}

	const user = await getUserById(payload.userId);
	if (!user || user.status !== 'active') {
		return null;
	}

	return user;
}

/**
 * Check if user owns a resource (by authorId)
 */
export function isResourceOwner(user: User, authorId: string): boolean {
	return user.id === authorId;
}

/**
 * Require resource ownership or admin role
 */
export async function requireOwnershipOrAdmin(
	event: RequestEvent,
	authorId: string
): Promise<User> {
	const user = await requireAuth(event);

	if (user.role === 'admin' || isResourceOwner(user, authorId)) {
		return user;
	}

	throw error(403, 'You do not have permission to access this resource');
}

/**
 * Settings Service
 * 
 * CRUD operations for site settings
 * Server-side only
 */

import { prisma } from '../db/client';
import type { Setting } from '@prisma/client';

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

/**
 * Get setting by key
 */
export async function getSetting(key: string): Promise<Setting | null> {
	return prisma.setting.findUnique({
		where: { key }
	});
}

/**
 * Get setting value (parsed)
 */
export async function getSettingValue<T = any>(key: string): Promise<T | null> {
	const setting = await getSetting(key);

	if (!setting) return null;

	switch (setting.type) {
		case 'number':
			return Number(setting.value) as T;
		case 'boolean':
			return (setting.value === 'true') as T;
		case 'json':
			return JSON.parse(setting.value) as T;
		default:
			return setting.value as T;
	}
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Setting[]> {
	return prisma.setting.findMany();
}

/**
 * Get all settings as key-value object
 */
export async function getAllSettingsAsObject(): Promise<Record<string, any>> {
	const settings = await getAllSettings();

	return settings.reduce((acc, setting) => {
		let value: any = setting.value;

		switch (setting.type) {
			case 'number':
				value = Number(value);
				break;
			case 'boolean':
				value = value === 'true';
				break;
			case 'json':
				value = JSON.parse(value);
				break;
		}

		acc[setting.key] = value;
		return acc;
	}, {} as Record<string, any>);
}

/**
 * Set setting
 */
export async function setSetting(key: string, value: any, type?: SettingType): Promise<Setting> {
	let stringValue: string;
	let detectedType: SettingType = type || 'string';

	if (type === undefined) {
		// Auto-detect type
		if (typeof value === 'number') {
			detectedType = 'number';
			stringValue = value.toString();
		} else if (typeof value === 'boolean') {
			detectedType = 'boolean';
			stringValue = value.toString();
		} else if (typeof value === 'object') {
			detectedType = 'json';
			stringValue = JSON.stringify(value);
		} else {
			stringValue = String(value);
		}
	} else {
		// Use provided type
		if (type === 'json') {
			stringValue = JSON.stringify(value);
		} else {
			stringValue = String(value);
		}
	}

	return prisma.setting.upsert({
		where: { key },
		create: {
			key,
			value: stringValue,
			type: detectedType
		},
		update: {
			value: stringValue,
			type: detectedType
		}
	});
}

/**
 * Set multiple settings at once
 */
export async function setSettings(settings: Record<string, any>): Promise<void> {
	await Promise.all(
		Object.entries(settings).map(([key, value]) => setSetting(key, value))
	);
}

/**
 * Delete setting
 */
export async function deleteSetting(key: string): Promise<void> {
	await prisma.setting.delete({
		where: { key }
	});
}

/**
 * Initialize default settings
 */
export async function initializeDefaultSettings(): Promise<void> {
	const defaults = {
		site_name: 'Baseline CMS',
		site_description: 'A modern, designer-first CMS',
		site_url: 'http://localhost:5173',
		baseline_enabled: true,
		baseline_height: 8,
		max_upload_size: 10485760, // 10MB
		allowed_file_types: JSON.stringify([
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'video/mp4'
		])
	};

	for (const [key, value] of Object.entries(defaults)) {
		const existing = await getSetting(key);
		if (!existing) {
			await setSetting(key, value);
		}
	}
}


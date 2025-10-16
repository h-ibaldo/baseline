/**
 * Settings Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma client before importing
vi.mock('../db/client', () => ({
	db: {
		setting: {
			findUnique: vi.fn(),
			findMany: vi.fn(),
			upsert: vi.fn(),
			delete: vi.fn()
		}
	}
}));

// Import after mocking
import { settingsService } from './settings';
import { db } from '../db/client';

const mockDb = vi.mocked(db);

describe('Settings Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getSetting', () => {
		it('should return setting value by key', async () => {
			const mockSetting = {
				key: 'site_name',
				value: 'LineBasis'
			};

			mockDb.setting.findUnique.mockResolvedValue(mockSetting);

			const result = await settingsService.getSetting('site_name');

			expect(result).toBe('LineBasis');
			expect(mockDb.setting.findUnique).toHaveBeenCalledWith({
				where: { key: 'site_name' }
			});
		});

		it('should return null for non-existent setting', async () => {
			mockDb.setting.findUnique.mockResolvedValue(null);

			const result = await settingsService.getSetting('non_existent');

			expect(result).toBeNull();
		});
	});

	describe('getAllSettings', () => {
		it('should return all settings as array', async () => {
			const mockSettings = [
				{ key: 'site_name', value: 'LineBasis' },
				{ key: 'site_url', value: 'https://linebasis.com' },
				{ key: 'meta_title', value: 'LineBasis CMS' }
			];

			mockDb.setting.findMany.mockResolvedValue(mockSettings);

			const result = await settingsService.getAllSettings();

			expect(result).toEqual(mockSettings);
			expect(mockDb.setting.findMany).toHaveBeenCalled();
		});

		it('should return empty array when no settings exist', async () => {
			mockDb.setting.findMany.mockResolvedValue([]);

			const result = await settingsService.getAllSettings();

			expect(result).toEqual([]);
		});
	});

	describe('setSetting', () => {
		it('should create new setting', async () => {
			const mockSetting = {
				key: 'new_setting',
				value: 'new_value'
			};

			mockDb.setting.upsert.mockResolvedValue(mockSetting);

			const result = await settingsService.setSetting('new_setting', 'new_value');

			expect(result).toEqual(mockSetting);
			expect(mockDb.setting.upsert).toHaveBeenCalledWith({
				where: { key: 'new_setting' },
				update: { value: 'new_value' },
				create: { key: 'new_setting', value: 'new_value' }
			});
		});

		it('should update existing setting', async () => {
			const mockUpdated = {
				key: 'site_name',
				value: 'Updated Name'
			};

			mockDb.setting.upsert.mockResolvedValue(mockUpdated);

			const result = await settingsService.setSetting('site_name', 'Updated Name');

			expect(result.value).toBe('Updated Name');
		});
	});

	describe('deleteSetting', () => {
		it('should delete setting by key', async () => {
			const mockDeleted = {
				key: 'old_setting',
				value: 'old_value'
			};

			mockDb.setting.delete.mockResolvedValue(mockDeleted);

			const result = await settingsService.deleteSetting('old_setting');

			expect(result).toEqual(mockDeleted);
			expect(mockDb.setting.delete).toHaveBeenCalledWith({
				where: { key: 'old_setting' }
			});
		});
	});

	describe('getSettingsMap', () => {
		it('should return settings as key-value map', async () => {
			const mockSettings = [
				{ key: 'site_name', value: 'LineBasis' },
				{ key: 'site_url', value: 'https://linebasis.com' },
				{ key: 'theme_color', value: '#667eea' }
			];

			mockDb.setting.findMany.mockResolvedValue(mockSettings);

			const result = await settingsService.getSettingsMap();

			expect(result).toEqual({
				site_name: 'LineBasis',
				site_url: 'https://linebasis.com',
				theme_color: '#667eea'
			});
		});

		it('should return empty map when no settings exist', async () => {
			mockDb.setting.findMany.mockResolvedValue([]);

			const result = await settingsService.getSettingsMap();

			expect(result).toEqual({});
		});
	});

	describe('bulkSetSettings', () => {
		it('should create/update multiple settings', async () => {
			const settings = [
				{ key: 'setting1', value: 'value1' },
				{ key: 'setting2', value: 'value2' }
			];

			mockDb.setting.upsert
				.mockResolvedValueOnce({ key: 'setting1', value: 'value1' })
				.mockResolvedValueOnce({ key: 'setting2', value: 'value2' });

			await settingsService.bulkSetSettings(settings);

			expect(mockDb.setting.upsert).toHaveBeenCalledTimes(2);
			expect(mockDb.setting.upsert).toHaveBeenNthCalledWith(1, {
				where: { key: 'setting1' },
				update: { value: 'value1' },
				create: { key: 'setting1', value: 'value1' }
			});
		});
	});
});

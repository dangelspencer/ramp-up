import { settingsService, AppSettings } from '@/services/settings.service';
import { db } from '@/db/client';
import { settings, defaultSettings, SettingKey } from '@/db/schema';

// Mock the database
jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('settingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all settings merged with defaults', async () => {
      const storedSettings = [
        { key: 'theme', value: 'dark' },
        { key: 'height', value: '72' },
        { key: 'gender', value: 'male' },
      ];

      const mockFrom = jest.fn().mockResolvedValue(storedSettings);
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await settingsService.getAll();

      expect(result.theme).toBe('dark');
      expect(result.height).toBe(72);
      expect(result.gender).toBe('male');
      // Should have default values for unset settings
      expect(result.units).toBe('imperial'); // default value
    });

    it('should return default settings when no settings stored', async () => {
      const mockFrom = jest.fn().mockResolvedValue([]);
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await settingsService.getAll();

      expect(result.theme).toBe('system');
      expect(result.units).toBe('imperial');
    });
  });

  describe('get', () => {
    it('should return a specific setting value', async () => {
      const storedSettings = [{ key: 'theme', value: 'dark' }];

      const mockWhere = jest.fn().mockResolvedValue(storedSettings);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await settingsService.get('theme');

      expect(result).toBe('dark');
    });

    it('should return default for missing setting', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await settingsService.get('units');

      expect(result).toBe(defaultSettings.units);
    });
  });

  describe('set', () => {
    it('should insert or update a setting', async () => {
      const mockOnConflictDoUpdate = jest.fn().mockResolvedValue([]);
      const mockValues = jest.fn().mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      await settingsService.set('theme', 'dark');

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('updateMany', () => {
    it('should update multiple settings', async () => {
      // Mock insert for each setting
      const mockOnConflictDoUpdate = jest.fn().mockResolvedValue([]);
      const mockValues = jest.fn().mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      await settingsService.updateMany({
        theme: 'dark',
        height: 72,
        gender: 'male',
      });

      // Should call insert for each setting
      expect(mockDb.insert).toHaveBeenCalledTimes(3);
    });
  });

  describe('isOnboardingCompleted', () => {
    it('should return true when onboarding is complete', async () => {
      const storedSettings = [{ key: 'onboardingCompleted', value: 'true' }];

      const mockWhere = jest.fn().mockResolvedValue(storedSettings);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await settingsService.isOnboardingCompleted();

      expect(result).toBe(true);
    });

    it('should return false when onboarding is not complete', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await settingsService.isOnboardingCompleted();

      expect(result).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboardingCompleted to true', async () => {
      const mockOnConflictDoUpdate = jest.fn().mockResolvedValue([]);
      const mockValues = jest.fn().mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      await settingsService.completeOnboarding();

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('initializeDefaults', () => {
    it('should initialize all default settings', async () => {
      const mockOnConflictDoNothing = jest.fn().mockResolvedValue([]);
      const mockValues = jest.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      await settingsService.initializeDefaults();

      // Should insert for each default setting
      expect(mockDb.insert).toHaveBeenCalledTimes(Object.keys(defaultSettings).length);
    });
  });
});

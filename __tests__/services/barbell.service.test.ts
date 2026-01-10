import { barbellService } from '@/services/barbell.service';
import { db } from '@/db/client';
import { barbells } from '@/db/schema';

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

describe('barbellService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all barbells sorted by name', async () => {
      const mockBarbells = [
        { id: '1', name: 'Olympic', weight: 45, isDefault: true },
        { id: '2', name: 'EZ Curl', weight: 25, isDefault: false },
        { id: '3', name: 'Trap Bar', weight: 55, isDefault: false },
      ];

      const mockOrderBy = jest.fn().mockResolvedValue(mockBarbells);
      const mockFrom = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await barbellService.getAll();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(barbells);
      expect(result).toEqual(mockBarbells);
    });
  });

  describe('getById', () => {
    it('should return a barbell by id', async () => {
      const mockBarbell = { id: '1', name: 'Olympic', weight: 45, isDefault: true };

      const mockWhere = jest.fn().mockResolvedValue([mockBarbell]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await barbellService.getById('1');

      expect(result).toEqual(mockBarbell);
    });

    it('should return undefined if barbell not found', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await barbellService.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('getDefault', () => {
    it('should return the default barbell', async () => {
      const mockBarbell = { id: '1', name: 'Olympic', weight: 45, isDefault: true };

      const mockWhere = jest.fn().mockResolvedValue([mockBarbell]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await barbellService.getDefault();

      expect(result).toEqual(mockBarbell);
    });
  });

  describe('create', () => {
    it('should create a new barbell', async () => {
      const newBarbell = { name: 'Safety Squat Bar', weight: 65, isDefault: false };
      const createdBarbell = { id: '4', ...newBarbell };

      const mockReturning = jest.fn().mockResolvedValue([createdBarbell]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await barbellService.create(newBarbell);

      expect(mockDb.insert).toHaveBeenCalledWith(barbells);
      expect(result).toEqual(createdBarbell);
    });

    it('should unset existing default when creating new default', async () => {
      const newBarbell = { name: 'New Default Bar', weight: 45, isDefault: true };
      const createdBarbell = { id: '5', ...newBarbell };

      // Mock unset existing default
      const mockUpdateWhere = jest.fn().mockResolvedValue([]);
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      // Mock insert
      const mockReturning = jest.fn().mockResolvedValue([createdBarbell]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await barbellService.create(newBarbell);

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(createdBarbell);
    });
  });

  describe('update', () => {
    it('should update an existing barbell', async () => {
      const updatedBarbell = { id: '1', name: 'Updated Olympic', weight: 45, isDefault: true };

      const mockReturning = jest.fn().mockResolvedValue([updatedBarbell]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await barbellService.update('1', { name: 'Updated Olympic' });

      expect(mockDb.update).toHaveBeenCalledWith(barbells);
      expect(result).toEqual(updatedBarbell);
    });
  });

  describe('delete', () => {
    it('should delete a barbell and return true', async () => {
      const mockReturning = jest.fn().mockResolvedValue([{ id: '1' }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await barbellService.delete('1');

      expect(result).toBe(true);
    });

    it('should return false if barbell not found', async () => {
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await barbellService.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('setDefault', () => {
    it('should unset current default and set new default', async () => {
      const updatedBarbell = { id: '2', name: 'Trap Bar', weight: 55, isDefault: true };

      const mockReturning = jest.fn().mockResolvedValue([updatedBarbell]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await barbellService.setDefault('2');

      // Should be called: once to unset all, once to unset again in update(), once to set new default
      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updatedBarbell);
    });
  });
});

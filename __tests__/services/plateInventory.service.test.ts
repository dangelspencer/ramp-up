import { plateInventoryService } from '@/services/plateInventory.service';
import { db } from '@/db/client';
import { plateInventory } from '@/db/schema';
import * as calculations from '@/utils/calculations';

// Mock the database
jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock calculations
jest.mock('@/utils/calculations', () => ({
  calculatePlates: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockCalculations = calculations as jest.Mocked<typeof calculations>;

describe('plateInventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all plates sorted by weight descending', async () => {
      const mockPlates = [
        { id: '1', weight: 25, count: 4 },
        { id: '2', weight: 45, count: 4 },
        { id: '3', weight: 10, count: 4 },
      ];

      const mockFrom = jest.fn().mockResolvedValue(mockPlates);
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await plateInventoryService.getAll();

      expect(result[0].weight).toBe(45);
      expect(result[1].weight).toBe(25);
      expect(result[2].weight).toBe(10);
    });
  });

  describe('getByWeight', () => {
    it('should return a plate by weight', async () => {
      const mockPlate = { id: '1', weight: 45, count: 4 };

      const mockWhere = jest.fn().mockResolvedValue([mockPlate]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await plateInventoryService.getByWeight(45);

      expect(result).toEqual(mockPlate);
    });

    it('should return undefined if plate not found', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await plateInventoryService.getByWeight(100);

      expect(result).toBeUndefined();
    });
  });

  describe('setPlateCount', () => {
    it('should update existing plate count', async () => {
      const existingPlate = { id: '1', weight: 45, count: 4 };
      const updatedPlate = { id: '1', weight: 45, count: 6 };

      // Mock getByWeight finding existing plate
      const mockWhere = jest.fn().mockResolvedValue([existingPlate]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // Mock update
      const mockReturning = jest.fn().mockResolvedValue([updatedPlate]);
      const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await plateInventoryService.setPlateCount(45, 6);

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updatedPlate);
    });

    it('should create new plate if not exists', async () => {
      const newPlate = { id: '5', weight: 35, count: 2 };

      // Mock getByWeight returning nothing
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // Mock insert
      const mockReturning = jest.fn().mockResolvedValue([newPlate]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await plateInventoryService.setPlateCount(35, 2);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(newPlate);
    });
  });

  describe('incrementCount', () => {
    it('should increment plate count by default amount (2)', async () => {
      const existingPlate = { id: '1', weight: 45, count: 4 };
      const updatedPlate = { id: '1', weight: 45, count: 6 };

      // Mock getByWeight
      const mockWhere = jest.fn().mockResolvedValue([existingPlate]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // Mock update
      const mockReturning = jest.fn().mockResolvedValue([updatedPlate]);
      const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await plateInventoryService.incrementCount(45);

      expect(result.count).toBe(6);
    });

    it('should increment by custom amount', async () => {
      const existingPlate = { id: '1', weight: 45, count: 4 };
      const updatedPlate = { id: '1', weight: 45, count: 8 };

      const mockWhere = jest.fn().mockResolvedValue([existingPlate]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const mockReturning = jest.fn().mockResolvedValue([updatedPlate]);
      const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await plateInventoryService.incrementCount(45, 4);

      expect(result.count).toBe(8);
    });
  });

  describe('decrementCount', () => {
    it('should decrement plate count with minimum of 0', async () => {
      const existingPlate = { id: '1', weight: 45, count: 1 };
      const updatedPlate = { id: '1', weight: 45, count: 0 };

      const mockWhere = jest.fn().mockResolvedValue([existingPlate]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const mockReturning = jest.fn().mockResolvedValue([updatedPlate]);
      const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await plateInventoryService.decrementCount(45);

      expect(result.count).toBe(0);
    });
  });

  describe('remove', () => {
    it('should remove a plate and return true', async () => {
      const mockReturning = jest.fn().mockResolvedValue([{ id: '1' }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await plateInventoryService.remove(45);

      expect(result).toBe(true);
    });

    it('should return false if plate not found', async () => {
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await plateInventoryService.remove(100);

      expect(result).toBe(false);
    });
  });

  describe('calculatePlatesForWeight', () => {
    it('should call calculatePlates with inventory', async () => {
      const mockInventory = [
        { id: '1', weight: 45, count: 4 },
        { id: '2', weight: 25, count: 4 },
        { id: '3', weight: 10, count: 4 },
      ];

      const mockFrom = jest.fn().mockResolvedValue(mockInventory);
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      mockCalculations.calculatePlates.mockReturnValue({
        platesPerSide: [{ weight: 45, count: 1 }],
        totalBarWeight: 45,
        achievableWeight: 135,
        isExact: true,
      });

      const result = await plateInventoryService.calculatePlatesForWeight(135, 45);

      expect(mockCalculations.calculatePlates).toHaveBeenCalledWith(
        135,
        45,
        expect.arrayContaining([
          { weight: 45, count: 4 },
          { weight: 25, count: 4 },
          { weight: 10, count: 4 },
        ])
      );
      expect(result.achievableWeight).toBe(135);
    });
  });

  describe('resetToDefaults', () => {
    it('should clear inventory and add default plates', async () => {
      // Mock delete
      (mockDb.delete as jest.Mock).mockResolvedValue([]);

      // Mock insert for each default plate
      const mockValues = jest.fn().mockResolvedValue([]);
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      await plateInventoryService.resetToDefaults();

      // Should delete all
      expect(mockDb.delete).toHaveBeenCalled();
      // Should insert 6 default plates
      expect(mockDb.insert).toHaveBeenCalledTimes(6);
    });
  });

  describe('updateMany', () => {
    it('should update multiple plates at once', async () => {
      const plates = [
        { weight: 45, count: 6 },
        { weight: 25, count: 4 },
      ];

      // Mock getByWeight returning existing plates
      const mockWhere = jest.fn().mockResolvedValue([{ weight: 45, count: 4 }]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // Mock update
      const mockReturning = jest.fn().mockResolvedValue([{ weight: 45, count: 6 }]);
      const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      await plateInventoryService.updateMany(plates);

      // Should be called for each plate
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });
  });
});

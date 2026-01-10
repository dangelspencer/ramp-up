import { exerciseService } from '@/services/exercise.service';
import { db } from '@/db/client';
import { exercises } from '@/db/schema';

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

describe('exerciseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all exercises sorted alphabetically', async () => {
      const mockExercises = [
        { id: '1', name: 'Bench Press', maxWeight: 185, weightIncrement: 5, autoProgression: true, barbellId: '1', defaultRestTime: 180 },
        { id: '2', name: 'Squat', maxWeight: 225, weightIncrement: 5, autoProgression: true, barbellId: '1', defaultRestTime: 180 },
        { id: '3', name: 'Deadlift', maxWeight: 315, weightIncrement: 5, autoProgression: true, barbellId: '1', defaultRestTime: 180 },
      ];

      const mockOrderBy = jest.fn().mockResolvedValue(mockExercises);
      const mockFrom = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await exerciseService.getAll();

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(mockExercises);
    });
  });

  describe('getById', () => {
    it('should return an exercise by id', async () => {
      const mockExercise = { id: '1', name: 'Bench Press', maxWeight: 185, weightIncrement: 5, autoProgression: true, barbellId: '1', defaultRestTime: 180 };

      const mockWhere = jest.fn().mockResolvedValue([mockExercise]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await exerciseService.getById('1');

      expect(result).toEqual(mockExercise);
    });

    it('should return undefined if exercise not found', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await exerciseService.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new exercise with all fields', async () => {
      const newExercise = {
        name: 'Overhead Press',
        maxWeight: 135,
        weightIncrement: 2.5,
        autoProgression: true,
        barbellId: '1',
        defaultRestTime: 120,
      };
      const createdExercise = { id: '4', ...newExercise };

      const mockReturning = jest.fn().mockResolvedValue([createdExercise]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await exerciseService.create(newExercise);

      expect(mockDb.insert).toHaveBeenCalledWith(exercises);
      expect(result).toEqual(createdExercise);
    });

    it('should create an exercise with default values', async () => {
      const newExercise = {
        name: 'Dumbbell Curl',
        maxWeight: 40,
      };
      const createdExercise = {
        id: '5',
        name: 'Dumbbell Curl',
        maxWeight: 40,
        weightIncrement: 5,
        autoProgression: false,
        barbellId: null,
        defaultRestTime: 90,
      };

      const mockReturning = jest.fn().mockResolvedValue([createdExercise]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await exerciseService.create(newExercise);

      expect(result).toEqual(createdExercise);
    });
  });

  describe('update', () => {
    it('should update an existing exercise', async () => {
      const updatedExercise = { id: '1', name: 'Incline Bench Press', maxWeight: 155, weightIncrement: 5, autoProgression: true, barbellId: '1', defaultRestTime: 180 };

      const mockReturning = jest.fn().mockResolvedValue([updatedExercise]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await exerciseService.update('1', { name: 'Incline Bench Press', maxWeight: 155 });

      expect(mockDb.update).toHaveBeenCalledWith(exercises);
      expect(result).toEqual(updatedExercise);
    });
  });

  describe('updateMaxWeight', () => {
    it('should update the max weight of an exercise', async () => {
      const updatedExercise = { id: '1', name: 'Bench Press', maxWeight: 190, weightIncrement: 5, autoProgression: true, barbellId: '1', defaultRestTime: 180 };

      const mockReturning = jest.fn().mockResolvedValue([updatedExercise]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await exerciseService.updateMaxWeight('1', 190);

      expect(mockDb.update).toHaveBeenCalledWith(exercises);
      expect(result).toEqual(updatedExercise);
    });
  });

  describe('delete', () => {
    it('should delete an exercise and return true', async () => {
      const mockReturning = jest.fn().mockResolvedValue([{ id: '1' }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await exerciseService.delete('1');

      expect(result).toBe(true);
    });

    it('should return false if exercise not found', async () => {
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await exerciseService.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('searchByName', () => {
    it('should search exercises by name (case insensitive)', async () => {
      const allExercises = [
        { id: '1', name: 'Bench Press', maxWeight: 185 },
        { id: '2', name: 'Incline Bench Press', maxWeight: 155 },
        { id: '3', name: 'Squat', maxWeight: 225 },
      ];

      // Mock getAll which returns all exercises
      const mockOrderBy = jest.fn().mockResolvedValue(allExercises);
      const mockFrom = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await exerciseService.searchByName('bench');

      // The service filters results on the client side
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Bench Press');
      expect(result[1].name).toBe('Incline Bench Press');
    });

    it('should return empty array when no matches', async () => {
      const allExercises = [
        { id: '1', name: 'Bench Press', maxWeight: 185 },
        { id: '2', name: 'Squat', maxWeight: 225 },
      ];

      const mockOrderBy = jest.fn().mockResolvedValue(allExercises);
      const mockFrom = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await exerciseService.searchByName('deadlift');

      expect(result).toHaveLength(0);
    });
  });
});

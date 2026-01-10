import { goalService, GoalProgress } from '@/services/goal.service';
import { db } from '@/db/client';
import { goals } from '@/db/schema';
import { workoutService } from '@/services/workout.service';

// Mock the database
jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock workoutService
jest.mock('@/services/workout.service', () => ({
  workoutService: {
    getWorkoutsThisWeek: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockWorkoutService = workoutService as jest.Mocked<typeof workoutService>;

describe('goalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to a Wednesday
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-10T12:00:00')); // Wednesday
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getActive', () => {
    it('should return the active goal', async () => {
      const mockGoal = {
        id: '1',
        workoutsPerWeek: 3,
        scheduledDays: '[1, 3, 5]',
        reminderTime: '08:00',
        startDate: '2024-01-01',
        currentStreak: 2,
        isActive: true,
        totalWeeks: null,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockGoal]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await goalService.getActive();

      expect(result).toEqual(mockGoal);
    });

    it('should return undefined if no active goal', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await goalService.getActive();

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new goal and deactivate existing ones', async () => {
      const mockCreatedGoal = {
        id: '2',
        workoutsPerWeek: 4,
        scheduledDays: '[1, 2, 4, 5]',
        reminderTime: '07:00',
        startDate: '2024-01-10',
        currentStreak: 0,
        isActive: true,
        totalWeeks: 12,
      };

      // Mock deactivating existing goals
      const mockUpdateWhere = jest.fn().mockResolvedValue([]);
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      // Mock inserting new goal
      const mockReturning = jest.fn().mockResolvedValue([mockCreatedGoal]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await goalService.create(4, [1, 2, 4, 5], '07:00', 12);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedGoal);
    });
  });

  describe('getProgress', () => {
    it('should return goal progress with correct calculations', async () => {
      const mockGoal = {
        id: '1',
        workoutsPerWeek: 3,
        scheduledDays: '[1, 3, 5]', // Mon, Wed, Fri
        reminderTime: '08:00',
        startDate: '2024-01-01',
        currentStreak: 2,
        isActive: true,
        totalWeeks: null,
      };

      // Mock getActive
      const mockWhere = jest.fn().mockResolvedValue([mockGoal]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // Mock workouts this week (2 workouts completed)
      mockWorkoutService.getWorkoutsThisWeek.mockResolvedValue([
        { id: 'w1' } as any,
        { id: 'w2' } as any,
      ]);

      const result = await goalService.getProgress();

      expect(result).not.toBeNull();
      expect(result!.workoutsThisWeek).toBe(2);
      expect(result!.workoutsTarget).toBe(3);
      expect(result!.streakWeeks).toBe(2);
      expect(result!.scheduledDays).toEqual([1, 3, 5]);
      // Next scheduled day from Wednesday (3) should be Friday (5)
      expect(result!.nextScheduledDay).toBe(3); // Wednesday is current day
    });

    it('should return null if no active goal', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await goalService.getProgress();

      expect(result).toBeNull();
    });
  });

  describe('isTodayScheduled', () => {
    it('should return true if today is a scheduled workout day', async () => {
      const mockGoal = {
        id: '1',
        workoutsPerWeek: 3,
        scheduledDays: '[1, 3, 5]', // Mon, Wed, Fri - Wednesday (3) is scheduled
        isActive: true,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockGoal]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await goalService.isTodayScheduled();

      expect(result).toBe(true);
    });

    it('should return false if today is not a scheduled workout day', async () => {
      const mockGoal = {
        id: '1',
        workoutsPerWeek: 2,
        scheduledDays: '[1, 5]', // Mon, Fri - Wednesday is NOT scheduled
        isActive: true,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockGoal]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await goalService.isTodayScheduled();

      expect(result).toBe(false);
    });

    it('should return false if no active goal', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await goalService.isTodayScheduled();

      expect(result).toBe(false);
    });
  });

  describe('checkAndUpdateStreak', () => {
    it('should increment streak when goal is met', async () => {
      const mockGoal = {
        id: '1',
        workoutsPerWeek: 3,
        scheduledDays: '[1, 3, 5]',
        currentStreak: 2,
        isActive: true,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockGoal]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // User completed 3+ workouts this week
      mockWorkoutService.getWorkoutsThisWeek.mockResolvedValue([
        { id: 'w1' } as any,
        { id: 'w2' } as any,
        { id: 'w3' } as any,
      ]);

      const mockUpdateWhere = jest.fn().mockResolvedValue([]);
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      await goalService.checkAndUpdateStreak();

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a goal and return true', async () => {
      const mockReturning = jest.fn().mockResolvedValue([{ id: '1' }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      (mockDb.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const result = await goalService.delete('1');

      expect(result).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a goal without deleting it', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (mockDb.update as jest.Mock).mockReturnValue({ set: mockSet });

      await goalService.deactivate('1');

      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});

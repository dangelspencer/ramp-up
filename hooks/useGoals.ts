import { useState, useEffect, useCallback } from 'react';
import { goalService, GoalProgress } from '@/services/goal.service';
import { Goal } from '@/db/schema';

export function useGoals() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [isTodayScheduled, setIsTodayScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadGoal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [goal, goalProgress, scheduled] = await Promise.all([
        goalService.getActive(),
        goalService.getProgress(),
        goalService.isTodayScheduled(),
      ]);
      setActiveGoal(goal ?? null);
      setProgress(goalProgress);
      setIsTodayScheduled(scheduled);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load goal'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  const createGoal = useCallback(async (
    workoutsPerWeek: number,
    scheduledDays: number[],
    reminderTime?: string,
    totalWeeks?: number
  ) => {
    const goal = await goalService.create(workoutsPerWeek, scheduledDays, reminderTime, totalWeeks);
    setActiveGoal(goal);
    // Refresh progress
    const [goalProgress, scheduled] = await Promise.all([
      goalService.getProgress(),
      goalService.isTodayScheduled(),
    ]);
    setProgress(goalProgress);
    setIsTodayScheduled(scheduled);
    return goal;
  }, []);

  const updateGoal = useCallback(async (
    id: string,
    updates: Parameters<typeof goalService.update>[1]
  ) => {
    const goal = await goalService.update(id, updates);
    if (goal) {
      setActiveGoal(goal);
      // Refresh progress
      const goalProgress = await goalService.getProgress();
      setProgress(goalProgress);
    }
    return goal;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const success = await goalService.delete(id);
    if (success && activeGoal?.id === id) {
      setActiveGoal(null);
      setProgress(null);
      setIsTodayScheduled(false);
    }
    return success;
  }, [activeGoal?.id]);

  const deactivateGoal = useCallback(async (id: string) => {
    await goalService.deactivate(id);
    if (activeGoal?.id === id) {
      setActiveGoal(null);
      setProgress(null);
      setIsTodayScheduled(false);
    }
  }, [activeGoal?.id]);

  const checkAndUpdateStreak = useCallback(async () => {
    await goalService.checkAndUpdateStreak();
    // Refresh data
    await loadGoal();
  }, [loadGoal]);

  return {
    activeGoal,
    progress,
    isTodayScheduled,
    isLoading,
    error,
    refresh: loadGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    deactivateGoal,
    checkAndUpdateStreak,
  };
}

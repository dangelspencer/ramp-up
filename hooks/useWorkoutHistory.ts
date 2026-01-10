import { useState, useCallback, useEffect } from 'react';
import { workoutService, WorkoutWithDetails } from '@/services/workout.service';

export function useWorkoutHistory(limit?: number) {
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const history = await workoutService.getHistory(limit);
      setWorkouts(history);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load workout history'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const refresh = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      await workoutService.delete(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to delete workout'));
    }
  }, []);

  return {
    workouts,
    isLoading,
    error,
    refresh,
    deleteWorkout,
  };
}

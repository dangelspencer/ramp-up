import { useState, useEffect, useCallback } from 'react';
import { routineService, RoutineWithDetails, RoutineExerciseInput } from '@/services/routine.service';
import { Routine } from '@/db/schema';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRoutines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await routineService.getAll();
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load routines'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const createRoutine = useCallback(async (name: string, exercises: RoutineExerciseInput[] = []) => {
    const routine = await routineService.create(name, exercises);
    setRoutines((prev) => [...prev, routine]);
    return routine;
  }, []);

  const updateRoutine = useCallback(async (id: string, name: string, exercises: RoutineExerciseInput[]) => {
    await routineService.updateName(id, name);
    await routineService.updateExercises(id, exercises);
    // Update local name
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteRoutine = useCallback(async (id: string) => {
    const success = await routineService.delete(id);
    if (success) {
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    }
    return success;
  }, []);

  const duplicateRoutine = useCallback(async (id: string, newName: string) => {
    const routine = await routineService.duplicate(id, newName);
    if (routine) {
      setRoutines((prev) => [...prev, routine]);
    }
    return routine;
  }, []);

  return {
    routines,
    isLoading,
    error,
    refresh: loadRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
  };
}

export function useRoutine(id: string | null) {
  const [routine, setRoutine] = useState<RoutineWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRoutine = useCallback(async () => {
    if (!id) {
      setRoutine(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await routineService.getByIdWithDetails(id);
      setRoutine(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load routine'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const updateName = useCallback(async (name: string) => {
    if (!id) return undefined;
    const updated = await routineService.updateName(id, name);
    if (updated) {
      setRoutine((prev) => prev ? { ...prev, ...updated } : null);
    }
    return updated;
  }, [id]);

  const updateExercises = useCallback(async (exercises: RoutineExerciseInput[]) => {
    if (!id) return;
    await routineService.updateExercises(id, exercises);
    await loadRoutine(); // Reload to get updated data
  }, [id, loadRoutine]);

  return {
    routine,
    isLoading,
    error,
    refresh: loadRoutine,
    updateName,
    updateExercises,
  };
}

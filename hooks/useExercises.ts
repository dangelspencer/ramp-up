import { useState, useEffect, useCallback } from 'react';
import { exerciseService } from '@/services/exercise.service';
import { Exercise } from '@/db/schema';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await exerciseService.getAll();
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load exercises'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const createExercise = useCallback(async (data: Parameters<typeof exerciseService.create>[0]) => {
    const exercise = await exerciseService.create(data);
    setExercises((prev) => [...prev, exercise].sort((a, b) => a.name.localeCompare(b.name)));
    return exercise;
  }, []);

  const updateExercise = useCallback(async (id: string, updates: Parameters<typeof exerciseService.update>[1]) => {
    const exercise = await exerciseService.update(id, updates);
    if (exercise) {
      setExercises((prev) => prev.map((e) => (e.id === id ? exercise : e)));
    }
    return exercise;
  }, []);

  const deleteExercise = useCallback(async (id: string) => {
    const success = await exerciseService.delete(id);
    if (success) {
      setExercises((prev) => prev.filter((e) => e.id !== id));
    }
    return success;
  }, []);

  const searchExercises = useCallback(async (query: string) => {
    return exerciseService.searchByName(query);
  }, []);

  return {
    exercises,
    isLoading,
    error,
    refresh: loadExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
  };
}

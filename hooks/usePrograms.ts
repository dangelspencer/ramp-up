import { useState, useEffect, useCallback } from 'react';
import { programService, ProgramWithRoutines } from '@/services/program.service';
import { Program } from '@/db/schema';

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<ProgramWithRoutines | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allPrograms, active] = await Promise.all([
        programService.getAll(),
        programService.getActiveWithRoutines(),
      ]);
      setPrograms(allPrograms);
      setActiveProgram(active ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load programs'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const createProgram = useCallback(async (
    name: string,
    type: 'continuous' | 'finite',
    routineIds: string[],
    totalWorkouts?: number
  ) => {
    const program = await programService.create(name, type, routineIds, totalWorkouts);
    setPrograms((prev) => [...prev, program]);
    return program;
  }, []);

  const setActive = useCallback(async (id: string) => {
    await programService.setActive(id);
    const active = await programService.getActiveWithRoutines();
    setActiveProgram(active ?? null);
    // Update local state
    setPrograms((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === id,
      }))
    );
  }, []);

  const deleteProgram = useCallback(async (id: string) => {
    const success = await programService.delete(id);
    if (success) {
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      if (activeProgram?.id === id) {
        setActiveProgram(null);
      }
    }
    return success;
  }, [activeProgram?.id]);

  const getNextRoutine = useCallback(async () => {
    if (!activeProgram) return null;
    const routineId = await programService.getNextRoutineId(activeProgram.id);
    return routineId;
  }, [activeProgram]);

  return {
    programs,
    activeProgram,
    isLoading,
    error,
    refresh: loadPrograms,
    createProgram,
    setActive,
    deleteProgram,
    getNextRoutine,
  };
}

export function useProgram(id: string | null) {
  const [program, setProgram] = useState<ProgramWithRoutines | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProgram = useCallback(async () => {
    if (!id) {
      setProgram(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await programService.getByIdWithRoutines(id);
      setProgram(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load program'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  return {
    program,
    isLoading,
    error,
    refresh: loadProgram,
  };
}

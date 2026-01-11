import { useState, useEffect, useCallback } from 'react';
import { barbellService } from '@/services/barbell.service';
import { Barbell } from '@/db/schema';

export function useBarbells() {
  const [barbells, setBarbells] = useState<Barbell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBarbells = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await barbellService.getAll();
      setBarbells(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load barbells'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBarbells();
  }, [loadBarbells]);

  const createBarbell = useCallback(async (data: { name: string; weight: number; description?: string; displayOrder?: number; isDefault?: boolean }) => {
    const barbell = await barbellService.create(data);
    setBarbells((prev) => [...prev, barbell].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)));
    return barbell;
  }, []);

  const updateBarbell = useCallback(async (id: string, updates: { name?: string; weight?: number; description?: string; displayOrder?: number; isDefault?: boolean }) => {
    const barbell = await barbellService.update(id, updates);
    if (barbell) {
      setBarbells((prev) => prev.map((b) => (b.id === id ? barbell : b)));
    }
    return barbell;
  }, []);

  const deleteBarbell = useCallback(async (id: string) => {
    const success = await barbellService.delete(id);
    if (success) {
      setBarbells((prev) => prev.filter((b) => b.id !== id));
    }
    return success;
  }, []);

  const setDefault = useCallback(async (id: string) => {
    const barbell = await barbellService.setDefault(id);
    if (barbell) {
      setBarbells((prev) =>
        prev.map((b) => ({
          ...b,
          isDefault: b.id === id,
        }))
      );
    }
    return barbell;
  }, []);

  const getDefault = useCallback(() => {
    return barbells.find((b) => b.isDefault);
  }, [barbells]);

  return {
    barbells,
    isLoading,
    error,
    refresh: loadBarbells,
    createBarbell,
    updateBarbell,
    deleteBarbell,
    setDefault,
    getDefault,
  };
}

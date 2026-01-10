import { useState, useEffect, useCallback } from 'react';
import { plateInventoryService } from '@/services/plateInventory.service';
import { PlateInventoryItem } from '@/db/schema';

export function usePlateInventory() {
  const [plates, setPlates] = useState<PlateInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPlates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await plateInventoryService.getAll();
      setPlates(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load plates'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlates();
  }, [loadPlates]);

  const setPlateCount = useCallback(async (weight: number, count: number) => {
    const plate = await plateInventoryService.setPlateCount(weight, count);
    setPlates((prev) => {
      const existing = prev.find((p) => p.weight === weight);
      if (existing) {
        return prev.map((p) => (p.weight === weight ? plate : p)).sort((a, b) => b.weight - a.weight);
      }
      return [...prev, plate].sort((a, b) => b.weight - a.weight);
    });
    return plate;
  }, []);

  const incrementCount = useCallback(async (weight: number) => {
    const plate = await plateInventoryService.incrementCount(weight);
    setPlates((prev) =>
      prev.map((p) => (p.weight === weight ? plate : p))
    );
    return plate;
  }, []);

  const decrementCount = useCallback(async (weight: number) => {
    const plate = await plateInventoryService.decrementCount(weight);
    setPlates((prev) =>
      prev.map((p) => (p.weight === weight ? plate : p))
    );
    return plate;
  }, []);

  const removePlate = useCallback(async (weight: number) => {
    const success = await plateInventoryService.remove(weight);
    if (success) {
      setPlates((prev) => prev.filter((p) => p.weight !== weight));
    }
    return success;
  }, []);

  const resetToDefaults = useCallback(async () => {
    await plateInventoryService.resetToDefaults();
    await loadPlates();
  }, [loadPlates]);

  return {
    plates,
    isLoading,
    error,
    refresh: loadPlates,
    setPlateCount,
    incrementCount,
    decrementCount,
    removePlate,
    resetToDefaults,
  };
}

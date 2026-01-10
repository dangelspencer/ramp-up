import { useState, useEffect, useCallback } from 'react';
import { bodyCompositionService, BodyCompositionInput } from '@/services/bodyComposition.service';
import { BodyComposition } from '@/db/schema';

export function useBodyComposition() {
  const [entries, setEntries] = useState<BodyComposition[]>([]);
  const [latest, setLatest] = useState<BodyComposition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [all, latestEntry] = await Promise.all([
        bodyCompositionService.getAll(),
        bodyCompositionService.getLatest(),
      ]);
      setEntries(all);
      setLatest(latestEntry ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load body composition'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const createEntry = useCallback(async (input: BodyCompositionInput) => {
    const entry = await bodyCompositionService.create(input);
    setEntries((prev) => [entry, ...prev]);
    setLatest(entry);
    return entry;
  }, []);

  const updateEntry = useCallback(async (id: string, input: BodyCompositionInput) => {
    const entry = await bodyCompositionService.update(id, input);
    if (entry) {
      setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)));
      if (latest?.id === id) {
        setLatest(entry);
      }
    }
    return entry;
  }, [latest?.id]);

  const deleteEntry = useCallback(async (id: string) => {
    const success = await bodyCompositionService.delete(id);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (latest?.id === id) {
        const newLatest = entries.find((e) => e.id !== id);
        setLatest(newLatest ?? null);
      }
    }
    return success;
  }, [entries, latest?.id]);

  const getEntriesInRange = useCallback(async (startDate: string, endDate: string) => {
    return bodyCompositionService.getInRange(startDate, endDate);
  }, []);

  return {
    entries,
    latest,
    isLoading,
    error,
    refresh: loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntriesInRange,
  };
}

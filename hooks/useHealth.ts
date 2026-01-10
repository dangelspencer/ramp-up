import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { healthService, HealthData } from '@/services/health.service';

export function useHealth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAvailability = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setIsAvailable(false);
      setIsLoading(false);
      setHasPermission(false);
      return false;
    }
    const available = await healthService.isAvailable();
    setIsAvailable(available);
    setIsLoading(false);
    return available;
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const requestPermissions = useCallback(async () => {
    if (!isAvailable) return false;
    setIsLoading(true);
    try {
      const granted = await healthService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request health permissions:', error);
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  const syncBodyComposition = useCallback(async (data: HealthData) => {
    if (!isAvailable || !hasPermission) return false;
    return healthService.syncBodyComposition(data);
  }, [isAvailable, hasPermission]);

  const writeWeight = useCallback(async (weightLbs: number, date?: Date) => {
    if (!isAvailable || !hasPermission) return false;
    return healthService.writeWeight(weightLbs, date);
  }, [isAvailable, hasPermission]);

  const writeBodyFat = useCallback(async (percentage: number, date?: Date) => {
    if (!isAvailable || !hasPermission) return false;
    return healthService.writeBodyFat(percentage, date);
  }, [isAvailable, hasPermission]);

  const writeLeanBodyMass = useCallback(async (massLbs: number, date?: Date) => {
    if (!isAvailable || !hasPermission) return false;
    return healthService.writeLeanBodyMass(massLbs, date);
  }, [isAvailable, hasPermission]);

  const readHeight = useCallback(async () => {
    if (!isAvailable || !hasPermission) return null;
    return healthService.readHeight();
  }, [isAvailable, hasPermission]);

  return {
    isAvailable,
    hasPermission,
    isLoading,
    requestPermissions,
    syncBodyComposition,
    writeWeight,
    writeBodyFat,
    writeLeanBodyMass,
    readHeight,
  };
}

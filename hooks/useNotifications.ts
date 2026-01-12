import { useState, useEffect, useCallback } from 'react';
import { notificationService, WorkoutReminderSchedule } from '@/services/notification.service';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const enabled = await notificationService.areNotificationsEnabled();
      setHasPermission(enabled);
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestPermissions = useCallback(async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  const scheduleWorkoutReminders = useCallback(async (schedule: WorkoutReminderSchedule) => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }
    await notificationService.scheduleWorkoutReminders(schedule);
    return true;
  }, [hasPermission, requestPermissions]);

  const cancelWorkoutReminders = useCallback(async () => {
    await notificationService.cancelWorkoutReminders();
  }, []);

  const scheduleMeasurementReminder = useCallback(async (
    frequency: 'daily' | 'weekly',
    hour: number,
    minute: number,
    dayOfWeek?: number
  ) => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }
    await notificationService.scheduleMeasurementReminder(frequency, hour, minute, dayOfWeek);
    return true;
  }, [hasPermission, requestPermissions]);

  const cancelMeasurementReminders = useCallback(async () => {
    await notificationService.cancelMeasurementReminders();
  }, []);

  const sendWorkoutCompleteNotification = useCallback(async (
    workoutName: string,
    progressionResults?: Array<{ exerciseName: string; oldMax: number; newMax: number }>
  ) => {
    if (!hasPermission) return;
    await notificationService.sendWorkoutCompleteNotification(workoutName, progressionResults);
  }, [hasPermission]);

  const sendProgressionNotification = useCallback(async (
    exerciseName: string,
    oldMax: number,
    newMax: number,
    units: 'imperial' | 'metric'
  ) => {
    if (!hasPermission) return;
    await notificationService.sendProgressionNotification(exerciseName, oldMax, newMax, units);
  }, [hasPermission]);

  const sendProgramCompleteNotification = useCallback(async (programName: string) => {
    if (!hasPermission) return;
    await notificationService.sendProgramCompleteNotification(programName);
  }, [hasPermission]);

  return {
    hasPermission,
    isLoading,
    requestPermissions,
    checkPermissions,
    scheduleWorkoutReminders,
    cancelWorkoutReminders,
    scheduleMeasurementReminder,
    cancelMeasurementReminders,
    sendWorkoutCompleteNotification,
    sendProgressionNotification,
    sendProgramCompleteNotification,
  };
}

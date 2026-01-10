import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { settingsService } from './settings.service';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface WorkoutReminderSchedule {
  days: number[]; // 0-6 (Sunday-Saturday)
  hour: number;
  minute: number;
}

export const notificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Schedule workout reminder notifications
   */
  async scheduleWorkoutReminders(schedule: WorkoutReminderSchedule): Promise<void> {
    // Cancel existing workout reminders first
    await this.cancelWorkoutReminders();

    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled || !settings.workoutRemindersEnabled) {
      return;
    }

    // Schedule for each day
    for (const day of schedule.days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Train!',
          body: "Don't forget your workout today. Stay consistent and keep progressing!",
          sound: true,
          data: { type: 'workout_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1, // Expo uses 1-7 (Sunday = 1)
          hour: schedule.hour,
          minute: schedule.minute,
        },
        identifier: `workout-reminder-${day}`,
      });
    }
  },

  /**
   * Cancel all workout reminder notifications
   */
  async cancelWorkoutReminders(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith('workout-reminder-')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  /**
   * Schedule measurement reminder notification
   */
  async scheduleMeasurementReminder(
    frequency: 'daily' | 'weekly',
    hour: number,
    minute: number,
    dayOfWeek?: number
  ): Promise<void> {
    // Cancel existing measurement reminders first
    await this.cancelMeasurementReminders();

    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled || !settings.measurementRemindersEnabled) {
      return;
    }

    if (frequency === 'daily') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Measurement Reminder',
          body: 'Time to log your body composition measurements.',
          sound: true,
          data: { type: 'measurement_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
        identifier: 'measurement-reminder-daily',
      });
    } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Measurement Reminder',
          body: 'Time to log your body composition measurements.',
          sound: true,
          data: { type: 'measurement_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dayOfWeek + 1,
          hour,
          minute,
        },
        identifier: 'measurement-reminder-weekly',
      });
    }
  },

  /**
   * Cancel all measurement reminder notifications
   */
  async cancelMeasurementReminders(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith('measurement-reminder-')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  /**
   * Send immediate workout completion notification
   */
  async sendWorkoutCompleteNotification(
    workoutName: string,
    progressionResults?: Array<{ exerciseName: string; oldMax: number; newMax: number }>
  ): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled) {
      return;
    }

    let body = `Great job completing ${workoutName}!`;
    if (progressionResults && progressionResults.length > 0) {
      const progressCount = progressionResults.length;
      body += ` You progressed on ${progressCount} exercise${progressCount > 1 ? 's' : ''}!`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Workout Complete!',
        body,
        sound: true,
        data: { type: 'workout_complete' },
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Send auto-progression notification
   */
  async sendProgressionNotification(
    exerciseName: string,
    oldMax: number,
    newMax: number,
    units: 'imperial' | 'metric'
  ): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled) {
      return;
    }

    const unitLabel = units === 'imperial' ? 'lbs' : 'kg';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Personal Record!',
        body: `${exerciseName} max increased from ${oldMax} to ${newMax} ${unitLabel}!`,
        sound: true,
        data: { type: 'progression', exerciseName, oldMax, newMax },
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Send program completion notification
   */
  async sendProgramCompleteNotification(programName: string): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Program Complete!',
        body: `Congratulations! You've finished ${programName}. Time to start a new challenge!`,
        sound: true,
        data: { type: 'program_complete', programName },
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },
};

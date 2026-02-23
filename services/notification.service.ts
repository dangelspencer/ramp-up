import * as Notifications from 'expo-notifications';
import { settingsService } from './settings.service';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
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
   * Schedule rest timer complete notification
   */
  async scheduleRestTimerNotification(seconds: number): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled) {
      return;
    }

    // Cancel any existing rest timer notification first
    await this.cancelRestTimerNotification();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest Complete',
        body: 'Time for your next set!',
        sound: true,
        data: { type: 'rest_timer_complete' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
      identifier: 'rest-timer',
    });
  },

  /**
   * Cancel rest timer notification
   */
  async cancelRestTimerNotification(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync('rest-timer');
    } catch {
      // Notification may not exist, ignore error
    }
  },

  /**
   * Schedule weekly goal celebration notification
   */
  async scheduleGoalCelebrationNotification(
    dayOfWeek: number,
    hour: number,
    minute: number
  ): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled || !settings.goalNotificationsEnabled) {
      return;
    }

    // Cancel any existing goal notification first
    await this.cancelGoalNotifications();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Goal Achieved!',
        body: "You crushed it this week! Keep the momentum going!",
        sound: true,
        data: { type: 'goal_celebration' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday = 1)
        hour,
        minute,
      },
      identifier: 'goal-celebration',
    });
  },

  /**
   * Schedule weekly goal encouragement notification (for when goal is missed)
   */
  async scheduleGoalEncouragementNotification(
    dayOfWeek: number,
    hour: number,
    minute: number
  ): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled || !settings.goalNotificationsEnabled) {
      return;
    }

    // Cancel any existing goal notification first
    await this.cancelGoalNotifications();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Week, Fresh Start!',
        body: "Let's make this week count. You've got this!",
        sound: true,
        data: { type: 'goal_encouragement' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday = 1)
        hour,
        minute,
      },
      identifier: 'goal-encouragement',
    });
  },

  /**
   * Send immediate goal achieved notification
   */
  async sendGoalAchievedNotification(workoutsCompleted: number): Promise<void> {
    const settings = await settingsService.getAll();
    if (!settings.notificationsEnabled || !settings.goalNotificationsEnabled) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Goal Achieved!',
        body: `Amazing! You completed ${workoutsCompleted} workout${workoutsCompleted !== 1 ? 's' : ''} this week. Keep up the great work!`,
        sound: true,
        data: { type: 'goal_achieved' },
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Cancel all goal-related notifications
   */
  async cancelGoalNotifications(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync('goal-celebration');
    } catch {
      // Notification may not exist, ignore error
    }
    try {
      await Notifications.cancelScheduledNotificationAsync('goal-encouragement');
    } catch {
      // Notification may not exist, ignore error
    }
  },

  /**
   * Sync all scheduled notifications with current settings.
   * Call on app startup and whenever notification-related settings change.
   */
  async syncAllNotifications(goalScheduledDays?: number[]): Promise<void> {
    const settings = await settingsService.getAll();

    if (!settings.notificationsEnabled) {
      await this.cancelAllNotifications();
      return;
    }

    // Workout reminders
    if (settings.workoutRemindersEnabled) {
      const [hourStr, minuteStr] = settings.workoutReminderTime.split(':');
      const days = goalScheduledDays ?? [0, 1, 2, 3, 4, 5, 6];
      await this.scheduleWorkoutReminders({
        days,
        hour: parseInt(hourStr, 10),
        minute: parseInt(minuteStr, 10),
      });
    } else {
      await this.cancelWorkoutReminders();
    }

    // Measurement reminders
    if (settings.measurementRemindersEnabled) {
      const [hourStr, minuteStr] = settings.measurementReminderTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const dayOfWeek = settings.measurementReminderFrequency === 'weekly' ? 1 : undefined; // Monday default
      await this.scheduleMeasurementReminder(
        settings.measurementReminderFrequency === 'daily' ? 'daily' : 'weekly',
        hour,
        minute,
        dayOfWeek,
      );
    } else {
      await this.cancelMeasurementReminders();
    }

    // Goal notifications
    if (!settings.goalNotificationsEnabled) {
      await this.cancelGoalNotifications();
    }
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

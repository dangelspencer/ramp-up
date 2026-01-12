import { setAudioModeAsync } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import { settingsService } from '@/services/settings.service';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Audio utilities for workout sounds
 * Uses notifications for reliable background audio alerts
 */
export const audio = {
  /**
   * Initialize audio settings for background playback
   */
  async initialize() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldPlayInBackground: true,
      });

      // Request notification permissions for background alerts
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('timer', {
          name: 'Rest Timer',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },

  /**
   * Play the rest timer complete sound
   * Uses notification for reliable background playback
   */
  async playTimerComplete() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerAudio) return;

    try {
      // Use local notification for reliable sound playback (works in background)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rest Complete',
          body: 'Time to start your next set!',
          sound: true,
          priority: 'high',
          ...(Platform.OS === 'android' && { channelId: 'timer' }),
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.log('Timer notification failed:', error);
    }
  },

  /**
   * Play a countdown tick sound (for last few seconds)
   * Uses haptics as fallback since ticks are frequent
   */
  async playTick() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerAudio) return;

    // Tick sounds are handled by haptics in RestTimer component
    // We don't want notification spam for ticks
  },

  /**
   * Play success sound (workout complete, progression)
   */
  async playSuccess() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerAudio) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Great Job!',
          body: 'Workout completed successfully!',
          sound: true,
          priority: 'high',
          ...(Platform.OS === 'android' && { channelId: 'timer' }),
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Success notification failed:', error);
    }
  },

  /**
   * Clean up - dismiss any pending notifications
   */
  async cleanup() {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
  },
};

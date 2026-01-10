import * as Haptics from 'expo-haptics';
import { settingsService } from '@/services/settings.service';

/**
 * Haptic feedback utilities
 * Respects user's haptic settings preference
 */
export const haptics = {
  /**
   * Light impact - for small interactions like button presses
   */
  async light() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Medium impact - for medium interactions like completing a set
   */
  async medium() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Heavy impact - for significant interactions like rest timer complete
   */
  async heavy() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Selection feedback - for UI selections
   */
  async selection() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.selectionAsync();
  },

  /**
   * Success notification - for successful actions
   */
  async success() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Warning notification - for warnings
   */
  async warning() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Error notification - for errors
   */
  async error() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Set complete - specific pattern for completing a set
   */
  async setComplete() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Workout complete - specific pattern for finishing a workout
   */
  async workoutComplete() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Rest timer tick - light pulse for timer countdown
   */
  async timerTick() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Rest timer complete - strong feedback when rest is over
   */
  async timerComplete() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerHaptic) return;
    // Double haptic for emphasis
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
};

// Mock for expo-notifications
export const setNotificationHandler = jest.fn();
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('mock-notification-id');
export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);
export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);
export const getAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([]);
export const getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const getBadgeCountAsync = jest.fn().mockResolvedValue(0);
export const setBadgeCountAsync = jest.fn().mockResolvedValue(true);
export const getPresentedNotificationsAsync = jest.fn().mockResolvedValue([]);
export const dismissNotificationAsync = jest.fn().mockResolvedValue(undefined);
export const dismissAllNotificationsAsync = jest.fn().mockResolvedValue(undefined);

// Types
export const AndroidImportance = {
  DEFAULT: 3,
  HIGH: 4,
  LOW: 2,
  MAX: 5,
  MIN: 1,
  NONE: 0,
};

export const AndroidNotificationPriority = {
  DEFAULT: 'default',
  HIGH: 'high',
  LOW: 'low',
  MAX: 'max',
  MIN: 'min',
};

export default {
  setNotificationHandler,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  getBadgeCountAsync,
  setBadgeCountAsync,
  getPresentedNotificationsAsync,
  dismissNotificationAsync,
  dismissAllNotificationsAsync,
  AndroidImportance,
  AndroidNotificationPriority,
};

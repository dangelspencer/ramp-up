import { Platform } from 'react-native';

// Health types we want to read/write
export interface HealthPermissions {
  read: string[];
  write: string[];
}

export interface HealthData {
  weight?: number;
  bodyFatPercentage?: number;
  leanBodyMass?: number;
  height?: number;
}

// Type for health service - different implementation for iOS vs other platforms
interface HealthService {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  checkPermissions(): Promise<boolean>;
  writeWeight(weightLbs: number, date?: Date): Promise<boolean>;
  writeBodyFat(percentage: number, date?: Date): Promise<boolean>;
  writeLeanBodyMass(massLbs: number, date?: Date): Promise<boolean>;
  readHeight(): Promise<number | null>;
  syncBodyComposition(data: HealthData): Promise<boolean>;
}

// Create a platform-specific implementation
function createHealthService(): HealthService {
  // Only import and use HealthKit on iOS
  if (Platform.OS === 'ios') {
    // Dynamic import to prevent crash on non-iOS platforms
    let AppleHealthKit: typeof import('react-native-health').default;
    let HealthPermission: typeof import('react-native-health').HealthPermission;
    try {
       
      const healthKit = require('react-native-health');
      AppleHealthKit = healthKit.default;
      HealthPermission = healthKit.HealthPermission;
    } catch {
      // Fall through to stub implementation
      return createStubService();
    }

    return {
      async isAvailable(): Promise<boolean> {
        return new Promise((resolve) => {
          if (!AppleHealthKit.isAvailable) {
            resolve(true); // Assume available if method doesn't exist
            return;
          }
          AppleHealthKit.isAvailable((_error: object, result: boolean) => {
            resolve(result);
          });
        });
      },

      async requestPermissions(): Promise<boolean> {
        return new Promise((resolve) => {
          const permissions = {
            permissions: {
              read: [HealthPermission.Height],
              write: [
                HealthPermission.BodyMass,
                HealthPermission.BodyFatPercentage,
                HealthPermission.LeanBodyMass,
              ],
            },
          };

          AppleHealthKit.initHealthKit(permissions, (error: string | null) => {
            if (error) {
              console.error('HealthKit initialization error:', error);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });
      },

      async checkPermissions(): Promise<boolean> {
        // HealthKit doesn't have a direct way to check all permissions
        // We assume permissions are granted if initialization was successful
        return this.isAvailable();
      },

      async writeWeight(weightLbs: number, date?: Date): Promise<boolean> {
        return new Promise((resolve) => {
          const dateStr = (date ?? new Date()).toISOString();
          AppleHealthKit.saveWeight(
            {
              value: weightLbs,
              startDate: dateStr,
            },
            (error: string | null) => {
              if (error) {
                console.error('Failed to save weight:', error);
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
        });
      },

      async writeBodyFat(percentage: number, date?: Date): Promise<boolean> {
        return new Promise((resolve) => {
          const dateStr = (date ?? new Date()).toISOString();
          AppleHealthKit.saveBodyFatPercentage(
            {
              value: percentage,
              startDate: dateStr,
            },
            (error: string | null) => {
              if (error) {
                console.error('Failed to save body fat:', error);
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
        });
      },

      async writeLeanBodyMass(massLbs: number, date?: Date): Promise<boolean> {
        return new Promise((resolve) => {
          const dateStr = (date ?? new Date()).toISOString();
          AppleHealthKit.saveLeanBodyMass(
            {
              value: massLbs,
              startDate: dateStr,
            },
            (error: string | null) => {
              if (error) {
                console.error('Failed to save lean body mass:', error);
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
        });
      },

      async readHeight(): Promise<number | null> {
        return new Promise((resolve) => {
          AppleHealthKit.getLatestHeight(
            {},
            (error: string | null, result: { value: number } | null) => {
              if (error || !result) {
                resolve(null);
              } else {
                resolve(result.value);
              }
            }
          );
        });
      },

      async syncBodyComposition(data: HealthData): Promise<boolean> {
        const results: boolean[] = [];

        if (data.weight !== undefined) {
          results.push(await this.writeWeight(data.weight));
        }
        if (data.bodyFatPercentage !== undefined) {
          results.push(await this.writeBodyFat(data.bodyFatPercentage));
        }
        if (data.leanBodyMass !== undefined) {
          results.push(await this.writeLeanBodyMass(data.leanBodyMass));
        }

        return results.every((r) => r);
      },
    };
  }

  return createStubService();
}

// Stub implementation for non-iOS platforms
function createStubService(): HealthService {
  return {
    isAvailable: async () => false,
    requestPermissions: async () => false,
    checkPermissions: async () => false,
    writeWeight: async () => false,
    writeBodyFat: async () => false,
    writeLeanBodyMass: async () => false,
    readHeight: async () => null,
    syncBodyComposition: async () => false,
  };
}

export const healthService = createHealthService();

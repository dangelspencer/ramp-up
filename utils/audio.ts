import { Audio } from 'expo-av';
import { settingsService } from '@/services/settings.service';

// Sound references - loaded on demand
let timerCompleteSound: Audio.Sound | null = null;
let tickSound: Audio.Sound | null = null;

/**
 * Audio utilities for workout sounds
 * Respects user's audio settings preference
 */
export const audio = {
  /**
   * Initialize audio settings for background playback
   */
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },

  /**
   * Play the rest timer complete sound
   */
  async playTimerComplete() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerAudio) return;

    try {
      // Unload previous sound if exists
      if (timerCompleteSound) {
        await timerCompleteSound.unloadAsync();
        timerCompleteSound = null;
      }

      // Create and play new sound
      // Using a built-in system sound approach - in production you'd bundle a custom sound
      const { sound } = await Audio.Sound.createAsync(
        // In production, you would use: require('@/assets/sounds/timer-complete.mp3')
        // For now, we'll create a simple beep using oscillator (not available in expo-av)
        // Instead, we rely on the system sound or notification
        { uri: 'asset:/sounds/timer-complete.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      timerCompleteSound = sound;

      // Clean up after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          timerCompleteSound = null;
        }
      });
    } catch (error) {
      // Fallback: no sound plays, but no crash
      console.log('Timer sound not available');
    }
  },

  /**
   * Play a countdown tick sound (for last few seconds)
   */
  async playTick() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerAudio) return;

    try {
      // Clean up previous tick sound
      if (tickSound) {
        await tickSound.unloadAsync();
        tickSound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'asset:/sounds/tick.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );
      tickSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          tickSound = null;
        }
      });
    } catch (error) {
      // Fallback: no sound plays
      console.log('Tick sound not available');
    }
  },

  /**
   * Play success sound (workout complete, progression)
   */
  async playSuccess() {
    const settings = await settingsService.getAll();
    if (!settings.restTimerAudio) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'asset:/sounds/success.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Success sound not available');
    }
  },

  /**
   * Clean up all sounds
   */
  async cleanup() {
    try {
      if (timerCompleteSound) {
        await timerCompleteSound.unloadAsync();
        timerCompleteSound = null;
      }
      if (tickSound) {
        await tickSound.unloadAsync();
        tickSound = null;
      }
    } catch (error) {
      console.error('Failed to cleanup audio:', error);
    }
  },
};

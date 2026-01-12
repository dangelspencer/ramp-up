import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react-native';
import { CircularProgress } from '@/components/ui';
import { formatRestTime } from '@/utils/formatting';
import { haptics } from '@/utils/haptics';
import { audio } from '@/utils/audio';

interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onSkip: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function RestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  onSkip,
  onPause,
  onResume,
  onReset,
  onComplete,
  size = 'md',
}: RestTimerProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const previousSecondsRef = useRef(remainingSeconds);

  // Handle timer countdown effects
  useEffect(() => {
    // Timer complete
    if (remainingSeconds === 0 && previousSecondsRef.current > 0 && isRunning) {
      haptics.timerComplete();
      audio.playTimerComplete();
      onComplete?.();
    }
    // Countdown ticks for last 3 seconds
    else if (remainingSeconds > 0 && remainingSeconds <= 3 && isRunning && remainingSeconds !== previousSecondsRef.current) {
      haptics.timerTick();
      audio.playTick();
    }
    previousSecondsRef.current = remainingSeconds;
  }, [remainingSeconds, isRunning, onComplete]);

  // Progress starts at 100% (full) and drains to 0% as time passes
  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  const getSizeConfig = () => {
    const configs = {
      sm: { circleSize: 80, fontSize: 'text-xl', buttonSize: 36 },
      md: { circleSize: 120, fontSize: 'text-3xl', buttonSize: 44 },
      lg: { circleSize: 180, fontSize: 'text-5xl', buttonSize: 56 },
    };
    return configs[size];
  };

  const config = getSizeConfig();

  const getTimerColor = () => {
    if (remainingSeconds <= 10) return 'danger';
    if (remainingSeconds <= 30) return 'warning';
    return 'primary';
  };

  // Hide timer when it reaches 0
  if (remainingSeconds === 0) {
    return null;
  }

  return (
    <View className={`items-center p-4 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
      <Text className={`mb-3 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        Rest Timer
      </Text>

      <CircularProgress
        progress={progress}
        size={config.circleSize}
        strokeWidth={size === 'lg' ? 10 : 6}
        color={getTimerColor()}
      >
        <Text
          className={`${config.fontSize} font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
        >
          {formatRestTime(remainingSeconds)}
        </Text>
      </CircularProgress>

      <View className="flex-row gap-4 mt-4">
        {onReset && (
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              onReset();
            }}
            className={`p-3 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
            style={{ width: config.buttonSize, height: config.buttonSize }}
          >
            <RotateCcw size={config.buttonSize - 16} color={isDark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>
        )}

        {onPause && onResume && (
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              isRunning ? onPause() : onResume();
            }}
            className={`p-3 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
            style={{ width: config.buttonSize, height: config.buttonSize }}
          >
            {isRunning ? (
              <Pause size={config.buttonSize - 16} color={isDark ? '#a1a1aa' : '#71717a'} />
            ) : (
              <Play size={config.buttonSize - 16} color={isDark ? '#a1a1aa' : '#71717a'} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            haptics.medium();
            onSkip();
          }}
          className="p-3 rounded-full bg-orange-500"
          style={{ width: config.buttonSize, height: config.buttonSize }}
        >
          <SkipForward size={config.buttonSize - 16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Text className={`mt-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        Tap to skip rest
      </Text>
    </View>
  );
}

interface CompactRestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onSkip: () => void;
}

export function CompactRestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning: _isRunning,
  onSkip,
}: CompactRestTimerProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  // Progress starts at 100% (full) and drains to 0% as time passes
  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  // Hide timer when it reaches 0
  if (remainingSeconds === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onSkip}
      className={`flex-row items-center justify-between p-3 rounded-lg ${
        isDark ? 'bg-orange-900/30' : 'bg-orange-50'
      }`}
    >
      <View className="flex-row items-center gap-2">
        <CircularProgress
          progress={progress}
          size={32}
          strokeWidth={3}
          color="primary"
        />
        <View>
          <Text className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
            Rest
          </Text>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {formatRestTime(remainingSeconds)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
          Skip
        </Text>
        <SkipForward size={16} color={isDark ? '#fb923c' : '#ea580c'} />
      </View>
    </TouchableOpacity>
  );
}

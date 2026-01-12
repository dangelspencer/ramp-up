import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSettings } from '@/hooks';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  showLabel = false,
  label,
  color = 'primary',
  className = '',
}: ProgressBarProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const clampedProgress = Math.min(100, Math.max(0, progress));

  const getColorClasses = () => {
    const colors = {
      primary: 'bg-orange-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    };
    return colors[color];
  };

  const getBackgroundClasses = () => {
    return isDark ? 'bg-zinc-700' : 'bg-zinc-200';
  };

  return (
    <View className={className}>
      {(showLabel || label) && (
        <View className="flex-row justify-between mb-1">
          {label && (
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {label}
            </Text>
          )}
          {showLabel && (
            <Text className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View
        className={`w-full rounded-full overflow-hidden ${getBackgroundClasses()}`}
        style={{ height }}
      >
        <View
          className={`h-full rounded-full ${getColorClasses()}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
    </View>
  );
}

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 8,
  color = 'primary',
  showLabel = false,
  children,
}: CircularProgressProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const getStrokeColor = () => {
    const colors = {
      primary: '#f97316',
      success: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
    };
    return colors[color];
  };

  const bgColor = isDark ? '#3f3f46' : '#e4e4e7';

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="items-center justify-center">
        {children || (showLabel && (
          <Text
            className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
            style={{ fontSize: size / 4 }}
          >
            {Math.round(clampedProgress)}%
          </Text>
        ))}
      </View>
    </View>
  );
}

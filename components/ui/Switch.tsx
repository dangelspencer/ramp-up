import React from 'react';
import { View, Text, Switch as RNSwitch, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
      className={`flex-row items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="flex-1 mr-4">
        {label && (
          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {label}
          </Text>
        )}
        {description && (
          <Text className={`text-sm mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {description}
          </Text>
        )}
      </View>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: isDark ? '#3f3f46' : '#d4d4d8', true: '#f97316' }}
        thumbColor={value ? '#ffffff' : isDark ? '#71717a' : '#ffffff'}
        ios_backgroundColor={isDark ? '#3f3f46' : '#d4d4d8'}
      />
    </TouchableOpacity>
  );
}

interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SwitchGroup({ children, className = '' }: SwitchGroupProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <View
      className={`rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-white'} px-4 divide-y ${
        isDark ? 'divide-zinc-700' : 'divide-zinc-200'
      } ${className}`}
    >
      {children}
    </View>
  );
}

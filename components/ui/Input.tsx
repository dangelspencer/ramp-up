import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useSettings } from '@/hooks';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    const { effectiveTheme } = useSettings();
    const isDark = effectiveTheme === 'dark';

    return (
      <View className={containerClassName}>
        {label && (
          <Text
            className={`text-sm font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
          >
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center rounded-lg border px-3
            ${
              error
                ? 'border-red-500'
                : isDark
                ? 'border-zinc-700 bg-zinc-800'
                : 'border-zinc-300 bg-white'
            }
          `}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`
              flex-1 py-3 text-base
              ${isDark ? 'text-white' : 'text-zinc-900'}
              ${className}
            `}
            placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-red-500 text-sm mt-1">{error}</Text>
        )}
        {hint && !error && (
          <Text className={`text-sm mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

interface NumberInputProps extends Omit<InputProps, 'keyboardType' | 'value' | 'onChangeText'> {
  value: number | null;
  onChangeValue: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  suffix?: string;
}

export function NumberInput({
  value,
  onChangeValue,
  min,
  max,
  step = 1,
  allowDecimals = false,
  suffix,
  ...props
}: NumberInputProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const handleChange = (text: string) => {
    if (text === '' || text === '-') {
      onChangeValue(null);
      return;
    }

    const regex = allowDecimals ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    if (!regex.test(text)) return;

    const num = parseFloat(text);
    if (isNaN(num)) return;

    if (min !== undefined && num < min) return;
    if (max !== undefined && num > max) return;

    onChangeValue(num);
  };

  return (
    <Input
      keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
      value={value !== null ? String(value) : ''}
      onChangeText={handleChange}
      rightIcon={
        suffix ? (
          <Text className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>{suffix}</Text>
        ) : undefined
      }
      {...props}
    />
  );
}

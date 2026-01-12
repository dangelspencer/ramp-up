import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps, useColorScheme } from 'react-native';
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
      className: _className = '',
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
            style={{
              flex: 1,
              paddingVertical: 12,
              fontSize: 16,
              color: isDark ? '#ffffff' : '#18181b',
              minHeight: 44,
            }}
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
  isDark?: boolean;
}

export function NumberInput({
  value,
  onChangeValue,
  min,
  max,
  step: _step = 1,
  allowDecimals = false,
  suffix,
  isDark: isDarkProp,
  ...props
}: NumberInputProps) {
  // Use prop if provided, otherwise fall back to useColorScheme
  const colorScheme = useColorScheme();
  const isDark = isDarkProp ?? colorScheme === 'dark';

  // Use local string state to allow intermediate typing
  const [localValue, setLocalValue] = React.useState(value !== null ? String(value) : '');

  // Sync local value when external value changes (but not during typing)
  React.useEffect(() => {
    const numLocal = localValue === '' ? null : parseFloat(localValue);
    if (numLocal !== value) {
      setLocalValue(value !== null ? String(value) : '');
    }
  }, [value]);

  const handleChange = (text: string) => {
    // Allow empty string
    if (text === '') {
      setLocalValue('');
      onChangeValue(null);
      return;
    }

    // Validate format (allow digits and optionally decimals)
    const regex = allowDecimals ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    if (!regex.test(text)) return;

    // Update local state immediately to allow typing
    setLocalValue(text);

    // Parse and update parent if valid number
    const num = parseFloat(text);
    if (!isNaN(num)) {
      onChangeValue(num);
    }
  };

  const handleBlur = () => {
    // On blur, clamp to min/max if needed
    if (localValue === '') {
      if (min !== undefined) {
        setLocalValue(String(min));
        onChangeValue(min);
      }
      return;
    }

    const num = parseFloat(localValue);
    if (isNaN(num)) {
      setLocalValue(value !== null ? String(value) : '');
      return;
    }

    let clampedValue = num;
    if (min !== undefined && num < min) clampedValue = min;
    if (max !== undefined && num > max) clampedValue = max;

    if (clampedValue !== num) {
      setLocalValue(String(clampedValue));
      onChangeValue(clampedValue);
    }
  };

  return (
    <Input
      keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
      value={localValue}
      onChangeText={handleChange}
      onBlur={handleBlur}
      rightIcon={
        suffix ? (
          <Text className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>{suffix}</Text>
        ) : undefined
      }
      {...props}
    />
  );
}

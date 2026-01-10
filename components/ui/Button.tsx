import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useSettings } from '@/hooks';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const getVariantClasses = () => {
    const variants = {
      primary: isDark
        ? 'bg-orange-500 active:bg-orange-600'
        : 'bg-orange-500 active:bg-orange-600',
      secondary: isDark
        ? 'bg-zinc-700 active:bg-zinc-600'
        : 'bg-zinc-200 active:bg-zinc-300',
      outline: isDark
        ? 'bg-transparent border border-zinc-600 active:bg-zinc-800'
        : 'bg-transparent border border-zinc-300 active:bg-zinc-100',
      ghost: isDark
        ? 'bg-transparent active:bg-zinc-800'
        : 'bg-transparent active:bg-zinc-100',
      destructive: isDark
        ? 'bg-red-600 active:bg-red-700'
        : 'bg-red-500 active:bg-red-600',
    };
    return variants[variant];
  };

  const getTextClasses = () => {
    const variants = {
      primary: 'text-white',
      secondary: isDark ? 'text-white' : 'text-zinc-900',
      outline: isDark ? 'text-white' : 'text-zinc-900',
      ghost: isDark ? 'text-white' : 'text-zinc-900',
      destructive: 'text-white',
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    };
    return sizes[size];
  };

  const getTextSizeClasses = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return sizes[size];
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg flex-row items-center justify-center
        ${isDisabled ? 'opacity-50' : ''}
        ${className}
      `}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' && !isDark ? '#18181b' : '#ffffff'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === 'left' && icon}
          <Text className={`${getTextClasses()} ${getTextSizeClasses()} font-semibold`}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </TouchableOpacity>
  );
}

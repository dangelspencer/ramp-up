import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface IconBoxProps {
  children: ReactNode;
  /** Size variant: 'sm' (32px), 'md' (40px), 'lg' (48px), 'xl' (64px), '2xl' (80px) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Background color variant */
  variant?: 'primary' | 'primary-muted' | 'muted' | 'muted-dark';
  /** Border radius: 'md' (rounded-lg), 'lg' (rounded-xl), 'xl' (rounded-2xl), 'full' (rounded-full) */
  rounded?: 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

/**
 * A square container for icons with consistent sizing.
 * Uses aspect-square to ensure proper square dimensions.
 */
export function IconBox({
  children,
  size = 'md',
  variant = 'muted',
  rounded = 'md',
  className = '',
}: IconBoxProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const roundedClasses = {
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };

  const variantClasses = {
    primary: 'bg-orange-500',
    'primary-muted': '', // Uses inline style for rgba to avoid NativeWind opacity issues
    muted: 'bg-zinc-100',
    'muted-dark': 'bg-zinc-700',
  };

  const variantStyles = {
    'primary-muted': { backgroundColor: 'rgba(249, 115, 22, 0.2)' },
  };

  return (
    <View
      className={`${sizeClasses[size]} aspect-square ${roundedClasses[rounded]} items-center justify-center flex-shrink-0 ${variantClasses[variant]} ${className}`}
      style={variant === 'primary-muted' ? variantStyles['primary-muted'] : undefined}
    >
      {children}
    </View>
  );
}

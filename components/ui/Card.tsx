import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';
import { ChevronRight } from 'lucide-react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, className = '', onPress, variant = 'default' }: CardProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const getVariantClasses = () => {
    const variants = {
      default: isDark ? 'bg-zinc-800' : 'bg-white',
      elevated: isDark
        ? 'bg-zinc-800 shadow-lg shadow-black/30'
        : 'bg-white shadow-lg shadow-black/10',
      outlined: isDark
        ? 'bg-zinc-800 border border-zinc-700'
        : 'bg-white border border-zinc-200',
    };
    return variants[variant];
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={`rounded-xl p-4 ${getVariantClasses()} ${className}`}
    >
      {children}
    </Container>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-3 flex-1">
        {icon && (
          <View className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
            {icon}
          </View>
        )}
        <View className="flex-1">
          <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={className}>{children}</View>;
}

interface ListCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
}

export function ListCard({
  title,
  subtitle,
  icon,
  onPress,
  showChevron = true,
  rightContent,
}: ListCardProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <Card onPress={onPress}>
      <View className="flex-row items-center">
        {icon && (
          <View className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
            {icon}
          </View>
        )}
        <View className="flex-1">
          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightContent}
        {onPress && showChevron && (
          <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
        )}
      </View>
    </Card>
  );
}

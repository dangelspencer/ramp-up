import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '@/hooks';
import { ChevronDown, Check } from 'lucide-react-native';
import { Modal } from './Modal';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  label,
  placeholder = 'Select an option',
  disabled = false,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View>
      {label && (
        <Text
          className={`text-sm font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
        >
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          flex-row items-center justify-between px-3 py-3 rounded-lg border
          ${
            error
              ? 'border-red-500'
              : isDark
              ? 'border-zinc-700 bg-zinc-800'
              : 'border-zinc-300 bg-white'
          }
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Text
          className={
            selectedOption
              ? isDark
                ? 'text-white'
                : 'text-zinc-900'
              : isDark
              ? 'text-zinc-500'
              : 'text-zinc-400'
          }
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      <Modal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={label || 'Select an option'}
        position="bottom"
      >
        <ScrollView className="max-h-80">
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className={`
                flex-row items-center justify-between py-3 px-2
                ${isDark ? 'border-zinc-800' : 'border-zinc-100'}
              `}
            >
              <View className="flex-1">
                <Text
                  className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}
                >
                  {option.label}
                </Text>
                {option.description && (
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {option.description}
                  </Text>
                )}
              </View>
              {option.value === value && (
                <Check size={20} color="#f97316" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
}

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedControlOption[];
  className?: string;
}

export function SegmentedControl({
  value,
  onValueChange,
  options,
  className = '',
}: SegmentedControlProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <View
      className={`flex-row p-1 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} ${className}`}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onValueChange(option.value)}
          className={`
            flex-1 py-2 px-3 rounded-md items-center
            ${
              option.value === value
                ? isDark
                  ? 'bg-zinc-700'
                  : 'bg-white shadow-sm'
                : ''
            }
          `}
        >
          <Text
            className={`font-medium ${
              option.value === value
                ? isDark
                  ? 'text-white'
                  : 'text-zinc-900'
                : isDark
                ? 'text-zinc-400'
                : 'text-zinc-500'
            }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

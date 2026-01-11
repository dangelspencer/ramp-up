import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/hooks';
import { X } from 'lucide-react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom';
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
  position = 'center',
}: ModalProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const insets = useSafeAreaInsets();

  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: 'max-w-full mx-4',
    };
    return sizes[size];
  };

  const getPositionClasses = () => {
    if (position === 'bottom') {
      return 'justify-end';
    }
    return 'justify-center';
  };

  const getContentClasses = () => {
    if (position === 'bottom') {
      return 'rounded-t-2xl rounded-b-none';
    }
    return 'rounded-2xl mx-4';
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className={`flex-1 ${getPositionClasses()} bg-black/50`}>
            <TouchableWithoutFeedback>
              <View
                className={`
                  w-full ${getSizeClasses()} ${getContentClasses()}
                  ${isDark ? 'bg-zinc-900' : 'bg-white'}
                `}
              >
                {(title || showCloseButton) && (
                  <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                    {title ? (
                      <Text
                        className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
                      >
                        {title}
                      </Text>
                    ) : (
                      <View />
                    )}
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        className={`p-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                      >
                        <X size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <ScrollView
                  className="px-4 pb-4"
                  style={position === 'bottom' ? { paddingBottom: Math.max(insets.bottom, 16) + 16 } : undefined}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {children}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <Modal visible={visible} onClose={onClose} showCloseButton={false} size="sm">
      <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        {title}
      </Text>
      <Text className={`mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{message}</Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onClose}
          className={`flex-1 py-3 rounded-lg items-center ${
            isDark ? 'bg-zinc-800' : 'bg-zinc-100'
          }`}
          disabled={loading}
        >
          <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {cancelText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          className={`flex-1 py-3 rounded-lg items-center ${
            variant === 'destructive' ? 'bg-red-500' : 'bg-orange-500'
          }`}
          disabled={loading}
        >
          <Text className="text-white font-medium">{confirmText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

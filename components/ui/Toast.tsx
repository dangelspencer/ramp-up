import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/hooks';
import { Check, AlertCircle, Info, ArrowRight } from 'lucide-react-native';

type ToastVariant = 'success' | 'info' | 'warning' | 'exercise';

interface ToastConfig {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: React.ReactNode;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback((config: ToastConfig) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If already visible, hide first then show new toast
    if (isVisible) {
      hideToast();
      setTimeout(() => {
        setToast(config);
        setIsVisible(true);
      }, 250);
      return;
    }

    setToast(config);
    setIsVisible(true);
  }, [isVisible, hideToast]);

  // Animate in when toast changes
  useEffect(() => {
    if (toast && isVisible) {
      // Reset position
      translateY.setValue(-100);
      opacity.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const duration = toast.duration ?? 2000;
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast, isVisible, translateY, opacity, hideToast]);

  const getVariantStyles = (variant: ToastVariant = 'info') => {
    const variants = {
      success: {
        bg: isDark ? 'bg-green-900/90' : 'bg-green-100',
        text: isDark ? 'text-green-100' : 'text-green-900',
        icon: <Check size={20} color={isDark ? '#bbf7d0' : '#166534'} />,
        iconBg: isDark ? 'bg-green-800' : 'bg-green-200',
      },
      info: {
        bg: isDark ? 'bg-blue-900/90' : 'bg-blue-100',
        text: isDark ? 'text-blue-100' : 'text-blue-900',
        icon: <Info size={20} color={isDark ? '#bfdbfe' : '#1e40af'} />,
        iconBg: isDark ? 'bg-blue-800' : 'bg-blue-200',
      },
      warning: {
        bg: isDark ? 'bg-amber-900/90' : 'bg-amber-100',
        text: isDark ? 'text-amber-100' : 'text-amber-900',
        icon: <AlertCircle size={20} color={isDark ? '#fde68a' : '#92400e'} />,
        iconBg: isDark ? 'bg-amber-800' : 'bg-amber-200',
      },
      exercise: {
        bg: isDark ? 'bg-orange-900/90' : 'bg-orange-100',
        text: isDark ? 'text-orange-100' : 'text-orange-900',
        icon: <ArrowRight size={20} color={isDark ? '#fed7aa' : '#9a3412'} />,
        iconBg: isDark ? 'bg-orange-800' : 'bg-orange-200',
      },
    };
    return variants[variant];
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {isVisible && toast && (
        <Animated.View
          style={[
            styles.container,
            {
              top: insets.top + 10,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="none"
        >
          <View
            className={`flex-row items-center px-4 py-3 rounded-xl mx-4 ${getVariantStyles(toast.variant).bg}`}
            style={styles.toast}
          >
            <View className={`p-2 rounded-lg mr-3 ${getVariantStyles(toast.variant).iconBg}`}>
              {toast.icon ?? getVariantStyles(toast.variant).icon}
            </View>
            <Text className={`flex-1 font-medium ${getVariantStyles(toast.variant).text}`}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

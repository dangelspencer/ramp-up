import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Activity, Check, X } from 'lucide-react-native';
import { useSettings, useOnboarding } from '@/hooks';
import { Button, Card } from '@/components/ui';

export default function HealthScreen() {
  const router = useRouter();
  const { effectiveTheme, updateSettings } = useSettings();
  const { updateData, setStep } = useOnboarding();
  const isDark = effectiveTheme === 'dark';
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const isIOS = Platform.OS === 'ios';

  const handleConnectHealth = async () => {
    if (!isIOS) {
      handleSkip();
      return;
    }

    setIsConnecting(true);
    try {
      // TODO: Implement actual HealthKit connection
      // For now, simulate the connection
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsConnected(true);
      updateData({ healthKitEnabled: true });
      await updateSettings({ healthKitEnabled: true });
    } catch (error) {
      console.error('Failed to connect to Health:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContinue = () => {
    setStep('barbells');
    router.push('/onboarding/barbells');
  };

  const handleSkip = async () => {
    updateData({ healthKitEnabled: false });
    await updateSettings({ healthKitEnabled: false });
    setStep('barbells');
    router.push('/onboarding/barbells');
  };

  const handleBack = () => {
    setStep('profile');
    router.back();
  };

  const features = [
    'Sync body weight measurements',
    'Export body fat percentage',
    'Share lean body mass data',
    'Import height from Health app',
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Apple Health
        </Text>
      </View>

      {/* Progress indicator */}
      <View className="px-6 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-[20%]" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 2 of 10
        </Text>
      </View>

      <View className="flex-1 px-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-4">
            <Activity size={32} color="#f97316" />
          </View>
          {isIOS ? (
            <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Connect to Apple Health to sync your body composition data
            </Text>
          ) : (
            <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Health integration is only available on iOS devices
            </Text>
          )}
        </View>

        {isIOS && (
          <Card variant="elevated" className="mb-4">
            <Text className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              What we'll sync:
            </Text>
            <View className="gap-2">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-center gap-3">
                  <View className="w-5 h-5 bg-green-500/20 rounded-full items-center justify-center">
                    <Check size={12} color="#22c55e" />
                  </View>
                  <Text className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {isConnected && (
          <View className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
                <Check size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  Connected to Apple Health
                </Text>
                <Text className={`text-sm ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
                  Your data will sync automatically
                </Text>
              </View>
            </View>
          </View>
        )}

        {!isIOS && (
          <View className={`p-4 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            <View className="flex-row items-center gap-3">
              <X size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
              <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                Skip this step on Android devices
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View className="px-6 pb-6 gap-3">
        {isIOS && !isConnected && (
          <Button onPress={handleConnectHealth} loading={isConnecting} size="lg" fullWidth>
            Connect Apple Health
          </Button>
        )}
        {isConnected ? (
          <Button onPress={handleContinue} size="lg" fullWidth>
            Continue
          </Button>
        ) : (
          <Button onPress={handleSkip} variant="outline" size="lg" fullWidth>
            {isIOS ? 'Skip for Now' : 'Continue'}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

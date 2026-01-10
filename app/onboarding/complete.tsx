import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PartyPopper, Dumbbell, TrendingUp, Calendar, CheckCircle } from 'lucide-react-native';
import { useSettings, useOnboarding } from '@/hooks';
import { Button } from '@/components/ui';

export default function CompleteScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const { data, completeOnboarding } = useOnboarding();
  const isDark = effectiveTheme === 'dark';

  const [isCompleting, setIsCompleting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still navigate even if there's an error
      router.replace('/(tabs)');
    }
  };

  // Summary of what was set up
  const summaryItems = [
    {
      icon: Dumbbell,
      label: 'Exercises',
      value: data.exercises?.length ?? 0,
      suffix: 'exercise(s)',
    },
    {
      icon: Calendar,
      label: 'Routine',
      value: data.routine?.name ?? 'Created',
      suffix: '',
    },
    {
      icon: TrendingUp,
      label: 'Program',
      value: data.program?.name ?? 'Created',
      suffix: '',
    },
  ].filter((item) => item.value);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Progress indicator */}
      <View className="px-6 py-3">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-full" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Complete!
        </Text>
      </View>

      <View className="flex-1 px-6 justify-center">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
          }}
        >
          {/* Success Icon */}
          <View className="w-24 h-24 bg-orange-500 rounded-full items-center justify-center mb-6">
            <PartyPopper size={48} color="#ffffff" />
          </View>

          {/* Title */}
          <Text className={`text-3xl font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            You're All Set!
          </Text>
          <Text className={`text-center mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Your training setup is complete. Time to start getting stronger.
          </Text>

          {/* Summary */}
          {summaryItems.length > 0 && (
            <View className={`w-full rounded-xl p-4 mb-8 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
              <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                What you set up:
              </Text>
              <View className="gap-3">
                {summaryItems.map((item, index) => (
                  <View key={index} className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center">
                      <CheckCircle size={16} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {item.label}
                      </Text>
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {typeof item.value === 'number'
                          ? `${item.value} ${item.suffix}`
                          : item.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tips */}
          <View className={`w-full p-4 rounded-xl mb-8 ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Quick Tips:
            </Text>
            <View className="gap-1">
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                • Tap "Start Workout" on the home screen to begin
              </Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                • Complete all reps to trigger auto-progression
              </Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                • Use the plate calculator during sets
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Start Button */}
      <View className="px-6 pb-6">
        <Button onPress={handleStart} loading={isCompleting} size="lg" fullWidth>
          Start Training
        </Button>
      </View>
    </SafeAreaView>
  );
}

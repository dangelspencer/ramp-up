import React, { useState, useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2, Dumbbell, TrendingUp, Target, Sparkles } from 'lucide-react-native';
import { useSettings, useOnboarding } from '@/hooks';
import { Button, IconBox } from '@/components/ui';
import { OnboardingStackParamList, RootStackParamList } from '../../App';

type OnboardingNavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CompleteScreen() {
  const navigation = useNavigation<OnboardingNavigationProp & RootNavigationProp>();
  const { effectiveTheme } = useSettings();
  const { completeOnboarding, data } = useOnboarding();
  const isDark = effectiveTheme === 'dark';

  const [isCompleting, setIsCompleting] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [checkmarkAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate elements on mount
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleFinish = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      // Reset navigation to Main tabs
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const highlights = [
    {
      icon: Dumbbell,
      title: 'Equipment Ready',
      description: 'Barbells and plates configured',
    },
    {
      icon: Target,
      title: 'Exercises Set',
      description: data.exercises?.length
        ? `${data.exercises.length} exercises with maxes`
        : 'Your exercises are ready',
    },
    {
      icon: TrendingUp,
      title: 'Program Active',
      description: data.program?.name || 'Your program is ready to go',
    },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Progress indicator */}
      <View className="px-6 pt-4 mb-6">
        <View className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <View className="h-1 rounded-full bg-orange-500 w-full" />
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Step 9 of 10 - Complete!
        </Text>
      </View>

      <View className="flex-1 px-6 justify-center">
        {/* Success Animation */}
        <View className="items-center mb-10">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Animated.View
                style={{
                  transform: [{ scale: checkmarkAnim }],
                }}
              >
                <CheckCircle2 size={56} color="#ffffff" />
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text
              className={`text-3xl font-bold text-center mb-3 ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}
            >
              You're All Set!
            </Text>
            <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Your training is configured and ready. Time to start building strength!
            </Text>
          </Animated.View>
        </View>

        {/* Summary Highlights */}
        <Animated.View style={{ opacity: fadeAnim }} className="gap-4 mt-4 mb-8">
          {highlights.map((highlight, index) => (
            <View
              key={index}
              className={`p-4 rounded-xl flex-row items-center ${
                isDark ? 'bg-zinc-800/50' : 'bg-white'
              }`}
            >
              <IconBox size="lg" variant="primary-muted" rounded="lg" className="mr-4">
                <highlight.icon size={24} color="#f97316" />
              </IconBox>
              <View className="flex-1">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {highlight.title}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {highlight.description}
                </Text>
              </View>
              <CheckCircle2 size={20} color="#22c55e" />
            </View>
          ))}
        </Animated.View>

        {/* Motivation */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className={`p-4 rounded-xl mt-4 ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkles size={20} color="#f97316" />
            <Text className={`font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              Pro Tip
            </Text>
          </View>
          <Text className={`text-sm ${isDark ? 'text-orange-400/80' : 'text-orange-600/80'}`}>
            Consistency is key! Start with the weights you've set and focus on progressive overload.
            The app will help you increase weight automatically as you hit your reps.
          </Text>
        </Animated.View>
      </View>

      {/* Start Training Button */}
      <View className="px-6 pb-6">
        <Button onPress={handleFinish} loading={isCompleting} size="lg" fullWidth>
          Start Training
        </Button>
      </View>
    </SafeAreaView>
  );
}

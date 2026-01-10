import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell, TrendingUp, Target, Activity } from 'lucide-react-native';
import { useSettings, useOnboarding } from '@/hooks';
import { Button } from '@/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const { setStep } = useOnboarding();
  const isDark = effectiveTheme === 'dark';

  const handleGetStarted = () => {
    setStep('profile');
    router.push('/onboarding/profile');
  };

  const features = [
    {
      icon: Dumbbell,
      title: 'Percentage-Based Training',
      description: 'Train with weights calculated from your max',
    },
    {
      icon: TrendingUp,
      title: 'Auto-Progression',
      description: 'Automatically increase weight as you get stronger',
    },
    {
      icon: Target,
      title: 'Weekly Goals',
      description: 'Stay consistent with workout tracking and streaks',
    },
    {
      icon: Activity,
      title: 'Body Composition',
      description: 'Track your progress beyond the scale',
    },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <View className="flex-1 px-6 justify-center">
        {/* Logo and Title */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-orange-500 rounded-2xl items-center justify-center mb-4">
            <Dumbbell size={40} color="#ffffff" />
          </View>
          <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            RampUp
          </Text>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Progressive strength training made simple
          </Text>
        </View>

        {/* Features */}
        <View className="gap-4 mb-12">
          {features.map((feature, index) => (
            <View
              key={index}
              className={`flex-row items-center gap-4 p-4 rounded-xl ${
                isDark ? 'bg-zinc-800/50' : 'bg-white'
              }`}
            >
              <View className="w-10 h-10 bg-orange-500/20 rounded-lg items-center justify-center">
                <feature.icon size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {feature.title}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Get Started Button */}
        <Button onPress={handleGetStarted} size="lg" fullWidth>
          Get Started
        </Button>
      </View>
    </SafeAreaView>
  );
}

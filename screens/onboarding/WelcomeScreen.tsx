import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dumbbell, TrendingUp, Target, Activity } from 'lucide-react-native';
import { useSettings, useOnboarding } from '@/hooks';
import { Button, IconBox } from '@/components/ui';
import { OnboardingStackParamList } from '../../App';

const AppIcon = require('@/assets/icon.png');

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme } = useSettings();
  const { setStep } = useOnboarding();
  const isDark = effectiveTheme === 'dark';

  const handleGetStarted = () => {
    setStep('profile');
    navigation.navigate('Profile');
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <View className="flex-1 px-6 justify-center">
        {/* Logo and Title */}
        <View className="items-center mb-10">
          <Image
            source={AppIcon}
            style={{ width: 96, height: 96, borderRadius: 16 }}
            className="mb-4"
            resizeMode="contain"
          />
          <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            RampUp
          </Text>
          <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Progressive strength training made simple
          </Text>
        </View>

        {/* Features */}
        <View className="gap-4 mt-4">
          {features.map((feature, index) => (
            <View
              key={index}
              className={`flex-row items-center gap-4 p-4 rounded-xl ${
                isDark ? 'bg-zinc-800/50' : 'bg-white'
              }`}
            >
              <IconBox variant="primary-muted">
                <feature.icon size={20} color="#f97316" />
              </IconBox>
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
      </View>

      {/* Get Started Button */}
      <View className="px-6 pb-6">
        <Button onPress={handleGetStarted} size="lg" fullWidth>
          Get Started
        </Button>
      </View>
    </SafeAreaView>
  );
}

import './global.css';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Home, Clock, Library, Settings } from 'lucide-react-native';

import { AppProvider } from '@/context/AppContext';
import { useSettings } from '@/hooks';

// Tab Screens
import HomeScreen from '@/screens/tabs/HomeScreen';
import HistoryScreen from '@/screens/tabs/HistoryScreen';
import LibraryScreen from '@/screens/tabs/LibraryScreen';
import SettingsScreen from '@/screens/tabs/SettingsScreen';

// Onboarding Screens
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';
import ProfileScreen from '@/screens/onboarding/ProfileScreen';
import HealthScreen from '@/screens/onboarding/HealthScreen';
import BarbellsScreen from '@/screens/onboarding/BarbellsScreen';
import PlatesScreen from '@/screens/onboarding/PlatesScreen';
import ExercisesSetupScreen from '@/screens/onboarding/ExercisesSetupScreen';
import RoutineScreen from '@/screens/onboarding/RoutineScreen';
import ProgramScreen from '@/screens/onboarding/ProgramScreen';
import BodyCompositionScreen from '@/screens/onboarding/BodyCompositionScreen';
import CompleteScreen from '@/screens/onboarding/CompleteScreen';

// Other Screens
import WorkoutScreen from '@/screens/workout/WorkoutScreen';
import WorkoutCompleteScreen from '@/screens/workout/WorkoutCompleteScreen';
import WorkoutDetailScreen from '@/screens/workout/WorkoutDetailScreen';
import RoutineCreateScreen from '@/screens/routine/RoutineCreateScreen';
import RoutineDetailScreen from '@/screens/routine/RoutineDetailScreen';
import RoutineSelectScreen from '@/screens/routine/RoutineSelectScreen';
import ProgramCreateScreen from '@/screens/program/ProgramCreateScreen';
import ProgramDetailScreen from '@/screens/program/ProgramDetailScreen';
import ExerciseCreateScreen from '@/screens/exercise/ExerciseCreateScreen';
import ExerciseDetailScreen from '@/screens/exercise/ExerciseDetailScreen';
import BodyCompIndexScreen from '@/screens/body-composition/BodyCompIndexScreen';
import BodyCompLogScreen from '@/screens/body-composition/BodyCompLogScreen';
import SettingsProfileScreen from '@/screens/settings/SettingsProfileScreen';
import SettingsBarbellsScreen from '@/screens/settings/SettingsBarbellsScreen';
import SettingsPlatesScreen from '@/screens/settings/SettingsPlatesScreen';
import SettingsGoalScreen from '@/screens/settings/SettingsGoalScreen';

export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  Workout: { routineId: string; programId?: string };
  WorkoutComplete: undefined;
  WorkoutDetail: { id: string };
  RoutineCreate: undefined;
  RoutineDetail: { id: string };
  RoutineSelect: undefined;
  ProgramCreate: undefined;
  ProgramDetail: { id: string };
  ExerciseCreate: undefined;
  ExerciseDetail: { id: string };
  BodyCompIndex: undefined;
  BodyCompLog: undefined;
  SettingsProfile: undefined;
  SettingsBarbells: undefined;
  SettingsPlates: undefined;
  SettingsGoal: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Profile: undefined;
  Health: undefined;
  Barbells: undefined;
  Plates: undefined;
  Exercises: undefined;
  Routine: undefined;
  Program: undefined;
  BodyComposition: undefined;
  Complete: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Library: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function OnboardingNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#09090b' : '#f4f4f5',
        },
        animation: 'slide_from_right',
      }}
    >
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Profile" component={ProfileScreen} />
      <OnboardingStack.Screen name="Health" component={HealthScreen} />
      <OnboardingStack.Screen name="Barbells" component={BarbellsScreen} />
      <OnboardingStack.Screen name="Plates" component={PlatesScreen} />
      <OnboardingStack.Screen name="Exercises" component={ExercisesSetupScreen} />
      <OnboardingStack.Screen name="Routine" component={RoutineScreen} />
      <OnboardingStack.Screen name="Program" component={ProgramScreen} />
      <OnboardingStack.Screen name="BodyComposition" component={BodyCompositionScreen} />
      <OnboardingStack.Screen name="Complete" component={CompleteScreen} />
    </OnboardingStack.Navigator>
  );
}

function TabNavigator() {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { settings, isLoading } = useSettings();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#030712' : '#f3f4f6',
        },
      }}
      initialRouteName={settings.onboardingCompleted ? 'Main' : 'Onboarding'}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="RoutineCreate" component={RoutineCreateScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen name="RoutineSelect" component={RoutineSelectScreen} />
      <Stack.Screen name="ProgramCreate" component={ProgramCreateScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
      <Stack.Screen name="ExerciseCreate" component={ExerciseCreateScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="BodyCompIndex" component={BodyCompIndexScreen} />
      <Stack.Screen name="BodyCompLog" component={BodyCompLogScreen} />
      <Stack.Screen name="SettingsProfile" component={SettingsProfileScreen} />
      <Stack.Screen name="SettingsBarbells" component={SettingsBarbellsScreen} />
      <Stack.Screen name="SettingsPlates" component={SettingsPlatesScreen} />
      <Stack.Screen name="SettingsGoal" component={SettingsGoalScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
        </AppProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

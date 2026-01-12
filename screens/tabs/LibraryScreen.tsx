import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Plus,
  Dumbbell,
  ChevronRight,
  Repeat,
  Target,
  Check,
} from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings, usePrograms, useRoutines, useExercises } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { IconBox } from '@/components/ui/IconBox';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/Select';
import { haptics } from '@/utils/haptics';
import { formatWeight, getUnitLabel } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ActiveTab = 'programs' | 'routines' | 'exercises';

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [activeTab, setActiveTab] = useState<ActiveTab>('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    programs,
    activeProgram,
    isLoading: programsLoading,
    setActive,
    refresh: refreshPrograms,
  } = usePrograms();

  const {
    routines,
    isLoading: routinesLoading,
    refresh: refreshRoutines,
  } = useRoutines();

  const {
    exercises,
    isLoading: exercisesLoading,
    refresh: refreshExercises,
  } = useExercises();

  const unitLabel = getUnitLabel(settings.units);

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refreshPrograms();
      refreshRoutines();
      refreshExercises();
    }, [])
  );

  const isLoading =
    activeTab === 'programs'
      ? programsLoading
      : activeTab === 'routines'
      ? routinesLoading
      : exercisesLoading;

  // Filter based on search
  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRoutines = routines.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshPrograms(), refreshRoutines(), refreshExercises()]);
    setRefreshing(false);
  };

  const handleCreate = () => {
    if (activeTab === 'programs') {
      navigation.navigate('ProgramCreate');
    } else if (activeTab === 'routines') {
      navigation.navigate('RoutineCreate');
    } else {
      navigation.navigate('ExerciseCreate');
    }
  };

  const handleViewProgram = (id: string) => {
    navigation.navigate('ProgramDetail', { id });
  };

  const handleViewRoutine = (id: string) => {
    navigation.navigate('RoutineDetail', { id });
  };

  const handleViewExercise = (id: string) => {
    navigation.navigate('ExerciseDetail', { id });
  };

  const handleSetActive = async (id: string) => {
    haptics.medium();
    await setActive(id);
  };

  const getSubtitle = () => {
    if (activeTab === 'programs') {
      return `${programs.length} program${programs.length !== 1 ? 's' : ''}`;
    } else if (activeTab === 'routines') {
      return `${routines.length} routine${routines.length !== 1 ? 's' : ''}`;
    } else {
      return `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`;
    }
  };

  const getProgramSubtitle = (program: typeof programs[0]) => {
    if (program.completedAt) {
      return 'Completed';
    }
    if (program.type === 'continuous') {
      return 'Continuous';
    }
    const completedWorkouts = program.currentPosition ?? 0;
    const total = program.totalWorkouts ?? 0;
    return `${completedWorkouts} / ${total} workouts`;
  };

  const renderProgramsList = () => {
    if (filteredPrograms.length === 0) {
      return (
        <View className="py-12 items-center">
          <IconBox size="xl" variant={isDark ? 'muted-dark' : 'muted'} rounded="full" className="mb-4">
            <Target size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
          </IconBox>
          <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {searchQuery ? 'No programs found' : 'No programs yet'}
          </Text>
          <Text className={`text-sm mt-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first program to get started'}
          </Text>
          {!searchQuery && (
            <Button
              onPress={() => navigation.navigate('ProgramCreate')}
              icon={<Plus size={18} color="#ffffff" />}
              className="mt-4"
            >
              Create Program
            </Button>
          )}
        </View>
      );
    }

    return filteredPrograms.map((program) => {
      const isActive = program.isActive;
      const isCompleted = !!program.completedAt;
      const canSetActive = !isActive && !isCompleted;

      return (
        <Card key={program.id} className="mb-3">
          <TouchableOpacity
            onPress={() => handleViewProgram(program.id)}
            className="flex-row items-center"
          >
            <IconBox
              variant={isActive ? 'primary' : isDark ? 'muted-dark' : 'muted'}
              className="mr-3"
            >
              {program.type === 'continuous' ? (
                <Repeat size={20} color={isActive ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'} />
              ) : (
                <Target size={20} color={isActive ? '#ffffff' : isDark ? '#a1a1aa' : '#71717a'} />
              )}
            </IconBox>
            <View className="flex-1 mr-2">
              <View className="flex-row items-center gap-2">
                <Text numberOfLines={1} className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {program.name}
                </Text>
                {isActive && (
                  <View className="px-2 py-0.5 rounded-full bg-green-500/20 shrink-0">
                    <Text className="text-xs font-medium text-green-500">ACTIVE</Text>
                  </View>
                )}
                {isCompleted && (
                  <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/20 shrink-0">
                    <Check size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
                    <Text className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Done
                    </Text>
                  </View>
                )}
              </View>
              <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {getProgramSubtitle(program)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {canSetActive && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleSetActive(program.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}
                >
                  <Text className="text-sm font-medium text-orange-500">Set Active</Text>
                </TouchableOpacity>
              )}
              <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
            </View>
          </TouchableOpacity>
        </Card>
      );
    });
  };

  const renderRoutinesList = () => {
    if (filteredRoutines.length === 0) {
      return (
        <View className="py-12 items-center">
          <IconBox size="xl" variant={isDark ? 'muted-dark' : 'muted'} rounded="full" className="mb-4">
            <Dumbbell size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
          </IconBox>
          <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {searchQuery ? 'No routines found' : 'No routines yet'}
          </Text>
          <Text className={`text-sm mt-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first routine to get started'}
          </Text>
          {!searchQuery && (
            <Button
              onPress={() => navigation.navigate('RoutineCreate')}
              icon={<Plus size={18} color="#ffffff" />}
              className="mt-4"
            >
              Create Routine
            </Button>
          )}
        </View>
      );
    }

    return filteredRoutines.map((routine) => (
      <Card key={routine.id} className="mb-3">
        <TouchableOpacity
          onPress={() => handleViewRoutine(routine.id)}
          className="flex-row items-center"
        >
          <IconBox variant={isDark ? 'muted-dark' : 'muted'} className="mr-3">
            <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
          </IconBox>
          <View className="flex-1 mr-2">
            <Text numberOfLines={1} className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {routine.name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Tap to view details
            </Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
        </TouchableOpacity>
      </Card>
    ));
  };

  const renderExercisesList = () => {
    if (filteredExercises.length === 0) {
      return (
        <View className="py-12 items-center">
          <IconBox size="xl" variant={isDark ? 'muted-dark' : 'muted'} rounded="full" className="mb-4">
            <Dumbbell size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
          </IconBox>
          <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {searchQuery ? 'No exercises found' : 'No exercises yet'}
          </Text>
          <Text className={`text-sm mt-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {searchQuery
              ? 'Try a different search term'
              : 'Add your first exercise to get started'}
          </Text>
          {!searchQuery && (
            <Button
              onPress={() => navigation.navigate('ExerciseCreate')}
              icon={<Plus size={18} color="#ffffff" />}
              className="mt-4"
            >
              Add Exercise
            </Button>
          )}
        </View>
      );
    }

    return filteredExercises.map((exercise) => (
      <Card key={exercise.id} className="mb-3">
        <TouchableOpacity
          onPress={() => handleViewExercise(exercise.id)}
          className="flex-row items-center"
        >
          <IconBox variant={isDark ? 'muted-dark' : 'muted'} className="mr-3">
            <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
          </IconBox>
          <View className="flex-1 mr-2">
            <Text numberOfLines={1} className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {exercise.name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Max: {formatWeight(exercise.maxWeight, settings.units)} | +
              {formatWeight(exercise.weightIncrement, settings.units)}
            </Text>
          </View>
          {exercise.autoProgression && (
            <View className="bg-green-500/20 px-2 py-1 rounded-full mr-2 shrink-0">
              <Text className="text-green-500 text-xs">Auto</Text>
            </View>
          )}
          <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
        </TouchableOpacity>
      </Card>
    ));
  };

  const renderContent = () => {
    if (activeTab === 'programs') {
      return renderProgramsList();
    } else if (activeTab === 'routines') {
      return renderRoutinesList();
    } else {
      return renderExercisesList();
    }
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="pt-4 pb-4 flex-row justify-between items-center">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Library
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {getSubtitle()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreate}
            className="bg-orange-500 rounded-lg p-2"
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#f97316"
            />
          }
        >
          {/* Segmented Control */}
          <View>
            <SegmentedControl
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as ActiveTab);
                setSearchQuery('');
              }}
              options={[
                { value: 'programs', label: 'Programs' },
                { value: 'routines', label: 'Routines' },
                { value: 'exercises', label: 'Exercises' },
              ]}
              isDark={isDark}
            />
          </View>

          {/* Search */}
          <View className="mt-4">
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Content */}
          <View className="mt-4">
            {renderContent()}
          </View>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

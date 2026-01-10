import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useSettings, usePrograms, useGoals, useBodyComposition } from '@/hooks';
import { ProgramCard, NoProgramCard, GoalCard, NoGoalCard, BodyCompositionCard } from '@/components/home';
import { routineService, RoutineWithDetails } from '@/services/routine.service';

export default function HomeScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { activeProgram, getNextRoutine, refresh: refreshPrograms, isLoading: programsLoading } = usePrograms();
  const { progress, refresh: refreshGoals, isLoading: goalsLoading } = useGoals();
  const { latest, entries, refresh: refreshBody, isLoading: bodyLoading } = useBodyComposition();

  const [nextRoutine, setNextRoutine] = useState<RoutineWithDetails | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNextRoutine = useCallback(async () => {
    if (activeProgram) {
      const routineId = await getNextRoutine();
      if (routineId) {
        const routine = await routineService.getByIdWithDetails(routineId);
        setNextRoutine(routine ?? null);
      }
    } else {
      setNextRoutine(null);
    }
  }, [activeProgram, getNextRoutine]);

  useEffect(() => {
    loadNextRoutine();
  }, [loadNextRoutine]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshPrograms(), refreshGoals(), refreshBody()]);
    await loadNextRoutine();
    setRefreshing(false);
  }, [refreshPrograms, refreshGoals, refreshBody, loadNextRoutine]);

  const handleStartWorkout = () => {
    if (nextRoutine) {
      router.push(`/workout/${nextRoutine.id}` as any);
    }
  };

  const handleViewProgram = () => {
    if (activeProgram) {
      router.push(`/program/${activeProgram.id}` as any);
    }
  };

  const handleCreateProgram = () => {
    router.push('/program/create');
  };

  const handleStartQuickWorkout = () => {
    router.push('/routine/select');
  };

  const handleViewGoal = () => {
    router.push('/settings/goal');
  };

  const handleSetGoal = () => {
    router.push('/settings/goal');
  };

  const handleViewBodyComp = () => {
    router.push('/body-composition');
  };

  const handleAddBodyComp = () => {
    router.push('/body-composition/log');
  };

  const isLoading = programsLoading || goalsLoading || bodyLoading;
  const previousBodyComp = entries.length > 1 ? entries[1] : null;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#f97316' : '#f97316'}
          />
        }
      >
        {/* Header */}
        <View className="pt-4 pb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            RampUp
          </Text>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Let's get stronger
          </Text>
        </View>

        {/* Program Card */}
        {activeProgram ? (
          <ProgramCard
            program={activeProgram}
            nextRoutineName={nextRoutine?.name ?? null}
            onStartWorkout={handleStartWorkout}
            onViewProgram={handleViewProgram}
          />
        ) : (
          <NoProgramCard
            onCreateProgram={handleCreateProgram}
            onStartQuickWorkout={handleStartQuickWorkout}
          />
        )}

        {/* Goal Card */}
        {progress ? (
          <GoalCard progress={progress} onPress={handleViewGoal} />
        ) : (
          <NoGoalCard onSetGoal={handleSetGoal} />
        )}

        {/* Body Composition Card */}
        <BodyCompositionCard
          latest={latest}
          previous={previousBodyComp}
          onPress={handleViewBodyComp}
          onAddEntry={handleAddBodyComp}
        />

        {/* Spacer for tab bar */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

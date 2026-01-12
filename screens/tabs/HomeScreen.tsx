import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useCallback } from 'react';
import { useSettings, usePrograms, useGoals, useBodyComposition } from '@/hooks';
import { ProgramCard, NoProgramCard, GoalCard, NoGoalCard, BodyCompositionCard } from '@/components/home';
import { routineService, RoutineWithDetails } from '@/services/routine.service';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
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

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        await Promise.all([refreshPrograms(), refreshGoals(), refreshBody()]);
        await loadNextRoutine();
      };
      refresh();
    }, [refreshPrograms, refreshGoals, refreshBody, loadNextRoutine])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshPrograms(), refreshGoals(), refreshBody()]);
    await loadNextRoutine();
    setRefreshing(false);
  }, [refreshPrograms, refreshGoals, refreshBody, loadNextRoutine]);

  const handleStartWorkout = () => {
    if (nextRoutine) {
      navigation.navigate('Workout', {
        routineId: nextRoutine.id,
        programId: activeProgram?.id,
      });
    }
  };

  const handleViewProgram = () => {
    if (activeProgram) {
      navigation.navigate('ProgramDetail', { id: activeProgram.id });
    }
  };

  const handleCreateProgram = () => {
    navigation.navigate('ProgramCreate');
  };

  const handleStartQuickWorkout = () => {
    navigation.navigate('RoutineSelect');
  };

  const handleViewGoal = () => {
    navigation.navigate('SettingsGoal');
  };

  const handleSetGoal = () => {
    navigation.navigate('SettingsGoal');
  };

  const handleViewBodyComp = () => {
    navigation.navigate('BodyCompIndex');
  };

  const handleAddBodyComp = () => {
    navigation.navigate('BodyCompLog');
  };

  const _isLoading = programsLoading || goalsLoading || bodyLoading;
  const previousBodyComp = entries.length > 1 ? entries[1] : null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
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

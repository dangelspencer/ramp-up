import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react-native';
import { useSettings, useRoutines } from '@/hooks';

export default function SelectRoutineScreen() {
  const router = useRouter();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { routines, isLoading, refresh } = useRoutines();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleSelectRoutine = (routineId: string) => {
    router.push(`/workout/${routineId}` as any);
  };

  const handleCreateRoutine = () => {
    router.push('/routine/create');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Quick Workout
          </Text>
        </View>
        <TouchableOpacity onPress={handleCreateRoutine}>
          <Plus size={24} color="#f97316" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#f97316' : '#f97316'}
          />
        }
      >
        <Text className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Select a routine to start your workout
        </Text>

        {routines.length === 0 ? (
          <View className="items-center py-12">
            <View className={`p-4 rounded-full mb-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <Dumbbell size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
            </View>
            <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              No routines yet
            </Text>
            <Text className={`text-center mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Create your first routine to get started
            </Text>
            <TouchableOpacity
              onPress={handleCreateRoutine}
              className="bg-orange-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Create Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              onPress={() => handleSelectRoutine(routine.id)}
              className={`rounded-xl p-4 mb-2 flex-row items-center justify-between ${
                isDark ? 'bg-zinc-800' : 'bg-white'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className={`font-medium text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {routine.name}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
            </TouchableOpacity>
          ))
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

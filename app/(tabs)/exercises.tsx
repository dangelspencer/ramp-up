import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, Search, Dumbbell } from 'lucide-react-native';
import { useSettings, useExercises } from '@/hooks';
import { Card } from '@/components/ui';
import { formatWeight } from '@/utils/formatting';

export default function ExercisesScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { exercises, isLoading, refresh } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = () => {
    router.push('/exercise/create');
  };

  const handleExercisePress = (id: string) => {
    router.push(`/exercise/${id}` as any);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="pt-4 pb-4 flex-row justify-between items-center">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Exercises
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} in library
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddExercise}
            className="bg-orange-500 rounded-full p-2"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          className={`flex-row items-center px-3 py-2 rounded-lg mb-4 ${
            isDark ? 'bg-zinc-800' : 'bg-white'
          }`}
        >
          <Search size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            className={`flex-1 ml-2 text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}
          />
        </View>

        {/* Exercise List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#f97316' : '#f97316'}
            />
          }
        >
          {filteredExercises.length === 0 ? (
            <View className="items-center py-12">
              <View className={`p-4 rounded-full mb-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <Dumbbell size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
              </View>
              <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {searchQuery ? 'No exercises found' : 'No exercises yet'}
              </Text>
              <Text className={`text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first exercise to get started'}
              </Text>
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => handleExercisePress(exercise.id)}
                className={`rounded-xl p-4 mb-2 flex-row items-center justify-between ${
                  isDark ? 'bg-zinc-800' : 'bg-white'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {exercise.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Max: {formatWeight(exercise.maxWeight, settings.units)} | +
                    {formatWeight(exercise.weightIncrement, settings.units)}
                  </Text>
                </View>
                {exercise.autoProgression && (
                  <View className="bg-green-500/20 px-2 py-1 rounded-full mr-2">
                    <Text className="text-green-500 text-xs">Auto</Text>
                  </View>
                )}
                <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
              </TouchableOpacity>
            ))
          )}
          {/* Spacer for tab bar */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

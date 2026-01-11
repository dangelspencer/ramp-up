import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, ChevronRight, Plus, Dumbbell, Play } from 'lucide-react-native';

import { RootStackParamList } from '../../App';
import { useSettings, useRoutines } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { IconBox } from '@/components/ui/IconBox';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RoutineSelectScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { routines, isLoading, refresh } = useRoutines();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredRoutines = routines.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSelectRoutine = (routineId: string) => {
    navigation.navigate('Workout', { routineId });
  };

  const handleViewRoutine = (routineId: string) => {
    navigation.navigate('RoutineDetail', { id: routineId });
  };

  const handleCreateRoutine = () => {
    navigation.navigate('RoutineCreate');
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
      {/* Header */}
      <View className="px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
          >
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Select Routine
          </Text>
          <TouchableOpacity
            onPress={handleCreateRoutine}
            className="p-2 rounded-lg bg-orange-500"
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Search */}
        <View className="mt-4">
          <Input
            placeholder="Search routines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Routines List */}
        <View className="mt-4">
          {filteredRoutines.length === 0 ? (
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
                  onPress={handleCreateRoutine}
                  icon={<Plus size={18} color="#ffffff" />}
                  className="mt-4"
                >
                  Create Routine
                </Button>
              )}
            </View>
          ) : (
            filteredRoutines.map((routine) => (
              <Card key={routine.id} className="mb-3">
                <TouchableOpacity
                  onPress={() => handleViewRoutine(routine.id)}
                  className="flex-row items-center"
                >
                  <IconBox variant={isDark ? 'muted-dark' : 'muted'} className="mr-3">
                    <Dumbbell size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                  </IconBox>
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {routine.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Tap to view details
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => handleSelectRoutine(routine.id)}
                      className="p-2 rounded-full bg-orange-500"
                    >
                      <Play size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Minus, Scale } from 'lucide-react-native';
import { useSettings, useBodyComposition } from '@/hooks';
import { formatWeight } from '@/utils/formatting';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTrend(current: number | null | undefined, previous: number | null | undefined): 'up' | 'down' | 'same' | null {
  if (current == null || previous == null) return null;
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'same';
}

export default function BodyCompositionScreen() {
  const router = useRouter();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const { entries, latest, isLoading, refresh } = useBodyComposition();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAddEntry = () => {
    router.push('/body-composition/log');
  };

  const previousEntry = entries.length > 1 ? entries[1] : null;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
          </TouchableOpacity>
          <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Body Composition
          </Text>
        </View>
        <TouchableOpacity onPress={handleAddEntry}>
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
        {/* Current Stats Card */}
        {latest && (
          <View className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
            <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Latest Measurements
            </Text>

            {/* Weight */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>Weight</Text>
              <View className="flex-row items-center gap-2">
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {formatWeight(latest.weight, settings.units)}
                </Text>
                {getTrend(latest.weight, previousEntry?.weight) === 'down' && (
                  <TrendingDown size={16} color="#22c55e" />
                )}
                {getTrend(latest.weight, previousEntry?.weight) === 'up' && (
                  <TrendingUp size={16} color="#ef4444" />
                )}
              </View>
            </View>

            {/* Body Fat */}
            {latest.bodyFatPercent != null && (
              <View className="flex-row items-center justify-between mb-3">
                <Text className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>Body Fat</Text>
                <View className="flex-row items-center gap-2">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {latest.bodyFatPercent.toFixed(1)}%
                  </Text>
                  {getTrend(latest.bodyFatPercent, previousEntry?.bodyFatPercent) === 'down' && (
                    <TrendingDown size={16} color="#22c55e" />
                  )}
                  {getTrend(latest.bodyFatPercent, previousEntry?.bodyFatPercent) === 'up' && (
                    <TrendingUp size={16} color="#ef4444" />
                  )}
                </View>
              </View>
            )}

            {/* Lean Mass */}
            {latest.leanMass != null && (
              <View className="flex-row items-center justify-between mb-3">
                <Text className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>Lean Mass</Text>
                <View className="flex-row items-center gap-2">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {formatWeight(latest.leanMass, settings.units)}
                  </Text>
                  {getTrend(latest.leanMass, previousEntry?.leanMass) === 'up' && (
                    <TrendingUp size={16} color="#22c55e" />
                  )}
                  {getTrend(latest.leanMass, previousEntry?.leanMass) === 'down' && (
                    <TrendingDown size={16} color="#ef4444" />
                  )}
                </View>
              </View>
            )}

            {/* BMI */}
            {latest.bmi != null && (
              <View className="flex-row items-center justify-between">
                <Text className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>BMI</Text>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {latest.bmi.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* History Section */}
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          History
        </Text>

        {entries.length === 0 ? (
          <View className="items-center py-12">
            <View className={`p-4 rounded-full mb-3 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <Scale size={32} color={isDark ? '#71717a' : '#a1a1aa'} />
            </View>
            <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              No measurements yet
            </Text>
            <Text className={`text-center mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Log your first measurement to track progress
            </Text>
            <TouchableOpacity
              onPress={handleAddEntry}
              className="bg-orange-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Add Measurement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry, index) => {
            const prev = entries[index + 1];
            const weightTrend = getTrend(entry.weight, prev?.weight);

            return (
              <View
                key={entry.id}
                className={`rounded-xl p-4 mb-2 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {formatDate(entry.date)}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {formatWeight(entry.weight, settings.units)}
                    </Text>
                    {weightTrend === 'down' && <TrendingDown size={14} color="#22c55e" />}
                    {weightTrend === 'up' && <TrendingUp size={14} color="#ef4444" />}
                    {weightTrend === 'same' && <Minus size={14} color={isDark ? '#71717a' : '#a1a1aa'} />}
                  </View>
                </View>
                <View className="flex-row gap-4">
                  {entry.bodyFatPercent != null && (
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      BF: {entry.bodyFatPercent.toFixed(1)}%
                    </Text>
                  )}
                  {entry.leanMass != null && (
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Lean: {formatWeight(entry.leanMass, settings.units)}
                    </Text>
                  )}
                  {entry.bmi != null && (
                    <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      BMI: {entry.bmi.toFixed(1)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

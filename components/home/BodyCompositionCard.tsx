import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '@/hooks';
import { Card } from '@/components/ui';
import { Scale, TrendingDown, TrendingUp, ChevronRight, Plus } from 'lucide-react-native';
import { BodyComposition } from '@/db/schema';
import { formatWeight } from '@/utils/formatting';
import { formatRelativeDate } from '@/utils/formatting';

interface BodyCompositionCardProps {
  latest: BodyComposition | null;
  previous: BodyComposition | null;
  onPress: () => void;
  onAddEntry: () => void;
}

export function BodyCompositionCard({
  latest,
  previous,
  onPress,
  onAddEntry,
}: BodyCompositionCardProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  if (!latest) {
    return (
      <Card variant="outlined" onPress={onAddEntry} className="mb-4">
        <View className="flex-row items-center gap-3">
          <View className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <Scale size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
          </View>
          <View className="flex-1">
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Track Body Composition
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Log your weight and measurements
            </Text>
          </View>
          <Plus size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
        </View>
      </Card>
    );
  }

  const weightChange = previous ? latest.weight - previous.weight : null;
  const bodyFatChange =
    previous && latest.bodyFatPercent && previous.bodyFatPercent
      ? latest.bodyFatPercent - previous.bodyFatPercent
      : null;

  return (
    <Card variant="elevated" onPress={onPress} className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Scale size={20} color="#3b82f6" />
          </View>
          <View>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Body Composition
            </Text>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {formatRelativeDate(latest.date)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
      </View>

      <View className="flex-row gap-4">
        {/* Weight */}
        <View className="flex-1">
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Weight</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {formatWeight(latest.weight, settings.units)}
            </Text>
            {weightChange !== null && weightChange !== 0 && (
              <View className="flex-row items-center">
                {weightChange > 0 ? (
                  <TrendingUp size={14} color="#ef4444" />
                ) : (
                  <TrendingDown size={14} color="#22c55e" />
                )}
                <Text
                  className={`text-sm ${
                    weightChange > 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Body Fat */}
        {latest.bodyFatPercent && (
          <View className="flex-1">
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Body Fat
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {latest.bodyFatPercent.toFixed(1)}%
              </Text>
              {bodyFatChange !== null && bodyFatChange !== 0 && (
                <View className="flex-row items-center">
                  {bodyFatChange > 0 ? (
                    <TrendingUp size={14} color="#ef4444" />
                  ) : (
                    <TrendingDown size={14} color="#22c55e" />
                  )}
                  <Text
                    className={`text-sm ${
                      bodyFatChange > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {bodyFatChange > 0 ? '+' : ''}
                    {bodyFatChange.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Add new entry button */}
      <TouchableOpacity
        onPress={onAddEntry}
        className={`flex-row items-center justify-center mt-3 py-2 rounded-lg ${
          isDark ? 'bg-zinc-700' : 'bg-zinc-100'
        }`}
      >
        <Plus size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
        <Text className={`ml-1 font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Log Measurement
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  Trash2,
  Calendar,
} from 'lucide-react-native';
import { useSettings, useBodyComposition } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { ConfirmModal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RootStackParamList } from '../../App';
import { BodyComposition } from '@/db/schema';
import { formatWeight, formatRelativeDate, formatShortDate } from '@/utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EntryRowProps {
  entry: BodyComposition;
  previousEntry: BodyComposition | null;
  isDark: boolean;
  onDelete: (id: string) => void;
}

function EntryRow({ entry, previousEntry, isDark, onDelete }: EntryRowProps) {
  const { settings } = useSettings();
  const weightChange = previousEntry ? entry.weight - previousEntry.weight : null;
  const bodyFatChange =
    previousEntry && entry.bodyFatPercent && previousEntry.bodyFatPercent
      ? entry.bodyFatPercent - previousEntry.bodyFatPercent
      : null;

  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color={isDark ? '#71717a' : '#a1a1aa'} />
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {formatShortDate(entry.date)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(entry.id)}
          className={`p-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4">
        {/* Weight */}
        <View className="flex-1">
          <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Weight</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {formatWeight(entry.weight, settings.units)}
            </Text>
            {weightChange !== null && weightChange !== 0 && (
              <View className="flex-row items-center">
                {weightChange > 0 ? (
                  <TrendingUp size={12} color="#ef4444" />
                ) : (
                  <TrendingDown size={12} color="#22c55e" />
                )}
                <Text
                  className={`text-xs ${weightChange > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Body Fat */}
        {entry.bodyFatPercent && (
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Body Fat
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {entry.bodyFatPercent.toFixed(1)}%
              </Text>
              {bodyFatChange !== null && bodyFatChange !== 0 && (
                <View className="flex-row items-center">
                  {bodyFatChange > 0 ? (
                    <TrendingUp size={12} color="#ef4444" />
                  ) : (
                    <TrendingDown size={12} color="#22c55e" />
                  )}
                  <Text
                    className={`text-xs ${bodyFatChange > 0 ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {bodyFatChange > 0 ? '+' : ''}
                    {bodyFatChange.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* BMI */}
        {entry.bmi && (
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>BMI</Text>
            <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {entry.bmi.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Measurements */}
      {(entry.waist || entry.neck || entry.hip) && (
        <View className={`flex-row gap-4 mt-2 pt-2 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
          {entry.waist && (
            <View>
              <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Waist</Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {entry.waist}"
              </Text>
            </View>
          )}
          {entry.neck && (
            <View>
              <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Neck</Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {entry.neck}"
              </Text>
            </View>
          )}
          {entry.hip && (
            <View>
              <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Hip</Text>
              <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {entry.hip}"
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

export default function BodyCompIndexScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const { entries, latest, isLoading, refresh, deleteEntry } = useBodyComposition();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleDelete = (id: string) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
    setDeleteModalVisible(false);
  };

  // Calculate progress stats
  const firstEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const weightProgress = firstEntry && latest
    ? {
        start: firstEntry.weight,
        current: latest.weight,
        change: latest.weight - firstEntry.weight,
      }
    : null;

  const bodyFatProgress =
    firstEntry?.bodyFatPercent && latest?.bodyFatPercent
      ? {
          start: firstEntry.bodyFatPercent,
          current: latest.bodyFatPercent,
          change: latest.bodyFatPercent - firstEntry.bodyFatPercent,
        }
      : null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : '#f4f4f5' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}
        >
          <ChevronLeft size={24} color={isDark ? '#ffffff' : '#18181b'} />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Body Composition
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('BodyCompLog')}
          className="p-2 rounded-lg bg-orange-500"
        >
          <Plus size={24} color="#ffffff" />
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
        {/* Summary Card */}
        {latest && (
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Scale size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Current Stats
                </Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {formatRelativeDate(latest.date)}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Weight
                </Text>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {formatWeight(latest.weight, settings.units)}
                </Text>
              </View>
              {latest.bodyFatPercent && (
                <View className="flex-1">
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Body Fat
                  </Text>
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {latest.bodyFatPercent.toFixed(1)}%
                  </Text>
                </View>
              )}
              {latest.bmi && (
                <View className="flex-1">
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    BMI
                  </Text>
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {latest.bmi.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Progress bars */}
            {weightProgress && entries.length > 1 && (
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Weight Change
                  </Text>
                  <Text
                    className={`text-sm font-medium ${
                      weightProgress.change > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {weightProgress.change > 0 ? '+' : ''}
                    {weightProgress.change.toFixed(1)} {settings.units}
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.min(100, Math.abs(weightProgress.change) * 5)}
                  color={weightProgress.change > 0 ? 'danger' : 'success'}
                  height={6}
                />
              </View>
            )}

            {bodyFatProgress && entries.length > 1 && (
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Body Fat Change
                  </Text>
                  <Text
                    className={`text-sm font-medium ${
                      bodyFatProgress.change > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {bodyFatProgress.change > 0 ? '+' : ''}
                    {bodyFatProgress.change.toFixed(1)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.min(100, Math.abs(bodyFatProgress.change) * 10)}
                  color={bodyFatProgress.change > 0 ? 'danger' : 'success'}
                  height={6}
                />
              </View>
            )}
          </Card>
        )}

        {/* History */}
        <View className="mb-4">
          <Text
            className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            History ({entries.length} entries)
          </Text>

          {entries.length === 0 ? (
            <Card variant="outlined" className="items-center py-8">
              <Scale size={48} color={isDark ? '#3f3f46' : '#d4d4d8'} />
              <Text
                className={`mt-4 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                No measurements yet
              </Text>
              <Text
                className={`text-sm text-center mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                Track your progress by logging your first measurement
              </Text>
              <Button
                onPress={() => navigation.navigate('BodyCompLog')}
                className="mt-4"
                icon={<Plus size={18} color="#ffffff" />}
              >
                Log Measurement
              </Button>
            </Card>
          ) : (
            entries.map((entry, index) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                previousEntry={index < entries.length - 1 ? entries[index + 1] : null}
                isDark={isDark}
                units={settings.units}
                onDelete={handleDelete}
              />
            ))
          )}
        </View>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this measurement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </SafeAreaView>
  );
}

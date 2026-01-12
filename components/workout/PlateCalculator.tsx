import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '@/hooks';
import { plateInventoryService } from '@/services/plateInventory.service';
import { PlateCalculation, getPlateLoadingOrder, formatPlateCalculation } from '@/utils/calculations';
import { Modal, NumberInput, Button } from '@/components/ui';
import { Calculator, AlertCircle } from 'lucide-react-native';
import { formatWeight } from '@/utils/formatting';

const PLATE_COLORS: { [key: number]: string } = {
  45: '#ef4444', // red
  35: '#f59e0b', // amber
  25: '#22c55e', // green
  10: '#3b82f6', // blue
  5: '#a855f7', // purple
  2.5: '#ec4899', // pink
};

interface PlateVisualizationProps {
  plates: Array<{ weight: number; count: number }>;
  barWeight: number;
}

// Get plate dimensions based on weight
function getPlateSize(weight: number): { height: number; width: number } {
  // Scale height based on weight (heavier = taller)
  const heights: { [key: number]: number } = {
    45: 70,
    35: 62,
    25: 54,
    10: 42,
    5: 34,
    2.5: 28,
  };
  return {
    height: heights[weight] || 40,
    width: 18, // Fixed width for consistency
  };
}

function PlateVisualization({ plates, barWeight }: PlateVisualizationProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const unitLabel = settings.units === 'imperial' ? 'lbs' : 'kg';

  const loadingOrder = getPlateLoadingOrder({ platesPerSide: plates, achievableWeight: 0, isExact: true, totalBarWeight: barWeight });

  if (loadingOrder.length === 0) {
    return (
      <View className="items-center py-6">
        <View className="flex-row items-center">
          <View
            className={`h-5 rounded-full ${isDark ? 'bg-zinc-500' : 'bg-zinc-400'}`}
            style={{ width: 120 }}
          />
        </View>
        <Text className={`text-sm mt-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Just the bar ({barWeight} {unitLabel})
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center py-4">
      {/* Bar visualization */}
      <View className="flex-row items-center">
        {/* Left plates (reversed for visual) */}
        <View className="flex-row items-center">
          {[...loadingOrder].reverse().map((weight, index) => {
            const size = getPlateSize(weight);
            return (
              <View
                key={`left-${index}`}
                className="items-center justify-center rounded mx-0.5"
                style={{
                  backgroundColor: PLATE_COLORS[weight] || '#71717a',
                  height: size.height,
                  width: size.width,
                }}
              />
            );
          })}
        </View>

        {/* Bar */}
        <View
          className={`h-5 rounded-full mx-1 ${isDark ? 'bg-zinc-500' : 'bg-zinc-400'}`}
          style={{ width: 60 }}
        />

        {/* Right plates */}
        <View className="flex-row items-center">
          {loadingOrder.map((weight, index) => {
            const size = getPlateSize(weight);
            return (
              <View
                key={`right-${index}`}
                className="items-center justify-center rounded mx-0.5"
                style={{
                  backgroundColor: PLATE_COLORS[weight] || '#71717a',
                  height: size.height,
                  width: size.width,
                }}
              />
            );
          })}
        </View>
      </View>

      {/* Plate legend */}
      <View className="flex-row flex-wrap justify-center gap-2 mt-4">
        {plates.map(({ weight, count }) => (
          <View
            key={weight}
            className="flex-row items-center px-2 py-1 rounded-full"
            style={{ backgroundColor: PLATE_COLORS[weight] || '#71717a' }}
          >
            <Text className="text-white text-xs font-bold">
              {count}x {weight}
            </Text>
          </View>
        ))}
      </View>

      {/* Bar weight label */}
      <Text className={`text-xs mt-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        Bar: {barWeight} {unitLabel}
      </Text>
    </View>
  );
}

interface PlateCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialWeight?: number;
  barWeight?: number;
}

export function PlateCalculatorModal({
  visible,
  onClose,
  initialWeight,
  barWeight: initialBarWeight = 45,
}: PlateCalculatorModalProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [targetWeight, setTargetWeight] = useState<number | null>(initialWeight ?? null);
  const [barWeight, setBarWeight] = useState<number | null>(initialBarWeight);
  const [calculation, setCalculation] = useState<PlateCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialWeight) {
      setTargetWeight(initialWeight);
    }
  }, [initialWeight]);

  const calculate = async () => {
    if (!targetWeight || !barWeight) return;

    setIsLoading(true);
    try {
      const result = await plateInventoryService.calculatePlatesForWeight(targetWeight, barWeight);
      setCalculation(result);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetWeight && barWeight && visible) {
      calculate();
    }
  }, [targetWeight, barWeight, visible]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Plate Calculator"
      position="bottom"
      size="lg"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <NumberInput
            label="Target Weight"
            value={targetWeight}
            onChangeValue={setTargetWeight}
            min={0}
            max={2000}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />

          <NumberInput
            label="Bar Weight"
            value={barWeight}
            onChangeValue={setBarWeight}
            min={0}
            max={100}
            suffix={settings.units === 'imperial' ? 'lbs' : 'kg'}
          />

          <Button onPress={calculate} loading={isLoading} fullWidth>
            Calculate
          </Button>

          {calculation && (
            <View className={`p-4 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <PlateVisualization plates={calculation.platesPerSide} barWeight={barWeight ?? 45} />

              <View className="mt-4 pt-4 border-t border-zinc-700">
                <View className="flex-row justify-between mb-2">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Per Side:</Text>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {formatPlateCalculation(calculation)}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                    Achievable Weight:
                  </Text>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {formatWeight(calculation.achievableWeight, settings.units)}
                  </Text>
                </View>

                {!calculation.isExact && (
                  <View className="flex-row items-center mt-2 p-2 rounded-lg bg-yellow-500/20">
                    <AlertCircle size={16} color="#eab308" />
                    <Text className="ml-2 text-sm text-yellow-500">
                      Exact weight not achievable with current plates
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}

interface PlateDisplayProps {
  weight: number;
  barWeight?: number;
  onPress?: () => void;
  compact?: boolean;
}

export function PlateDisplay({ weight, barWeight = 45, onPress, compact = false }: PlateDisplayProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';
  const [calculation, setCalculation] = useState<PlateCalculation | null>(null);

  useEffect(() => {
    plateInventoryService.calculatePlatesForWeight(weight, barWeight).then(setCalculation);
  }, [weight, barWeight]);

  if (!calculation) return null;

  const loadingOrder = getPlateLoadingOrder(calculation);

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} className="flex-row items-center gap-1">
        <Calculator size={14} color={isDark ? '#71717a' : '#a1a1aa'} />
        <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {loadingOrder.length > 0 ? loadingOrder.map(w => `${w}`).join('+') : 'Bar only'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-1 p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
    >
      {loadingOrder.slice(0, 4).map((plateWeight, index) => (
        <View
          key={index}
          className="w-5 h-5 rounded items-center justify-center"
          style={{ backgroundColor: PLATE_COLORS[plateWeight] || '#71717a' }}
        >
          <Text className="text-white text-xs font-bold">{plateWeight}</Text>
        </View>
      ))}
      {loadingOrder.length > 4 && (
        <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          +{loadingOrder.length - 4}
        </Text>
      )}
    </TouchableOpacity>
  );
}

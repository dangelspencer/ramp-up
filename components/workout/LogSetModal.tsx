import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useSettings } from '@/hooks';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface LogSetModalProps {
  visible: boolean;
  onClose: () => void;
  onLog: (weight: number, reps: number) => void;
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  percentageOfMax: number | null;
}

export function LogSetModal({
  visible,
  onClose,
  onLog,
  setNumber,
  targetWeight,
  targetReps,
  percentageOfMax,
}: LogSetModalProps) {
  const { effectiveTheme, settings } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [weightInput, setWeightInput] = useState(String(targetWeight));
  const [repsInput, setRepsInput] = useState(String(targetReps));

  // Reset inputs when modal opens
  useEffect(() => {
    if (visible) {
      setWeightInput(String(targetWeight));
      setRepsInput(String(targetReps));
    }
  }, [visible, targetWeight, targetReps]);

  const handleLog = () => {
    const weight = parseFloat(weightInput) || targetWeight;
    const reps = parseInt(repsInput, 10) || targetReps;
    onLog(weight, reps);
    onClose();
  };

  const unitLabel = settings.units === 'metric' ? 'kg' : 'lbs';

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Log Set ${setNumber}`}
      position="bottom"
    >
      <View className="gap-4">
        {/* Target info */}
        <View className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Target: {targetWeight} {unitLabel} × {targetReps} reps
            {percentageOfMax ? ` (${percentageOfMax}%)` : ''}
          </Text>
        </View>

        {/* Weight Input */}
        <View>
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Weight ({unitLabel})
          </Text>
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            className={`
              p-4 rounded-xl text-lg font-semibold text-center
              ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}
            `}
            selectTextOnFocus
          />
        </View>

        {/* Reps Input */}
        <View>
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Reps
          </Text>
          <TextInput
            value={repsInput}
            onChangeText={setRepsInput}
            keyboardType="number-pad"
            className={`
              p-4 rounded-xl text-lg font-semibold text-center
              ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}
            `}
            selectTextOnFocus
          />
        </View>

        {/* Log Button */}
        <Button onPress={handleLog} size="lg" fullWidth>
          Log Set
        </Button>
      </View>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSettings } from '@/hooks';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/Input';

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

  const [weightInput, setWeightInput] = useState<number | null>(targetWeight);
  const [repsInput, setRepsInput] = useState<number | null>(targetReps);

  // Reset inputs when modal opens
  useEffect(() => {
    if (visible) {
      setWeightInput(targetWeight);
      setRepsInput(targetReps);
    }
  }, [visible, targetWeight, targetReps]);

  const handleLog = () => {
    const weight = weightInput ?? targetWeight;
    const reps = repsInput ?? targetReps;
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
        <NumberInput
          label={`Weight (${unitLabel})`}
          value={weightInput}
          onChangeValue={setWeightInput}
          min={0}
          max={2000}
          allowDecimals
          suffix={unitLabel}
          isDark={isDark}
        />

        {/* Reps Input */}
        <NumberInput
          label="Reps"
          value={repsInput}
          onChangeValue={setRepsInput}
          min={0}
          max={999}
          isDark={isDark}
        />

        {/* Log Button */}
        <Button onPress={handleLog} size="lg" fullWidth>
          Log Set
        </Button>
      </View>
    </Modal>
  );
}

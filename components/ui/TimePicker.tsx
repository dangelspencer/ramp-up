import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Modal } from './Modal';
import { useSettings } from '@/hooks';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime: string; // "HH:MM" format
  title?: string;
}

export function TimePickerModal({
  visible,
  onClose,
  onSelect,
  initialTime,
  title = 'Select Time',
}: TimePickerModalProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  const [hours, minutes] = initialTime.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(hours % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(hours >= 12 ? 'PM' : 'AM');

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ... 55

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onSelect(timeString);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title} size="sm">
      <View className="p-4">
        {/* Time Selection */}
        <View className="flex-row items-center justify-center gap-2 mb-6">
          {/* Hours */}
          <View className={`rounded-xl overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <ScrollView
              style={{ height: 150, width: 70 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 55 }}
            >
              {hourOptions.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  onPress={() => setSelectedHour(hour)}
                  className={`py-2 items-center ${selectedHour === hour ? 'bg-orange-500' : ''}`}
                >
                  <Text
                    className={`text-xl font-semibold ${
                      selectedHour === hour
                        ? 'text-white'
                        : isDark
                        ? 'text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    {hour}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>:</Text>

          {/* Minutes */}
          <View className={`rounded-xl overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <ScrollView
              style={{ height: 150, width: 70 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 55 }}
            >
              {minuteOptions.map((minute) => (
                <TouchableOpacity
                  key={minute}
                  onPress={() => setSelectedMinute(minute)}
                  className={`py-2 items-center ${selectedMinute === minute ? 'bg-orange-500' : ''}`}
                >
                  <Text
                    className={`text-xl font-semibold ${
                      selectedMinute === minute
                        ? 'text-white'
                        : isDark
                        ? 'text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AM/PM */}
          <View className={`rounded-xl overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <TouchableOpacity
              onPress={() => setSelectedPeriod('AM')}
              className={`py-3 px-4 ${selectedPeriod === 'AM' ? 'bg-orange-500' : ''}`}
            >
              <Text
                className={`text-lg font-semibold ${
                  selectedPeriod === 'AM'
                    ? 'text-white'
                    : isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-600'
                }`}
              >
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPeriod('PM')}
              className={`py-3 px-4 ${selectedPeriod === 'PM' ? 'bg-orange-500' : ''}`}
            >
              <Text
                className={`text-lg font-semibold ${
                  selectedPeriod === 'PM'
                    ? 'text-white'
                    : isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-600'
                }`}
              >
                PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview */}
        <Text className={`text-center text-lg mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
        </Text>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            className={`flex-1 py-3 rounded-lg items-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
          >
            <Text className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            className="flex-1 py-3 rounded-lg items-center bg-orange-500"
          >
            <Text className="text-white font-medium">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

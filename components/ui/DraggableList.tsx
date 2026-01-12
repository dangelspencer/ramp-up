import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface DraggableListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  onReorder: (data: T[]) => void;
  itemHeight: number;
}

export function DraggableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  itemHeight,
}: DraggableListProps<T>) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleReorder = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const newData = [...data];
      const [removed] = newData.splice(from, 1);
      newData.splice(to, 0, removed);
      onReorder(newData);
    },
    [data, onReorder]
  );

  return (
    <View style={{ minHeight: data.length * itemHeight }}>
      {data.map((item, index) => (
        <DraggableItem
          key={keyExtractor(item, index)}
          index={index}
          itemHeight={itemHeight}
          itemCount={data.length}
          isDragging={draggingIndex === index}
          onDragStart={() => setDraggingIndex(index)}
          onDragEnd={(from, to) => {
            setDraggingIndex(null);
            handleReorder(from, to);
          }}
        >
          {renderItem(item, index, draggingIndex === index)}
        </DraggableItem>
      ))}
    </View>
  );
}

interface DraggableItemProps {
  children: React.ReactNode;
  index: number;
  itemHeight: number;
  itemCount: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: (from: number, to: number) => void;
}

function DraggableItem({
  children,
  index,
  itemHeight,
  itemCount,
  isDragging: _isDragging,
  onDragStart,
  onDragEnd,
}: DraggableItemProps) {
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
      isActive.value = true;
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      const finalPosition = Math.round(translateY.value / itemHeight);
      const clampedPosition = Math.max(0, Math.min(finalPosition + index, itemCount - 1));

      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      isActive.value = false;

      runOnJS(onDragEnd)(index, clampedPosition);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      zIndex: isActive.value ? 1000 : 0,
      shadowOpacity: isActive.value ? 0.2 : 0,
      elevation: isActive.value ? 5 : 0,
    };
  });

  return (
    <Animated.View
      style={[
        styles.item,
        { height: itemHeight },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.itemContent}>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  itemContent: {
    flex: 1,
  },
});

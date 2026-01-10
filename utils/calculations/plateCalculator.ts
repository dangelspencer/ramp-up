export interface PlateInventoryItem {
  weight: number;
  count: number;
}

export interface PlateCalculation {
  platesPerSide: Array<{ weight: number; count: number }>;
  achievableWeight: number;
  isExact: boolean;
  totalBarWeight: number;
}

/**
 * Calculates which plates to load on each side of the barbell
 * to achieve the target weight, using available inventory.
 *
 * Uses a greedy algorithm, selecting largest plates first.
 *
 * @param targetWeight - The total weight to achieve (including bar)
 * @param barWeight - The weight of the barbell
 * @param inventory - Available plates and their quantities
 * @returns PlateCalculation with plates per side and achievability info
 */
export function calculatePlates(
  targetWeight: number,
  barWeight: number,
  inventory: PlateInventoryItem[]
): PlateCalculation {
  // If target is less than or equal to bar weight, return empty plates
  if (targetWeight <= barWeight) {
    return {
      platesPerSide: [],
      achievableWeight: barWeight,
      isExact: targetWeight === barWeight,
      totalBarWeight: barWeight,
    };
  }

  // Sort inventory by weight descending (largest plates first)
  const sortedInventory = [...inventory]
    .filter((p) => p.count >= 2 && p.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  // Calculate weight needed per side
  let remainingWeight = (targetWeight - barWeight) / 2;
  const platesPerSide: Array<{ weight: number; count: number }> = [];

  // Create a working copy of inventory to track available plates
  const availablePlates = new Map<number, number>();
  for (const plate of sortedInventory) {
    availablePlates.set(plate.weight, plate.count);
  }

  // Greedy selection: use largest plates that fit
  for (const plate of sortedInventory) {
    const availableCount = availablePlates.get(plate.weight) || 0;
    const availablePairs = Math.floor(availableCount / 2);

    if (availablePairs > 0 && plate.weight <= remainingWeight) {
      const neededPlates = Math.floor(remainingWeight / plate.weight);
      const usePlates = Math.min(neededPlates, availablePairs);

      if (usePlates > 0) {
        platesPerSide.push({ weight: plate.weight, count: usePlates });
        remainingWeight -= usePlates * plate.weight;
        availablePlates.set(plate.weight, availableCount - usePlates * 2);
      }
    }
  }

  // Calculate achievable weight
  const plateWeightPerSide = platesPerSide.reduce(
    (sum, p) => sum + p.weight * p.count,
    0
  );
  const achievableWeight = barWeight + plateWeightPerSide * 2;

  return {
    platesPerSide,
    achievableWeight,
    isExact: achievableWeight === targetWeight,
    totalBarWeight: barWeight,
  };
}

/**
 * Returns a flat array of plate weights per side, sorted largest to smallest.
 * Useful for displaying the plate order on the bar.
 *
 * @param calculation - The plate calculation result
 * @returns Array of plate weights in loading order
 */
export function getPlateLoadingOrder(calculation: PlateCalculation): number[] {
  const plates: number[] = [];
  for (const { weight, count } of calculation.platesPerSide) {
    for (let i = 0; i < count; i++) {
      plates.push(weight);
    }
  }
  return plates;
}

/**
 * Formats the plate calculation as a readable string.
 *
 * @param calculation - The plate calculation result
 * @returns Formatted string like "2x45 + 1x25 + 1x5 per side"
 */
export function formatPlateCalculation(calculation: PlateCalculation): string {
  if (calculation.platesPerSide.length === 0) {
    return 'Just the bar';
  }

  const parts = calculation.platesPerSide.map(
    ({ weight, count }) => `${count}x${weight}`
  );
  return `${parts.join(' + ')} per side`;
}

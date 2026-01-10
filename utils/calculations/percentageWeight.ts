/**
 * Calculates the actual weight from a percentage of max weight,
 * rounded to the nearest increment.
 *
 * @param maxWeight - The exercise's max weight (100%)
 * @param percentage - The percentage to calculate (e.g., 60 for 60%)
 * @param increment - The weight increment to round to (2.5 or 5)
 * @param minWeight - Minimum weight (typically bar weight), defaults to 45
 * @returns The calculated weight, rounded to nearest increment
 */
export function calculateWeightFromPercentage(
  maxWeight: number,
  percentage: number,
  increment: number,
  minWeight: number = 45
): number {
  if (percentage <= 0) {
    return minWeight;
  }

  if (percentage >= 100) {
    // For 100% or more, round max weight to nearest increment
    return Math.max(roundToIncrement(maxWeight, increment), minWeight);
  }

  const rawWeight = (maxWeight * percentage) / 100;
  const roundedWeight = roundToIncrement(rawWeight, increment);

  // Ensure at least minimum weight (bar weight)
  return Math.max(roundedWeight, minWeight);
}

/**
 * Rounds a weight value to the nearest increment.
 *
 * @param weight - The weight to round
 * @param increment - The increment to round to
 * @returns The rounded weight
 */
export function roundToIncrement(weight: number, increment: number): number {
  if (increment <= 0) {
    return weight;
  }
  return Math.round(weight / increment) * increment;
}

/**
 * Calculates what percentage a given weight is of the max weight.
 *
 * @param weight - The current weight
 * @param maxWeight - The max weight (100%)
 * @returns The percentage (0-100+)
 */
export function calculatePercentage(weight: number, maxWeight: number): number {
  if (maxWeight <= 0) {
    return 0;
  }
  return (weight / maxWeight) * 100;
}

/**
 * Generates a warm-up set scheme based on working weight.
 * Common pattern: Bar, 60%, 70%, 80%, 90%, 100%
 *
 * @param maxWeight - The exercise's max weight
 * @param increment - The weight increment
 * @param barWeight - The bar weight (default 45)
 * @returns Array of set weights from warm-up to working weight
 */
export function generateWarmupSets(
  maxWeight: number,
  increment: number,
  barWeight: number = 45
): number[] {
  const percentages = [0, 60, 70, 80, 90, 100];
  const weights: number[] = [];

  for (const pct of percentages) {
    const weight =
      pct === 0
        ? barWeight
        : calculateWeightFromPercentage(maxWeight, pct, increment, barWeight);

    // Only add if different from the previous weight
    if (weights.length === 0 || weights[weights.length - 1] !== weight) {
      weights.push(weight);
    }
  }

  return weights;
}

/**
 * Formats a weight value with appropriate precision.
 * Removes unnecessary decimal places (e.g., 135.0 -> "135").
 *
 * @param weight - The weight value in lbs
 * @param unit - The unit label (default: "lbs")
 * @returns Formatted string like "135 lbs" or "132.5 lbs"
 */
export function formatWeight(weight: number, unit: string = 'lbs'): string {
  // If the weight is a whole number, don't show decimals
  const formatted = weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
  return `${formatted} ${unit}`;
}

/**
 * Formats a weight value without unit.
 *
 * @param weight - The weight value
 * @returns Formatted string like "135" or "132.5"
 */
export function formatWeightValue(weight: number): string {
  return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
}

/**
 * Formats a weight with percentage notation.
 * Example: "135 lbs (60%)"
 *
 * @param weight - The calculated weight
 * @param percentage - The percentage of max
 * @param unit - The unit label
 * @returns Formatted string
 */
export function formatWeightWithPercentage(
  weight: number,
  percentage: number,
  unit: string = 'lbs'
): string {
  const weightStr = formatWeightValue(weight);
  return `${weightStr} ${unit} (${percentage}%)`;
}

/**
 * Formats a set's weight display.
 * For percentage-based: "135 lbs (60%)"
 * For fixed weight: "45 lbs"
 *
 * @param weight - The weight value
 * @param percentage - The percentage (null for fixed weight)
 * @param unit - The unit label
 * @returns Formatted string
 */
export function formatSetWeight(
  weight: number,
  percentage: number | null,
  unit: string = 'lbs'
): string {
  if (percentage !== null) {
    return formatWeightWithPercentage(weight, percentage, unit);
  }
  return formatWeight(weight, unit);
}

/**
 * Converts weight between units.
 *
 * @param weight - The weight value
 * @param from - Source unit ('lbs' or 'kg')
 * @param to - Target unit ('lbs' or 'kg')
 * @returns Converted weight
 */
export function convertWeight(
  weight: number,
  from: 'lbs' | 'kg',
  to: 'lbs' | 'kg'
): number {
  if (from === to) return weight;

  if (from === 'lbs' && to === 'kg') {
    return weight / 2.20462;
  }

  // kg to lbs
  return weight * 2.20462;
}

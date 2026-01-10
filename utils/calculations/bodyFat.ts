export type Gender = 'male' | 'female';

export interface BodyFatInput {
  gender: Gender;
  heightInches: number;
  weightLbs: number;
  waistInches: number;
  neckInches: number;
  hipInches?: number; // Required for female
}

export interface BodyFatResult {
  bodyFatPercent: number;
  leanMass: number;
  fatMass: number;
  bmi: number;
}

/**
 * Calculates body fat percentage using the US Navy Method.
 *
 * Men formula:
 * %BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
 *
 * Women formula:
 * %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
 *
 * @param input - Measurement input data
 * @returns BodyFatResult with calculated metrics
 * @throws Error if female calculation missing hip measurement
 */
export function calculateUSNavyBodyFat(input: BodyFatInput): BodyFatResult {
  const { gender, heightInches, weightLbs, waistInches, neckInches, hipInches } =
    input;

  // Validate inputs
  if (heightInches <= 0 || weightLbs <= 0 || waistInches <= 0 || neckInches <= 0) {
    throw new Error('All measurements must be positive numbers');
  }

  if (waistInches <= neckInches) {
    throw new Error('Waist must be larger than neck measurement');
  }

  let bodyFatPercent: number;

  if (gender === 'male') {
    // Men: %BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
    bodyFatPercent =
      86.01 * Math.log10(waistInches - neckInches) -
      70.041 * Math.log10(heightInches) +
      36.76;
  } else {
    // Women require hip measurement
    if (!hipInches || hipInches <= 0) {
      throw new Error('Hip measurement required for female body fat calculation');
    }

    const circumference = waistInches + hipInches - neckInches;
    if (circumference <= 0) {
      throw new Error('Invalid measurements: circumference calculation resulted in non-positive value');
    }

    // Women: %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
    bodyFatPercent =
      163.205 * Math.log10(circumference) -
      97.684 * Math.log10(heightInches) -
      78.387;
  }

  // Clamp to reasonable range (2% - 60%)
  bodyFatPercent = Math.max(2, Math.min(60, bodyFatPercent));

  // Calculate derived metrics
  const fatMass = weightLbs * (bodyFatPercent / 100);
  const leanMass = weightLbs - fatMass;

  // Calculate BMI: (weight in lbs / height in inches^2) * 703
  const bmi = (weightLbs / (heightInches * heightInches)) * 703;

  return {
    bodyFatPercent: roundToDecimal(bodyFatPercent, 1),
    leanMass: roundToDecimal(leanMass, 1),
    fatMass: roundToDecimal(fatMass, 1),
    bmi: roundToDecimal(bmi, 1),
  };
}

/**
 * Rounds a number to specified decimal places.
 */
function roundToDecimal(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Returns a body fat category based on percentage.
 * Categories based on American Council on Exercise guidelines.
 */
export function getBodyFatCategory(
  bodyFatPercent: number,
  gender: Gender
): string {
  if (gender === 'male') {
    if (bodyFatPercent < 6) return 'Essential Fat';
    if (bodyFatPercent < 14) return 'Athletes';
    if (bodyFatPercent < 18) return 'Fitness';
    if (bodyFatPercent < 25) return 'Average';
    return 'Obese';
  } else {
    if (bodyFatPercent < 14) return 'Essential Fat';
    if (bodyFatPercent < 21) return 'Athletes';
    if (bodyFatPercent < 25) return 'Fitness';
    if (bodyFatPercent < 32) return 'Average';
    return 'Obese';
  }
}

/**
 * Returns a BMI category based on value.
 * Categories based on WHO classification.
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Converts height from feet and inches to total inches.
 */
export function heightToInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

/**
 * Converts total inches to feet and inches.
 */
export function inchesToHeight(totalInches: number): { feet: number; inches: number } {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

/**
 * Converts metric measurements to imperial for body fat calculation.
 */
export function convertMetricToImperial(input: {
  heightCm: number;
  weightKg: number;
  waistCm: number;
  neckCm: number;
  hipCm?: number;
}): {
  heightInches: number;
  weightLbs: number;
  waistInches: number;
  neckInches: number;
  hipInches?: number;
} {
  const cmToInches = (cm: number) => cm / 2.54;
  const kgToLbs = (kg: number) => kg * 2.20462;

  return {
    heightInches: cmToInches(input.heightCm),
    weightLbs: kgToLbs(input.weightKg),
    waistInches: cmToInches(input.waistCm),
    neckInches: cmToInches(input.neckCm),
    hipInches: input.hipCm ? cmToInches(input.hipCm) : undefined,
  };
}

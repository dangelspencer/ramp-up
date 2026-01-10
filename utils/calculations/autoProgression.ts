export interface ExerciseConfig {
  maxWeight: number;
  weightIncrement: number;
  autoProgression: boolean;
}

export interface CompletedSet {
  percentageOfMax: number | null;
  targetReps: number;
  actualReps: number | null;
  completed: boolean;
}

export interface AutoProgressionResult {
  shouldProgress: boolean;
  newMaxWeight: number;
  increment: number;
  reason?: string;
}

/**
 * Determines if an exercise should auto-progress based on completed sets.
 *
 * Auto-progression occurs when:
 * 1. Auto-progression is enabled for the exercise
 * 2. All sets at 100% of max are completed
 * 3. All 100% sets achieved target reps or more
 *
 * @param exercise - The exercise configuration
 * @param completedSets - Array of completed sets from the workout
 * @returns AutoProgressionResult with progression decision and new max
 */
export function checkAutoProgression(
  exercise: ExerciseConfig,
  completedSets: CompletedSet[]
): AutoProgressionResult {
  const noProgress = {
    shouldProgress: false,
    newMaxWeight: exercise.maxWeight,
    increment: 0,
  };

  // Check if auto-progression is enabled
  if (!exercise.autoProgression) {
    return { ...noProgress, reason: 'Auto-progression disabled for this exercise' };
  }

  // Find all 100% sets
  const maxSets = completedSets.filter((set) => set.percentageOfMax === 100);

  // If no 100% sets, no progression
  if (maxSets.length === 0) {
    return { ...noProgress, reason: 'No sets at 100% of max' };
  }

  // Check if all 100% sets were completed successfully
  const allSetsCompleted = maxSets.every((set) => set.completed);
  if (!allSetsCompleted) {
    return { ...noProgress, reason: 'Not all 100% sets were completed' };
  }

  // Check if all 100% sets achieved target reps or more
  const allRepsAchieved = maxSets.every(
    (set) => set.actualReps !== null && set.actualReps >= set.targetReps
  );

  if (!allRepsAchieved) {
    return { ...noProgress, reason: 'Not all 100% sets achieved target reps' };
  }

  // All conditions met - progress!
  return {
    shouldProgress: true,
    newMaxWeight: exercise.maxWeight + exercise.weightIncrement,
    increment: exercise.weightIncrement,
    reason: 'All 100% sets completed with target reps',
  };
}

/**
 * Calculates the total volume (weight x reps) for completed sets.
 *
 * @param sets - Array of completed sets
 * @param exerciseMaxWeight - The exercise's max weight for percentage calculations
 * @returns Total volume in lbs
 */
export function calculateVolume(
  sets: CompletedSet[],
  exerciseMaxWeight: number
): number {
  return sets.reduce((total, set) => {
    if (!set.completed || set.actualReps === null) {
      return total;
    }

    const weight =
      set.percentageOfMax !== null
        ? (exerciseMaxWeight * set.percentageOfMax) / 100
        : 0;

    return total + weight * set.actualReps;
  }, 0);
}

/**
 * Determines if a set was successful (completed with target reps or more).
 *
 * @param set - The set to check
 * @returns true if successful
 */
export function isSetSuccessful(set: CompletedSet): boolean {
  return (
    set.completed && set.actualReps !== null && set.actualReps >= set.targetReps
  );
}

/**
 * Calculates the completion rate for a set of exercises.
 *
 * @param sets - Array of completed sets
 * @returns Percentage of successful sets (0-100)
 */
export function calculateCompletionRate(sets: CompletedSet[]): number {
  if (sets.length === 0) {
    return 0;
  }

  const successfulSets = sets.filter(isSetSuccessful).length;
  return (successfulSets / sets.length) * 100;
}

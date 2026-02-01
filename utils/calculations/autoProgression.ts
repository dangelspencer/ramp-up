export interface ExerciseConfig {
  maxWeight: number;
  weightIncrement: number;
  autoProgression: boolean;
  progressionInterval?: number; // how many successful workouts before progressing (default 1)
  successfulWorkouts?: number; // current count of successful workouts
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
  // When workout was successful but interval not yet reached
  wasSuccessful?: boolean;
  newSuccessfulWorkouts?: number;
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
  const progressionInterval = exercise.progressionInterval ?? 1;
  const currentSuccessfulWorkouts = exercise.successfulWorkouts ?? 0;

  const noProgress = {
    shouldProgress: false,
    newMaxWeight: exercise.maxWeight,
    increment: 0,
    wasSuccessful: false,
    newSuccessfulWorkouts: currentSuccessfulWorkouts,
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

  // Workout was successful - increment the counter
  const newSuccessfulWorkouts = currentSuccessfulWorkouts + 1;

  // Check if we've reached the progression interval
  if (newSuccessfulWorkouts >= progressionInterval) {
    // Time to progress! Reset counter to 0
    return {
      shouldProgress: true,
      newMaxWeight: exercise.maxWeight + exercise.weightIncrement,
      increment: exercise.weightIncrement,
      reason: `Completed ${progressionInterval} successful workout${progressionInterval > 1 ? 's' : ''} - progressing weight`,
      wasSuccessful: true,
      newSuccessfulWorkouts: 0, // Reset on progression
    };
  }

  // Successful but not yet ready to progress
  return {
    shouldProgress: false,
    newMaxWeight: exercise.maxWeight,
    increment: 0,
    reason: `Successful workout ${newSuccessfulWorkouts}/${progressionInterval}`,
    wasSuccessful: true,
    newSuccessfulWorkouts,
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

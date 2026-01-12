import { eq, desc, asc, and, gte, lte } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  workouts,
  workoutExercises,
  workoutSets,
  exercises,
  routines,
  barbells,
  Workout,
  NewWorkout,
  WorkoutSet,
} from '@/db/schema';
import { routineService } from './routine.service';
import { exerciseService } from './exercise.service';
import { programService } from './program.service';
import {
  calculateWeightFromPercentage,
  checkAutoProgression,
  ExerciseConfig,
  CompletedSet,
} from '@/utils/calculations';

export interface WorkoutSetWithDetails extends WorkoutSet {
  // Additional calculated fields can be added here
}

export interface WorkoutExerciseWithDetails {
  id: string;
  exerciseId: string;
  orderIndex: number;
  exercise: {
    id: string;
    name: string;
    maxWeight: number;
    weightIncrement: number;
    autoProgression: boolean | null;
    barbellId: string | null;
  };
  sets: WorkoutSetWithDetails[];
}

export interface WorkoutWithDetails extends Workout {
  routine: {
    id: string;
    name: string;
  };
  exercises: WorkoutExerciseWithDetails[];
}

export interface AutoProgressionResult {
  exerciseId: string;
  exerciseName: string;
  previousMax: number;
  newMax: number;
}

export const workoutService = {
  /**
   * Start a new workout from a routine
   */
  async startWorkout(routineId: string, programId?: string): Promise<Workout> {
    const [workout] = await db
      .insert(workouts)
      .values({
        routineId,
        programId,
        startedAt: new Date().toISOString(),
      })
      .returning();

    // Get the routine details to create workout exercises
    const routine = await routineService.getByIdWithDetails(routineId);
    if (!routine) {
      throw new Error('Routine not found');
    }

    // Create workout exercises and sets based on routine
    for (const routineExercise of routine.exercises) {
      const exercise = routineExercise.exercise;

      const [workoutExercise] = await db
        .insert(workoutExercises)
        .values({
          workoutId: workout.id,
          exerciseId: routineExercise.exerciseId,
          orderIndex: routineExercise.orderIndex,
        })
        .returning();

      // Get barbell weight if exercise uses one
      let barbellWeight = 45; // Default
      if (exercise.barbellId) {
        const barbellResults = await db
          .select()
          .from(barbells)
          .where(eq(barbells.id, exercise.barbellId));
        if (barbellResults.length > 0) {
          barbellWeight = barbellResults[0].weight;
        }
      }

      // Create sets with calculated weights
      for (const set of routineExercise.sets) {
        let targetWeight: number;
        let percentageOfMax: number | null = null;

        if (set.weightType === 'percentage') {
          targetWeight = calculateWeightFromPercentage(
            exercise.maxWeight,
            set.weightValue,
            exercise.weightIncrement,
            barbellWeight
          );
          percentageOfMax = set.weightValue;
        } else if (set.weightType === 'bar') {
          // Just the bar weight, no additional plates
          targetWeight = exercise.barbellId ? barbellWeight : 0;
        } else {
          targetWeight = set.weightValue;
        }

        const restTime = set.restTime ?? exercise.defaultRestTime ?? 90;

        await db.insert(workoutSets).values({
          workoutExerciseId: workoutExercise.id,
          orderIndex: set.orderIndex,
          targetWeight,
          targetReps: set.reps,
          percentageOfMax,
          restTime,
        });
      }
    }

    return workout;
  },

  /**
   * Get a workout by ID with all details
   */
  async getByIdWithDetails(id: string): Promise<WorkoutWithDetails | undefined> {
    const workoutResults = await db
      .select({
        workout: workouts,
        routine: {
          id: routines.id,
          name: routines.name,
        },
      })
      .from(workouts)
      .innerJoin(routines, eq(workouts.routineId, routines.id))
      .where(eq(workouts.id, id));

    if (workoutResults.length === 0) return undefined;

    const { workout, routine } = workoutResults[0];

    // Get exercises
    const exerciseResults = await db
      .select({
        workoutExercise: workoutExercises,
        exercise: {
          id: exercises.id,
          name: exercises.name,
          maxWeight: exercises.maxWeight,
          weightIncrement: exercises.weightIncrement,
          autoProgression: exercises.autoProgression,
          barbellId: exercises.barbellId,
        },
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, id))
      .orderBy(asc(workoutExercises.orderIndex));

    // Get all sets
    const workoutExerciseIds = exerciseResults.map((e) => e.workoutExercise.id);
    const allSets =
      workoutExerciseIds.length > 0
        ? await db
            .select()
            .from(workoutSets)
            .orderBy(asc(workoutSets.orderIndex))
        : [];

    const exercisesWithSets: WorkoutExerciseWithDetails[] = exerciseResults.map((e) => {
      const sets = allSets.filter(
        (s) => s.workoutExerciseId === e.workoutExercise.id
      );
      return {
        id: e.workoutExercise.id,
        exerciseId: e.workoutExercise.exerciseId,
        orderIndex: e.workoutExercise.orderIndex,
        exercise: e.exercise,
        sets,
      };
    });

    return {
      ...workout,
      routine,
      exercises: exercisesWithSets,
    };
  },

  /**
   * Update a set's completion status
   */
  async updateSet(
    setId: string,
    updates: {
      actualWeight?: number;
      actualReps?: number;
      completed?: boolean;
      notes?: string;
    }
  ): Promise<WorkoutSet | undefined> {
    const results = await db
      .update(workoutSets)
      .set(updates)
      .where(eq(workoutSets.id, setId))
      .returning();

    return results[0];
  },

  /**
   * Complete a workout and process auto-progression
   * Returns any exercises that had their max weight increased
   */
  async completeWorkout(id: string): Promise<AutoProgressionResult[]> {
    const workout = await this.getByIdWithDetails(id);
    if (!workout) return [];

    const progressionResults: AutoProgressionResult[] = [];

    // Check each exercise for auto-progression
    for (const workoutExercise of workout.exercises) {
      const exercise = workoutExercise.exercise;

      if (!exercise.autoProgression) continue;

      const completedSets: CompletedSet[] = workoutExercise.sets.map((s) => ({
        percentageOfMax: s.percentageOfMax,
        targetReps: s.targetReps,
        actualReps: s.actualReps,
        completed: s.completed ?? false,
      }));

      const exerciseConfig: ExerciseConfig = {
        maxWeight: exercise.maxWeight,
        weightIncrement: exercise.weightIncrement,
        autoProgression: true,
      };

      const result = checkAutoProgression(exerciseConfig, completedSets);

      if (result.shouldProgress) {
        // Update the exercise max weight
        await exerciseService.updateMaxWeight(exercise.id, result.newMaxWeight);

        progressionResults.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          previousMax: exercise.maxWeight,
          newMax: result.newMaxWeight,
        });
      }
    }

    // Mark the workout as complete
    await db
      .update(workouts)
      .set({ completedAt: new Date().toISOString() })
      .where(eq(workouts.id, id));

    // If this is part of a program, advance the program position
    if (workout.programId) {
      const isComplete = await programService.isComplete(workout.programId);
      if (isComplete) {
        await programService.markComplete(workout.programId);
      } else {
        await programService.advancePosition(workout.programId);
      }
    }

    return progressionResults;
  },

  /**
   * Get workout history (most recent first)
   */
  async getHistory(limit?: number): Promise<WorkoutWithDetails[]> {
    const workoutIds = await db
      .select({ id: workouts.id })
      .from(workouts)
      .where(eq(workouts.completedAt, workouts.completedAt)) // Filter completed
      .orderBy(desc(workouts.completedAt))
      .limit(limit ?? 50);

    const results: WorkoutWithDetails[] = [];
    for (const { id } of workoutIds) {
      const workout = await this.getByIdWithDetails(id);
      if (workout) results.push(workout);
    }

    return results;
  },

  /**
   * Get workouts completed in the current week
   */
  async getWorkoutsThisWeek(): Promise<Workout[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return db
      .select()
      .from(workouts)
      .where(
        and(
          gte(workouts.completedAt, startOfWeek.toISOString()),
          lte(workouts.completedAt, endOfWeek.toISOString())
        )
      );
  },

  /**
   * Delete a workout
   * If the workout was completed and part of a program, decrements the program position
   */
  async delete(id: string): Promise<boolean> {
    // Get the workout first to check if we need to update program position
    const workoutResults = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, id));

    if (workoutResults.length === 0) return false;

    const workout = workoutResults[0];

    // If this was a completed workout in a program, decrement the program position
    if (workout.programId && workout.completedAt) {
      await programService.decrementPosition(workout.programId);
    }

    const results = await db.delete(workouts).where(eq(workouts.id, id)).returning();
    return results.length > 0;
  },
};

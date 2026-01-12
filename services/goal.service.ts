import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { goals, Goal } from '@/db/schema';
import { workoutService } from './workout.service';

export interface GoalProgress {
  workoutsThisWeek: number;
  workoutsTarget: number;
  streakWeeks: number;
  isOnTrack: boolean;
  scheduledDays: number[];
  nextScheduledDay: number | null;
}

export const goalService = {
  /**
   * Get the active goal
   */
  async getActive(): Promise<Goal | undefined> {
    const results = await db
      .select()
      .from(goals)
      .where(eq(goals.isActive, true));
    return results[0];
  },

  /**
   * Get a goal by ID
   */
  async getById(id: string): Promise<Goal | undefined> {
    const results = await db.select().from(goals).where(eq(goals.id, id));
    return results[0];
  },

  /**
   * Create a new goal
   */
  async create(
    workoutsPerWeek: number,
    scheduledDays: number[],
    reminderTime?: string,
    totalWeeks?: number
  ): Promise<Goal> {
    // Deactivate any existing active goal
    await db.update(goals).set({ isActive: false }).where(eq(goals.isActive, true));

    const [goal] = await db
      .insert(goals)
      .values({
        workoutsPerWeek,
        totalWeeks,
        scheduledDays: JSON.stringify(scheduledDays),
        reminderTime,
        startDate: new Date().toISOString(),
        currentStreak: 0,
        isActive: true,
      })
      .returning();

    return goal;
  },

  /**
   * Update a goal
   */
  async update(
    id: string,
    updates: {
      workoutsPerWeek?: number;
      scheduledDays?: number[];
      reminderTime?: string | null;
      totalWeeks?: number | null;
    }
  ): Promise<Goal | undefined> {
    const updateData: Partial<Goal> = {};

    if (updates.workoutsPerWeek !== undefined) {
      updateData.workoutsPerWeek = updates.workoutsPerWeek;
    }
    if (updates.scheduledDays !== undefined) {
      updateData.scheduledDays = JSON.stringify(updates.scheduledDays);
    }
    if (updates.reminderTime !== undefined) {
      updateData.reminderTime = updates.reminderTime;
    }
    if (updates.totalWeeks !== undefined) {
      updateData.totalWeeks = updates.totalWeeks;
    }

    const results = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, id))
      .returning();

    return results[0];
  },

  /**
   * Update the current streak
   */
  async updateStreak(id: string, streak: number): Promise<void> {
    await db
      .update(goals)
      .set({ currentStreak: streak })
      .where(eq(goals.id, id));
  },

  /**
   * Get goal progress for the current week
   */
  async getProgress(): Promise<GoalProgress | null> {
    const goal = await this.getActive();
    if (!goal) return null;

    const workoutsThisWeek = await workoutService.getWorkoutsThisWeek();
    const scheduledDays = JSON.parse(goal.scheduledDays) as number[];

    const now = new Date();
    const currentDay = now.getDay();

    // Find the next scheduled day
    let nextScheduledDay: number | null = null;
    for (const day of scheduledDays.sort((a, b) => a - b)) {
      if (day >= currentDay) {
        nextScheduledDay = day;
        break;
      }
    }
    // If no day found this week, next is the first scheduled day next week
    if (nextScheduledDay === null && scheduledDays.length > 0) {
      nextScheduledDay = scheduledDays[0];
    }

    // Check if on track (have we completed enough workouts so far this week?)
    const _daysPassedThisWeek = currentDay;
    const scheduledDaysPassed = scheduledDays.filter((d) => d < currentDay).length;
    const isOnTrack = workoutsThisWeek.length >= scheduledDaysPassed;

    return {
      workoutsThisWeek: workoutsThisWeek.length,
      workoutsTarget: goal.workoutsPerWeek,
      streakWeeks: goal.currentStreak ?? 0,
      isOnTrack,
      scheduledDays,
      nextScheduledDay,
    };
  },

  /**
   * Check if today is a scheduled workout day
   */
  async isTodayScheduled(): Promise<boolean> {
    const goal = await this.getActive();
    if (!goal) return false;

    const scheduledDays = JSON.parse(goal.scheduledDays) as number[];
    const today = new Date().getDay();

    return scheduledDays.includes(today);
  },

  /**
   * Check and update streak at end of week
   * Call this after completing a workout or at week boundary
   */
  async checkAndUpdateStreak(): Promise<void> {
    const goal = await this.getActive();
    if (!goal) return;

    const workoutsThisWeek = await workoutService.getWorkoutsThisWeek();
    const metGoal = workoutsThisWeek.length >= goal.workoutsPerWeek;

    if (metGoal) {
      // Increment streak
      await this.updateStreak(goal.id, (goal.currentStreak ?? 0) + 1);
    } else {
      // Check if we're past all scheduled days this week
      const scheduledDays = JSON.parse(goal.scheduledDays) as number[];
      const today = new Date().getDay();
      const allScheduledDaysPassed = scheduledDays.every((d) => d < today);

      if (allScheduledDaysPassed && workoutsThisWeek.length < goal.workoutsPerWeek) {
        // Reset streak if we missed workouts
        await this.updateStreak(goal.id, 0);
      }
    }
  },

  /**
   * Delete a goal
   */
  async delete(id: string): Promise<boolean> {
    const results = await db.delete(goals).where(eq(goals.id, id)).returning();
    return results.length > 0;
  },

  /**
   * Deactivate a goal without deleting
   */
  async deactivate(id: string): Promise<void> {
    await db.update(goals).set({ isActive: false }).where(eq(goals.id, id));
  },
};

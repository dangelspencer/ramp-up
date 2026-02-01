import { eq, gte, lte, and, desc } from 'drizzle-orm';

import { db } from '@/db/client';
import { goals, Goal, workouts } from '@/db/schema';
import { workoutService } from './workout.service';
import { notificationService } from './notification.service';
import { settingsService } from './settings.service';

export interface GoalProgress {
  workoutsThisWeek: number;
  workoutsTarget: number;
  streakWeeks: number;
  isOnTrack: boolean;
  scheduledDays: number[];
  completedDays: number[];
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
   * Calculate streak by counting consecutive weeks (from goal start) where
   * workout target was met. Goes backwards from the most recent completed week.
   */
  async calculateStreakFromHistory(goal: Goal): Promise<number> {
    const goalStartDate = new Date(goal.startDate);
    const now = new Date();

    // Get start of current week (Sunday)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    // Get start of goal week (Sunday of the week containing goal start)
    const goalWeekStart = new Date(goalStartDate);
    goalWeekStart.setDate(goalStartDate.getDate() - goalStartDate.getDay());
    goalWeekStart.setHours(0, 0, 0, 0);

    // Calculate how many full weeks have passed since goal started
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksSinceGoalStart = Math.floor(
      (currentWeekStart.getTime() - goalWeekStart.getTime()) / msPerWeek
    );

    // Get all completed workouts since goal started
    const completedWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          gte(workouts.completedAt, goalWeekStart.toISOString()),
          lte(workouts.completedAt, now.toISOString())
        )
      )
      .orderBy(desc(workouts.completedAt));

    // Group workouts by week number (0 = goal start week)
    const workoutsByWeek = new Map<number, number>();
    for (const workout of completedWorkouts) {
      if (!workout.completedAt) continue;
      const workoutDate = new Date(workout.completedAt);
      const weekNumber = Math.floor(
        (workoutDate.getTime() - goalWeekStart.getTime()) / msPerWeek
      );
      workoutsByWeek.set(weekNumber, (workoutsByWeek.get(weekNumber) ?? 0) + 1);
    }

    // Count streak going backwards from most recent COMPLETED week
    // Don't count the current week unless it's fully passed or goal already met
    const workoutsThisWeek = workoutsByWeek.get(weeksSinceGoalStart) ?? 0;
    const currentWeekMetGoal = workoutsThisWeek >= goal.workoutsPerWeek;

    // Determine starting point for streak calculation
    // If current week met goal, include it; otherwise start from previous week
    let streak = 0;
    const startWeek = currentWeekMetGoal
      ? weeksSinceGoalStart
      : weeksSinceGoalStart - 1;

    for (let week = startWeek; week >= 0; week--) {
      const workoutsInWeek = workoutsByWeek.get(week) ?? 0;
      if (workoutsInWeek >= goal.workoutsPerWeek) {
        streak++;
      } else {
        // Streak broken
        break;
      }
    }

    return streak;
  },

  /**
   * Get goal progress for the current week
   */
  async getProgress(): Promise<GoalProgress | null> {
    const goal = await this.getActive();
    if (!goal) return null;

    const workoutsThisWeek = await workoutService.getWorkoutsThisWeek();
    const scheduledDays = JSON.parse(goal.scheduledDays) as number[];

    // Extract which days of the week had completed workouts
    const completedDays = [...new Set(
      workoutsThisWeek
        .filter((w) => w.completedAt)
        .map((w) => new Date(w.completedAt!).getDay())
    )];

    const now = new Date();
    const currentDay = now.getDay();

    // Check if we already worked out today
    const workedOutToday = completedDays.includes(currentDay);

    // Find the next scheduled day (skip today if we already worked out)
    let nextScheduledDay: number | null = null;
    const sortedScheduledDays = scheduledDays.sort((a, b) => a - b);
    for (const day of sortedScheduledDays) {
      if (workedOutToday ? day > currentDay : day >= currentDay) {
        nextScheduledDay = day;
        break;
      }
    }
    // If no day found this week, next is the first scheduled day next week
    if (nextScheduledDay === null && scheduledDays.length > 0) {
      nextScheduledDay = sortedScheduledDays[0];
    }

    // Check if on track (have we completed enough workouts so far this week?)
    // Count today as "passed" if we've already worked out today
    const scheduledDaysPassed = scheduledDays.filter((d) =>
      workedOutToday ? d <= currentDay : d < currentDay
    ).length;
    const isOnTrack = workoutsThisWeek.length >= scheduledDaysPassed;

    // Calculate streak from workout history instead of using stored value
    const streakWeeks = await this.calculateStreakFromHistory(goal);

    return {
      workoutsThisWeek: workoutsThisWeek.length,
      workoutsTarget: goal.workoutsPerWeek,
      streakWeeks,
      isOnTrack,
      scheduledDays,
      completedDays,
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
    const justHitGoal = workoutsThisWeek.length === goal.workoutsPerWeek;

    if (metGoal) {
      // Increment streak only when we first hit the goal this week
      if (justHitGoal) {
        await this.updateStreak(goal.id, (goal.currentStreak ?? 0) + 1);
        // Send immediate celebration notification
        await notificationService.sendGoalAchievedNotification(workoutsThisWeek.length);
      }
      // Schedule celebration notification for the weekend
      await this.scheduleWeeklyGoalNotification(true);
    } else {
      // Check if we're past all scheduled days this week
      const scheduledDays = JSON.parse(goal.scheduledDays) as number[];
      const today = new Date().getDay();
      const allScheduledDaysPassed = scheduledDays.every((d) => d < today);

      if (allScheduledDaysPassed && workoutsThisWeek.length < goal.workoutsPerWeek) {
        // Reset streak if we missed workouts
        await this.updateStreak(goal.id, 0);
        // Schedule encouragement notification for the weekend
        await this.scheduleWeeklyGoalNotification(false);
      }
    }
  },

  /**
   * Schedule the weekly goal notification based on success/failure
   */
  async scheduleWeeklyGoalNotification(succeeded: boolean): Promise<void> {
    const settings = await settingsService.getAll();
    
    if (!settings.goalNotificationsEnabled) {
      return;
    }

    const [hour, minute] = settings.goalNotificationTime.split(':').map(Number);
    const dayOfWeek = settings.goalNotificationDay;

    if (succeeded) {
      await notificationService.scheduleGoalCelebrationNotification(dayOfWeek, hour, minute);
    } else {
      await notificationService.scheduleGoalEncouragementNotification(dayOfWeek, hour, minute);
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

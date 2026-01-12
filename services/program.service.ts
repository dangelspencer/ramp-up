import { eq, asc } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  programs,
  programRoutines,
  routines,
  Program,
} from '@/db/schema';

export interface ProgramWithRoutines extends Program {
  routines: Array<{
    id: string;
    routineId: string;
    orderIndex: number;
    routine: {
      id: string;
      name: string;
    };
  }>;
}

export const programService = {
  /**
   * Get all programs
   */
  async getAll(): Promise<Program[]> {
    return db.select().from(programs).orderBy(programs.name);
  },

  /**
   * Get the active program
   */
  async getActive(): Promise<Program | undefined> {
    const results = await db
      .select()
      .from(programs)
      .where(eq(programs.isActive, true));
    return results[0];
  },

  /**
   * Get a program by ID
   */
  async getById(id: string): Promise<Program | undefined> {
    const results = await db.select().from(programs).where(eq(programs.id, id));
    return results[0];
  },

  /**
   * Get a program with its routines
   */
  async getByIdWithRoutines(id: string): Promise<ProgramWithRoutines | undefined> {
    const program = await this.getById(id);
    if (!program) return undefined;

    const programRoutineResults = await db
      .select({
        programRoutine: programRoutines,
        routine: {
          id: routines.id,
          name: routines.name,
        },
      })
      .from(programRoutines)
      .innerJoin(routines, eq(programRoutines.routineId, routines.id))
      .where(eq(programRoutines.programId, id))
      .orderBy(asc(programRoutines.orderIndex));

    return {
      ...program,
      routines: programRoutineResults.map((r) => ({
        id: r.programRoutine.id,
        routineId: r.programRoutine.routineId,
        orderIndex: r.programRoutine.orderIndex,
        routine: r.routine,
      })),
    };
  },

  /**
   * Get the active program with routines
   */
  async getActiveWithRoutines(): Promise<ProgramWithRoutines | undefined> {
    const active = await this.getActive();
    if (!active) return undefined;
    return this.getByIdWithRoutines(active.id);
  },

  /**
   * Create a new program
   */
  async create(
    name: string,
    type: 'continuous' | 'finite',
    routineIds: string[],
    totalWorkouts?: number
  ): Promise<Program> {
    const [program] = await db
      .insert(programs)
      .values({
        name,
        type,
        totalWorkouts: type === 'finite' ? totalWorkouts : null,
      })
      .returning();

    // Create program routines
    for (let i = 0; i < routineIds.length; i++) {
      await db.insert(programRoutines).values({
        programId: program.id,
        routineId: routineIds[i],
        orderIndex: i,
      });
    }

    return program;
  },

  /**
   * Update a program
   */
  async update(
    id: string,
    updates: Partial<Pick<Program, 'name' | 'type' | 'totalWorkouts'>>
  ): Promise<Program | undefined> {
    const results = await db
      .update(programs)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(programs.id, id))
      .returning();

    return results[0];
  },

  /**
   * Update program routines
   */
  async updateRoutines(programId: string, routineIds: string[]): Promise<void> {
    // Delete existing routines
    await db
      .delete(programRoutines)
      .where(eq(programRoutines.programId, programId));

    // Create new routines
    for (let i = 0; i < routineIds.length; i++) {
      await db.insert(programRoutines).values({
        programId,
        routineId: routineIds[i],
        orderIndex: i,
      });
    }

    await db
      .update(programs)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(programs.id, programId));
  },

  /**
   * Set a program as active
   */
  async setActive(id: string): Promise<Program | undefined> {
    // Deactivate any currently active program
    await db
      .update(programs)
      .set({ isActive: false })
      .where(eq(programs.isActive, true));

    // Activate the new program
    const results = await db
      .update(programs)
      .set({ isActive: true, currentPosition: 0, updatedAt: new Date().toISOString() })
      .where(eq(programs.id, id))
      .returning();

    return results[0];
  },

  /**
   * Advance to the next workout in the program
   * Returns the new current position
   */
  async advancePosition(id: string): Promise<number> {
    const program = await this.getByIdWithRoutines(id);
    if (!program) return 0;

    const routineCount = program.routines.length;
    if (routineCount === 0) return 0;

    let newPosition: number;

    if (program.type === 'continuous') {
      // Continuous: cycle through routines
      newPosition = ((program.currentPosition ?? 0) + 1) % routineCount;
    } else {
      // Finite: increment up to total workouts
      newPosition = (program.currentPosition ?? 0) + 1;
    }

    await db
      .update(programs)
      .set({ currentPosition: newPosition, updatedAt: new Date().toISOString() })
      .where(eq(programs.id, id));

    return newPosition;
  },

  /**
   * Decrement the program position (e.g., when a workout is deleted)
   * Returns the new current position
   */
  async decrementPosition(id: string): Promise<number> {
    const program = await this.getByIdWithRoutines(id);
    if (!program) return 0;

    const currentPosition = program.currentPosition ?? 0;
    if (currentPosition <= 0) return 0;

    const newPosition = currentPosition - 1;

    // If the program was marked complete, un-complete it
    const updates: { currentPosition: number; updatedAt: string; completedAt?: null; isActive?: boolean } = {
      currentPosition: newPosition,
      updatedAt: new Date().toISOString(),
    };

    if (program.completedAt) {
      updates.completedAt = null;
      // Optionally reactivate the program if there's no other active program
      const activeProgram = await this.getActive();
      if (!activeProgram) {
        updates.isActive = true;
      }
    }

    await db
      .update(programs)
      .set(updates)
      .where(eq(programs.id, id));

    return newPosition;
  },

  /**
   * Get the next routine ID for the program based on current position
   */
  async getNextRoutineId(id: string): Promise<string | undefined> {
    const program = await this.getByIdWithRoutines(id);
    if (!program || program.routines.length === 0) return undefined;

    // For both continuous and finite, use position mod routine count
    // to get the current routine in the rotation
    const routineIndex = (program.currentPosition ?? 0) % program.routines.length;
    return program.routines[routineIndex]?.routineId;
  },

  /**
   * Check if a finite program is complete
   */
  async isComplete(id: string): Promise<boolean> {
    const program = await this.getById(id);
    if (!program) return false;

    if (program.type === 'continuous') return false;

    return (program.currentPosition ?? 0) >= (program.totalWorkouts ?? 0);
  },

  /**
   * Mark a program as complete
   */
  async markComplete(id: string): Promise<Program | undefined> {
    const results = await db
      .update(programs)
      .set({
        completedAt: new Date().toISOString(),
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(programs.id, id))
      .returning();

    return results[0];
  },

  /**
   * Delete a program
   */
  async delete(id: string): Promise<boolean> {
    const results = await db.delete(programs).where(eq(programs.id, id)).returning();
    return results.length > 0;
  },
};

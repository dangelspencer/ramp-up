import {
  checkAutoProgression,
  calculateVolume,
  isSetSuccessful,
  calculateCompletionRate,
  ExerciseConfig,
  CompletedSet,
} from '../../utils/calculations/autoProgression';

describe('autoProgression', () => {
  const exerciseWithProgression: ExerciseConfig = {
    maxWeight: 225,
    weightIncrement: 5,
    autoProgression: true,
  };

  const exerciseWithoutProgression: ExerciseConfig = {
    maxWeight: 225,
    weightIncrement: 5,
    autoProgression: false,
  };

  describe('checkAutoProgression', () => {
    it('progresses when all 100% sets completed with target reps', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 60, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 80, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      const result = checkAutoProgression(exerciseWithProgression, sets);

      expect(result.shouldProgress).toBe(true);
      expect(result.newMaxWeight).toBe(230);
      expect(result.increment).toBe(5);
    });

    it('progresses when 100% sets exceed target reps', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 7, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 6, completed: true },
      ];

      const result = checkAutoProgression(exerciseWithProgression, sets);

      expect(result.shouldProgress).toBe(true);
    });

    it('does not progress when auto-progression is disabled', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      const result = checkAutoProgression(exerciseWithoutProgression, sets);

      expect(result.shouldProgress).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('does not progress when 100% set missed reps', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 3, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      const result = checkAutoProgression(exerciseWithProgression, sets);

      expect(result.shouldProgress).toBe(false);
      expect(result.reason).toContain('target reps');
    });

    it('does not progress when 100% set not completed', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: null, completed: false },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      const result = checkAutoProgression(exerciseWithProgression, sets);

      expect(result.shouldProgress).toBe(false);
      expect(result.reason).toContain('completed');
    });

    it('does not progress when no 100% sets exist', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 60, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 80, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 90, targetReps: 5, actualReps: 5, completed: true },
      ];

      const result = checkAutoProgression(exerciseWithProgression, sets);

      expect(result.shouldProgress).toBe(false);
      expect(result.reason).toContain('No sets at 100%');
    });

    it('only considers 100% sets for progression', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 60, targetReps: 5, actualReps: 2, completed: true }, // Failed warm-up is OK
        { percentageOfMax: 80, targetReps: 5, actualReps: 3, completed: true }, // Failed warm-up is OK
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true }, // Must pass
      ];

      const result = checkAutoProgression(exerciseWithProgression, sets);

      expect(result.shouldProgress).toBe(true);
    });

    it('handles empty sets array', () => {
      const result = checkAutoProgression(exerciseWithProgression, []);

      expect(result.shouldProgress).toBe(false);
    });

    it('handles 2.5 lb increment', () => {
      const exercise: ExerciseConfig = {
        maxWeight: 105,
        weightIncrement: 2.5,
        autoProgression: true,
      };

      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      const result = checkAutoProgression(exercise, sets);

      expect(result.shouldProgress).toBe(true);
      expect(result.newMaxWeight).toBe(107.5);
      expect(result.increment).toBe(2.5);
    });
  });

  describe('calculateVolume', () => {
    it('calculates total volume correctly', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 60, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 80, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      const volume = calculateVolume(sets, 225);

      // (225 * 0.6 * 5) + (225 * 0.8 * 5) + (225 * 1.0 * 5)
      // = 675 + 900 + 1125 = 2700
      expect(volume).toBe(2700);
    });

    it('excludes incomplete sets', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: null, completed: false },
      ];

      const volume = calculateVolume(sets, 225);

      // Only first set counts: 225 * 5 = 1125
      expect(volume).toBe(1125);
    });

    it('returns 0 for empty sets', () => {
      expect(calculateVolume([], 225)).toBe(0);
    });
  });

  describe('isSetSuccessful', () => {
    it('returns true for successful set', () => {
      const set: CompletedSet = {
        percentageOfMax: 100,
        targetReps: 5,
        actualReps: 5,
        completed: true,
      };

      expect(isSetSuccessful(set)).toBe(true);
    });

    it('returns true when exceeding target reps', () => {
      const set: CompletedSet = {
        percentageOfMax: 100,
        targetReps: 5,
        actualReps: 7,
        completed: true,
      };

      expect(isSetSuccessful(set)).toBe(true);
    });

    it('returns false for incomplete set', () => {
      const set: CompletedSet = {
        percentageOfMax: 100,
        targetReps: 5,
        actualReps: null,
        completed: false,
      };

      expect(isSetSuccessful(set)).toBe(false);
    });

    it('returns false when missing target reps', () => {
      const set: CompletedSet = {
        percentageOfMax: 100,
        targetReps: 5,
        actualReps: 3,
        completed: true,
      };

      expect(isSetSuccessful(set)).toBe(false);
    });
  });

  describe('calculateCompletionRate', () => {
    it('calculates 100% for all successful sets', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
      ];

      expect(calculateCompletionRate(sets)).toBe(100);
    });

    it('calculates partial completion rate', () => {
      const sets: CompletedSet[] = [
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 3, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 5, completed: true },
        { percentageOfMax: 100, targetReps: 5, actualReps: 2, completed: true },
      ];

      // 2 out of 4 successful = 50%
      expect(calculateCompletionRate(sets)).toBe(50);
    });

    it('returns 0 for empty array', () => {
      expect(calculateCompletionRate([])).toBe(0);
    });
  });
});

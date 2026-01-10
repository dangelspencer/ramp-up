import {
  calculateWeightFromPercentage,
  roundToIncrement,
  calculatePercentage,
  generateWarmupSets,
} from '../../utils/calculations/percentageWeight';

describe('percentageWeight', () => {
  describe('roundToIncrement', () => {
    it('rounds to nearest 5 lbs', () => {
      expect(roundToIncrement(132, 5)).toBe(130);
      expect(roundToIncrement(133, 5)).toBe(135);
      expect(roundToIncrement(137, 5)).toBe(135);
      expect(roundToIncrement(138, 5)).toBe(140);
    });

    it('rounds to nearest 2.5 lbs', () => {
      expect(roundToIncrement(131, 2.5)).toBe(130);
      expect(roundToIncrement(132.5, 2.5)).toBe(132.5);
      expect(roundToIncrement(133, 2.5)).toBe(132.5);
      expect(roundToIncrement(134, 2.5)).toBe(135);
    });

    it('returns original value for zero increment', () => {
      expect(roundToIncrement(133.7, 0)).toBe(133.7);
    });

    it('handles exact multiples', () => {
      expect(roundToIncrement(135, 5)).toBe(135);
      expect(roundToIncrement(132.5, 2.5)).toBe(132.5);
    });
  });

  describe('calculateWeightFromPercentage', () => {
    it('calculates 60% of 225 with 5 lb increment', () => {
      // 225 * 0.6 = 135 (exact)
      const result = calculateWeightFromPercentage(225, 60, 5);
      expect(result).toBe(135);
    });

    it('calculates 70% of 225 with 5 lb increment', () => {
      // 225 * 0.7 = 157.5, rounds to 160
      const result = calculateWeightFromPercentage(225, 70, 5);
      expect(result).toBe(160);
    });

    it('calculates 80% of 225 with 5 lb increment', () => {
      // 225 * 0.8 = 180 (exact)
      const result = calculateWeightFromPercentage(225, 80, 5);
      expect(result).toBe(180);
    });

    it('calculates 90% of 225 with 5 lb increment', () => {
      // 225 * 0.9 = 202.5, rounds to 205
      const result = calculateWeightFromPercentage(225, 90, 5);
      expect(result).toBe(205);
    });

    it('calculates 100% of 225', () => {
      const result = calculateWeightFromPercentage(225, 100, 5);
      expect(result).toBe(225);
    });

    it('calculates with 2.5 lb increment', () => {
      // 105 * 0.6 = 63, rounds to 62.5
      const result = calculateWeightFromPercentage(105, 60, 2.5);
      expect(result).toBe(62.5);
    });

    it('returns minimum weight for 0 percent', () => {
      const result = calculateWeightFromPercentage(225, 0, 5, 45);
      expect(result).toBe(45);
    });

    it('returns minimum weight when calculation is below minimum', () => {
      // Very small max weight
      const result = calculateWeightFromPercentage(50, 60, 5, 45);
      // 50 * 0.6 = 30, but min is 45
      expect(result).toBe(45);
    });

    it('handles percentages over 100', () => {
      const result = calculateWeightFromPercentage(225, 110, 5);
      // Should just round max weight
      expect(result).toBe(225);
    });

    it('uses custom minimum weight', () => {
      const result = calculateWeightFromPercentage(50, 50, 5, 25);
      // 50 * 0.5 = 25
      expect(result).toBe(25);
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(135, 225)).toBeCloseTo(60, 1);
      expect(calculatePercentage(180, 225)).toBe(80);
      expect(calculatePercentage(225, 225)).toBe(100);
    });

    it('handles weight greater than max', () => {
      expect(calculatePercentage(250, 225)).toBeGreaterThan(100);
    });

    it('returns 0 for zero max weight', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
    });

    it('returns 0 for zero weight', () => {
      expect(calculatePercentage(0, 225)).toBe(0);
    });
  });

  describe('generateWarmupSets', () => {
    it('generates standard warmup scheme', () => {
      const sets = generateWarmupSets(225, 5, 45);

      // Should have bar, then progressive warmups to max
      expect(sets[0]).toBe(45); // Bar
      expect(sets[sets.length - 1]).toBe(225); // Working weight
    });

    it('includes all distinct weights', () => {
      const sets = generateWarmupSets(225, 5, 45);

      // Each weight should be unique
      const uniqueSets = [...new Set(sets)];
      expect(uniqueSets.length).toBe(sets.length);
    });

    it('handles small max weight', () => {
      const sets = generateWarmupSets(65, 5, 45);

      // Should collapse warmups when they round to same weight
      expect(sets[0]).toBe(45);
      expect(sets.includes(65)).toBe(true);
    });

    it('uses custom bar weight', () => {
      const sets = generateWarmupSets(75, 2.5, 25);

      expect(sets[0]).toBe(25); // EZ bar
    });

    it('generates ascending weights', () => {
      const sets = generateWarmupSets(225, 5, 45);

      for (let i = 1; i < sets.length; i++) {
        expect(sets[i]).toBeGreaterThan(sets[i - 1]);
      }
    });
  });
});

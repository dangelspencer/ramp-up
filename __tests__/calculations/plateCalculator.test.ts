import {
  calculatePlates,
  getPlateLoadingOrder,
  formatPlateCalculation,
  PlateInventoryItem,
} from '../../utils/calculations/plateCalculator';

describe('plateCalculator', () => {
  const standardInventory: PlateInventoryItem[] = [
    { weight: 45, count: 4 },
    { weight: 25, count: 4 },
    { weight: 10, count: 4 },
    { weight: 5, count: 4 },
    { weight: 2.5, count: 4 },
  ];

  const standardBarWeight = 45;

  describe('calculatePlates', () => {
    it('calculates 225 lbs correctly (2x45 per side)', () => {
      const result = calculatePlates(225, standardBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(225);
      expect(result.isExact).toBe(true);
      expect(result.platesPerSide).toEqual([{ weight: 45, count: 2 }]);
    });

    it('calculates 135 lbs correctly (1x45 per side)', () => {
      const result = calculatePlates(135, standardBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(135);
      expect(result.isExact).toBe(true);
      expect(result.platesPerSide).toEqual([{ weight: 45, count: 1 }]);
    });

    it('calculates 185 lbs correctly (1x45 + 1x25 per side)', () => {
      const result = calculatePlates(185, standardBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(185);
      expect(result.isExact).toBe(true);
      expect(result.platesPerSide).toEqual([
        { weight: 45, count: 1 },
        { weight: 25, count: 1 },
      ]);
    });

    it('calculates bar-only case correctly', () => {
      const result = calculatePlates(45, standardBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(45);
      expect(result.isExact).toBe(true);
      expect(result.platesPerSide).toEqual([]);
    });

    it('handles weight less than bar', () => {
      const result = calculatePlates(30, standardBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(45);
      expect(result.isExact).toBe(false);
      expect(result.platesPerSide).toEqual([]);
    });

    it('reports when exact weight not achievable', () => {
      // 227 is not achievable with standard plates
      const result = calculatePlates(227, standardBarWeight, standardInventory);

      expect(result.isExact).toBe(false);
      expect(result.achievableWeight).toBe(225);
    });

    it('handles complex weight calculations', () => {
      // 210 lbs = 45 bar + (45 + 25 + 10 + 2.5) * 2 per side
      // 45 + 82.5 * 2 = 45 + 165 = 210
      const result = calculatePlates(210, standardBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(210);
      expect(result.isExact).toBe(true);
      expect(result.platesPerSide).toEqual([
        { weight: 45, count: 1 },
        { weight: 25, count: 1 },
        { weight: 10, count: 1 },
        { weight: 2.5, count: 1 },
      ]);
    });

    it('handles different bar weights', () => {
      const ezBarWeight = 25;
      // 75 lbs = 25 bar + 25 per side
      const result = calculatePlates(75, ezBarWeight, standardInventory);

      expect(result.achievableWeight).toBe(75);
      expect(result.isExact).toBe(true);
      expect(result.totalBarWeight).toBe(25);
    });

    it('respects inventory limits', () => {
      const limitedInventory: PlateInventoryItem[] = [
        { weight: 45, count: 2 }, // Only 1 pair
        { weight: 25, count: 4 },
      ];

      // Trying to get 315 (needs 3x45 per side) but only have 1 pair
      const result = calculatePlates(315, standardBarWeight, limitedInventory);

      expect(result.isExact).toBe(false);
      // Should use 1x45 + 2x25 = 95 per side = 190 total + 45 bar = 235
      expect(result.achievableWeight).toBeLessThan(315);
    });

    it('ignores plates with count less than 2', () => {
      const oddInventory: PlateInventoryItem[] = [
        { weight: 45, count: 1 }, // Only 1 plate, not a pair
        { weight: 25, count: 4 },
      ];

      const result = calculatePlates(135, standardBarWeight, oddInventory);

      // Can't use 45s (only 1), target is 135 = 45 bar + 45 per side
      // With only 25lb plates, 45 per side: 1x25 = 25, leaves 20 unfulfilled
      // Result: 45 bar + 25 * 2 = 95 lbs
      expect(result.achievableWeight).toBe(95);
      expect(result.isExact).toBe(false);
      expect(result.platesPerSide).toEqual([{ weight: 25, count: 1 }]);
    });

    it('handles empty inventory', () => {
      const result = calculatePlates(135, standardBarWeight, []);

      expect(result.achievableWeight).toBe(45);
      expect(result.isExact).toBe(false);
      expect(result.platesPerSide).toEqual([]);
    });
  });

  describe('getPlateLoadingOrder', () => {
    it('returns flat array of plates', () => {
      const calculation = calculatePlates(275, standardBarWeight, standardInventory);
      const order = getPlateLoadingOrder(calculation);

      // 275 = 45 bar + (45 + 45 + 25) * 2 = 45 + 115 * 2 = 45 + 230 = 275
      expect(order).toEqual([45, 45, 25]);
    });

    it('returns empty array for bar only', () => {
      const calculation = calculatePlates(45, standardBarWeight, standardInventory);
      const order = getPlateLoadingOrder(calculation);

      expect(order).toEqual([]);
    });
  });

  describe('formatPlateCalculation', () => {
    it('formats standard calculation', () => {
      const calculation = calculatePlates(225, standardBarWeight, standardInventory);
      const formatted = formatPlateCalculation(calculation);

      expect(formatted).toBe('2x45 per side');
    });

    it('formats complex calculation', () => {
      const calculation = calculatePlates(185, standardBarWeight, standardInventory);
      const formatted = formatPlateCalculation(calculation);

      expect(formatted).toBe('1x45 + 1x25 per side');
    });

    it('formats bar-only case', () => {
      const calculation = calculatePlates(45, standardBarWeight, standardInventory);
      const formatted = formatPlateCalculation(calculation);

      expect(formatted).toBe('Just the bar');
    });
  });
});

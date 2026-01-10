import {
  calculateUSNavyBodyFat,
  getBodyFatCategory,
  getBMICategory,
  heightToInches,
  inchesToHeight,
  convertMetricToImperial,
  BodyFatInput,
} from '../../utils/calculations/bodyFat';

describe('bodyFat', () => {
  describe('calculateUSNavyBodyFat', () => {
    it('calculates male body fat correctly', () => {
      const input: BodyFatInput = {
        gender: 'male',
        heightInches: 70, // 5'10"
        weightLbs: 180,
        waistInches: 34,
        neckInches: 15,
      };

      const result = calculateUSNavyBodyFat(input);

      // Expected: ~18% body fat for these measurements
      expect(result.bodyFatPercent).toBeGreaterThan(15);
      expect(result.bodyFatPercent).toBeLessThan(22);
      expect(result.leanMass).toBeLessThan(result.fatMass + result.leanMass);
      expect(result.fatMass + result.leanMass).toBeCloseTo(180, 0);
    });

    it('calculates female body fat correctly', () => {
      const input: BodyFatInput = {
        gender: 'female',
        heightInches: 65, // 5'5"
        weightLbs: 140,
        waistInches: 30,
        neckInches: 13,
        hipInches: 38,
      };

      const result = calculateUSNavyBodyFat(input);

      // Expected: ~26% body fat for these measurements
      expect(result.bodyFatPercent).toBeGreaterThan(22);
      expect(result.bodyFatPercent).toBeLessThan(32);
      expect(result.fatMass + result.leanMass).toBeCloseTo(140, 0);
    });

    it('throws error for female without hip measurement', () => {
      const input: BodyFatInput = {
        gender: 'female',
        heightInches: 65,
        weightLbs: 140,
        waistInches: 30,
        neckInches: 13,
      };

      expect(() => calculateUSNavyBodyFat(input)).toThrow('Hip measurement required');
    });

    it('throws error for invalid measurements', () => {
      const input: BodyFatInput = {
        gender: 'male',
        heightInches: 0,
        weightLbs: 180,
        waistInches: 34,
        neckInches: 15,
      };

      expect(() => calculateUSNavyBodyFat(input)).toThrow('positive numbers');
    });

    it('throws error when neck is larger than waist', () => {
      const input: BodyFatInput = {
        gender: 'male',
        heightInches: 70,
        weightLbs: 180,
        waistInches: 14,
        neckInches: 15,
      };

      expect(() => calculateUSNavyBodyFat(input)).toThrow('Waist must be larger');
    });

    it('clamps body fat to reasonable range', () => {
      // Very lean person
      const leanInput: BodyFatInput = {
        gender: 'male',
        heightInches: 70,
        weightLbs: 150,
        waistInches: 28,
        neckInches: 16,
      };

      const leanResult = calculateUSNavyBodyFat(leanInput);
      expect(leanResult.bodyFatPercent).toBeGreaterThanOrEqual(2);

      // Very high body fat
      const highInput: BodyFatInput = {
        gender: 'male',
        heightInches: 70,
        weightLbs: 300,
        waistInches: 50,
        neckInches: 15,
      };

      const highResult = calculateUSNavyBodyFat(highInput);
      expect(highResult.bodyFatPercent).toBeLessThanOrEqual(60);
    });

    it('calculates BMI correctly', () => {
      const input: BodyFatInput = {
        gender: 'male',
        heightInches: 70, // 5'10"
        weightLbs: 180,
        waistInches: 34,
        neckInches: 15,
      };

      const result = calculateUSNavyBodyFat(input);

      // BMI = (180 / (70 * 70)) * 703 ≈ 25.8
      expect(result.bmi).toBeCloseTo(25.8, 0);
    });

    it('returns values rounded to one decimal', () => {
      const input: BodyFatInput = {
        gender: 'male',
        heightInches: 70,
        weightLbs: 180,
        waistInches: 34,
        neckInches: 15,
      };

      const result = calculateUSNavyBodyFat(input);

      // Check that values have at most 1 decimal place
      expect(result.bodyFatPercent).toBe(
        Math.round(result.bodyFatPercent * 10) / 10
      );
      expect(result.bmi).toBe(Math.round(result.bmi * 10) / 10);
    });
  });

  describe('getBodyFatCategory', () => {
    describe('male categories', () => {
      it('returns Essential Fat for very low body fat', () => {
        expect(getBodyFatCategory(5, 'male')).toBe('Essential Fat');
      });

      it('returns Athletes for athletic range', () => {
        expect(getBodyFatCategory(10, 'male')).toBe('Athletes');
      });

      it('returns Fitness for fit range', () => {
        expect(getBodyFatCategory(16, 'male')).toBe('Fitness');
      });

      it('returns Average for average range', () => {
        expect(getBodyFatCategory(20, 'male')).toBe('Average');
      });

      it('returns Obese for high body fat', () => {
        expect(getBodyFatCategory(30, 'male')).toBe('Obese');
      });
    });

    describe('female categories', () => {
      it('returns Essential Fat for very low body fat', () => {
        expect(getBodyFatCategory(12, 'female')).toBe('Essential Fat');
      });

      it('returns Athletes for athletic range', () => {
        expect(getBodyFatCategory(18, 'female')).toBe('Athletes');
      });

      it('returns Fitness for fit range', () => {
        expect(getBodyFatCategory(23, 'female')).toBe('Fitness');
      });

      it('returns Average for average range', () => {
        expect(getBodyFatCategory(28, 'female')).toBe('Average');
      });

      it('returns Obese for high body fat', () => {
        expect(getBodyFatCategory(35, 'female')).toBe('Obese');
      });
    });
  });

  describe('getBMICategory', () => {
    it('returns Underweight for BMI < 18.5', () => {
      expect(getBMICategory(17)).toBe('Underweight');
    });

    it('returns Normal for BMI 18.5-24.9', () => {
      expect(getBMICategory(22)).toBe('Normal');
    });

    it('returns Overweight for BMI 25-29.9', () => {
      expect(getBMICategory(27)).toBe('Overweight');
    });

    it('returns Obese for BMI >= 30', () => {
      expect(getBMICategory(32)).toBe('Obese');
    });
  });

  describe('heightToInches', () => {
    it('converts feet and inches correctly', () => {
      expect(heightToInches(5, 10)).toBe(70);
      expect(heightToInches(6, 0)).toBe(72);
      expect(heightToInches(5, 6)).toBe(66);
    });
  });

  describe('inchesToHeight', () => {
    it('converts inches to feet and inches', () => {
      expect(inchesToHeight(70)).toEqual({ feet: 5, inches: 10 });
      expect(inchesToHeight(72)).toEqual({ feet: 6, inches: 0 });
      expect(inchesToHeight(66)).toEqual({ feet: 5, inches: 6 });
    });
  });

  describe('convertMetricToImperial', () => {
    it('converts metric measurements correctly', () => {
      const metric = {
        heightCm: 177.8, // ~70 inches
        weightKg: 81.65, // ~180 lbs
        waistCm: 86.36, // ~34 inches
        neckCm: 38.1, // ~15 inches
        hipCm: 96.52, // ~38 inches
      };

      const imperial = convertMetricToImperial(metric);

      expect(imperial.heightInches).toBeCloseTo(70, 0);
      expect(imperial.weightLbs).toBeCloseTo(180, 0);
      expect(imperial.waistInches).toBeCloseTo(34, 0);
      expect(imperial.neckInches).toBeCloseTo(15, 0);
      expect(imperial.hipInches).toBeCloseTo(38, 0);
    });

    it('handles undefined hip measurement', () => {
      const metric = {
        heightCm: 177.8,
        weightKg: 81.65,
        waistCm: 86.36,
        neckCm: 38.1,
      };

      const imperial = convertMetricToImperial(metric);

      expect(imperial.hipInches).toBeUndefined();
    });
  });
});

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { settingsService } from '@/services/settings.service';

export type OnboardingStep =
  | 'welcome'
  | 'profile'
  | 'health'
  | 'barbells'
  | 'plates'
  | 'exercises'
  | 'routine'
  | 'program'
  | 'body-composition'
  | 'complete';

interface OnboardingData {
  height?: number;
  gender?: 'male' | 'female';
  units?: 'imperial' | 'metric';
  healthKitEnabled?: boolean;
  selectedBarbells?: string[];
  plateInventory?: Array<{ weight: number; count: number }>;
  exercises?: Array<{ name: string; maxWeight: number; barbellId?: string }>;
  routine?: { name: string; exerciseIds: string[] };
  program?: { name: string; routineIds: string[] };
  bodyComposition?: {
    weight?: number;
    waist?: number;
    neck?: number;
    hip?: number;
  };
}

interface OnboardingContextType {
  currentStep: OnboardingStep;
  data: OnboardingData;
  isComplete: boolean;
  setStep: (step: OnboardingStep) => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

const STEPS_ORDER: OnboardingStep[] = [
  'welcome',
  'profile',
  'health',
  'barbells',
  'plates',
  'exercises',
  'routine',
  'program',
  'body-composition',
  'complete',
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>({});
  const [isComplete, setIsComplete] = useState(false);

  const setStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const getStepIndex = useCallback((step: OnboardingStep) => {
    return STEPS_ORDER.indexOf(step);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < STEPS_ORDER.length - 1) {
      setCurrentStep(STEPS_ORDER[currentIndex + 1]);
    }
  }, [currentStep, getStepIndex]);

  const previousStep = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS_ORDER[currentIndex - 1]);
    }
  }, [currentStep, getStepIndex]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const completeOnboarding = useCallback(async () => {
    await settingsService.completeOnboarding();
    setIsComplete(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setCurrentStep('welcome');
    setData({});
    setIsComplete(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        data,
        isComplete,
        setStep,
        updateData,
        nextStep,
        previousStep,
        skipStep,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

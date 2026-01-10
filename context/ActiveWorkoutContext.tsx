import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { workoutService, WorkoutWithDetails, AutoProgressionResult } from '@/services/workout.service';

interface WorkoutSet {
  id: string;
  orderIndex: number;
  targetWeight: number;
  actualWeight: number | null;
  targetReps: number;
  actualReps: number | null;
  percentageOfMax: number | null;
  restTime: number;
  completed: boolean;
}

interface WorkoutExercise {
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
  sets: WorkoutSet[];
}

interface RestTimer {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

interface ActiveWorkoutState {
  isActive: boolean;
  workoutId: string | null;
  routineId: string | null;
  routineName: string | null;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  restTimer: RestTimer;
  autoProgressionResults: AutoProgressionResult[];
  isCompleting: boolean;
  startedAt: string | null;
}

type ActiveWorkoutAction =
  | { type: 'START_WORKOUT'; payload: WorkoutWithDetails }
  | { type: 'COMPLETE_SET'; payload: { exerciseIndex: number; setIndex: number; actualWeight: number; actualReps: number } }
  | { type: 'UPDATE_SET'; payload: { exerciseIndex: number; setIndex: number; updates: Partial<WorkoutSet> } }
  | { type: 'START_REST_TIMER'; payload: { seconds: number } }
  | { type: 'TICK_REST_TIMER' }
  | { type: 'SKIP_REST_TIMER' }
  | { type: 'SET_CURRENT_EXERCISE'; payload: number }
  | { type: 'SET_CURRENT_SET'; payload: number }
  | { type: 'START_COMPLETING' }
  | { type: 'COMPLETE_WORKOUT'; payload: { progressionResults: AutoProgressionResult[] } }
  | { type: 'CANCEL_WORKOUT' }
  | { type: 'CLEAR_PROGRESSION_RESULTS' };

const initialState: ActiveWorkoutState = {
  isActive: false,
  workoutId: null,
  routineId: null,
  routineName: null,
  exercises: [],
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  restTimer: {
    isRunning: false,
    remainingSeconds: 0,
    totalSeconds: 0,
  },
  autoProgressionResults: [],
  isCompleting: false,
  startedAt: null,
};

function activeWorkoutReducer(
  state: ActiveWorkoutState,
  action: ActiveWorkoutAction
): ActiveWorkoutState {
  switch (action.type) {
    case 'START_WORKOUT': {
      const workout = action.payload;
      return {
        ...initialState,
        isActive: true,
        workoutId: workout.id,
        routineId: workout.routineId,
        routineName: workout.routine.name,
        exercises: workout.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) => ({
            ...s,
            actualWeight: s.actualWeight ?? null,
            actualReps: s.actualReps ?? null,
            completed: s.completed ?? false,
          })),
        })),
        startedAt: workout.startedAt,
      };
    }

    case 'COMPLETE_SET': {
      const { exerciseIndex, setIndex, actualWeight, actualReps } = action.payload;
      const newExercises = [...state.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        actualWeight,
        actualReps,
        completed: true,
      };
      exercise.sets = sets;
      newExercises[exerciseIndex] = exercise;

      return {
        ...state,
        exercises: newExercises,
      };
    }

    case 'UPDATE_SET': {
      const { exerciseIndex, setIndex, updates } = action.payload;
      const newExercises = [...state.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        ...updates,
      };
      exercise.sets = sets;
      newExercises[exerciseIndex] = exercise;

      return {
        ...state,
        exercises: newExercises,
      };
    }

    case 'START_REST_TIMER':
      return {
        ...state,
        restTimer: {
          isRunning: true,
          remainingSeconds: action.payload.seconds,
          totalSeconds: action.payload.seconds,
        },
      };

    case 'TICK_REST_TIMER':
      if (!state.restTimer.isRunning || state.restTimer.remainingSeconds <= 0) {
        return {
          ...state,
          restTimer: {
            ...state.restTimer,
            isRunning: false,
            remainingSeconds: 0,
          },
        };
      }
      return {
        ...state,
        restTimer: {
          ...state.restTimer,
          remainingSeconds: state.restTimer.remainingSeconds - 1,
        },
      };

    case 'SKIP_REST_TIMER':
      return {
        ...state,
        restTimer: {
          isRunning: false,
          remainingSeconds: 0,
          totalSeconds: state.restTimer.totalSeconds,
        },
      };

    case 'SET_CURRENT_EXERCISE':
      return {
        ...state,
        currentExerciseIndex: action.payload,
        currentSetIndex: 0,
      };

    case 'SET_CURRENT_SET':
      return {
        ...state,
        currentSetIndex: action.payload,
      };

    case 'START_COMPLETING':
      return {
        ...state,
        isCompleting: true,
      };

    case 'COMPLETE_WORKOUT':
      return {
        ...state,
        isActive: false,
        isCompleting: false,
        autoProgressionResults: action.payload.progressionResults,
      };

    case 'CANCEL_WORKOUT':
      return {
        ...initialState,
      };

    case 'CLEAR_PROGRESSION_RESULTS':
      return {
        ...state,
        autoProgressionResults: [],
      };

    default:
      return state;
  }
}

interface ActiveWorkoutContextType {
  state: ActiveWorkoutState;
  startWorkout: (routineId: string, programId?: string) => Promise<void>;
  completeSet: (
    exerciseIndex: number,
    setIndex: number,
    actualWeight: number,
    actualReps: number
  ) => Promise<void>;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>
  ) => void;
  startRestTimer: (seconds: number) => void;
  skipRestTimer: () => void;
  setCurrentExercise: (index: number) => void;
  setCurrentSet: (index: number) => void;
  completeWorkout: () => Promise<AutoProgressionResult[]>;
  cancelWorkout: () => Promise<void>;
  clearProgressionResults: () => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextType | undefined>(undefined);

interface ActiveWorkoutProviderProps {
  children: ReactNode;
}

export function ActiveWorkoutProvider({ children }: ActiveWorkoutProviderProps) {
  const [state, dispatch] = useReducer(activeWorkoutReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle rest timer
  useEffect(() => {
    if (state.restTimer.isRunning && state.restTimer.remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK_REST_TIMER' });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.restTimer.isRunning, state.restTimer.remainingSeconds]);

  const startWorkout = useCallback(async (routineId: string, programId?: string) => {
    const workout = await workoutService.startWorkout(routineId, programId);
    const workoutWithDetails = await workoutService.getByIdWithDetails(workout.id);
    if (workoutWithDetails) {
      dispatch({ type: 'START_WORKOUT', payload: workoutWithDetails });
    }
  }, []);

  const completeSet = useCallback(
    async (
      exerciseIndex: number,
      setIndex: number,
      actualWeight: number,
      actualReps: number
    ) => {
      const set = state.exercises[exerciseIndex]?.sets[setIndex];
      if (!set) return;

      // Update local state
      dispatch({
        type: 'COMPLETE_SET',
        payload: { exerciseIndex, setIndex, actualWeight, actualReps },
      });

      // Update database
      await workoutService.updateSet(set.id, {
        actualWeight,
        actualReps,
        completed: true,
      });

      // Auto-start rest timer
      if (set.restTime > 0) {
        dispatch({ type: 'START_REST_TIMER', payload: { seconds: set.restTime } });
      }
    },
    [state.exercises]
  );

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
      dispatch({ type: 'UPDATE_SET', payload: { exerciseIndex, setIndex, updates } });
    },
    []
  );

  const startRestTimer = useCallback((seconds: number) => {
    dispatch({ type: 'START_REST_TIMER', payload: { seconds } });
  }, []);

  const skipRestTimer = useCallback(() => {
    dispatch({ type: 'SKIP_REST_TIMER' });
  }, []);

  const setCurrentExercise = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_EXERCISE', payload: index });
  }, []);

  const setCurrentSet = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_SET', payload: index });
  }, []);

  const completeWorkout = useCallback(async () => {
    if (!state.workoutId) return [];

    dispatch({ type: 'START_COMPLETING' });

    const progressionResults = await workoutService.completeWorkout(state.workoutId);

    dispatch({ type: 'COMPLETE_WORKOUT', payload: { progressionResults } });

    return progressionResults;
  }, [state.workoutId]);

  const cancelWorkout = useCallback(async () => {
    if (state.workoutId) {
      await workoutService.delete(state.workoutId);
    }
    dispatch({ type: 'CANCEL_WORKOUT' });
  }, [state.workoutId]);

  const clearProgressionResults = useCallback(() => {
    dispatch({ type: 'CLEAR_PROGRESSION_RESULTS' });
  }, []);

  return (
    <ActiveWorkoutContext.Provider
      value={{
        state,
        startWorkout,
        completeSet,
        updateSet,
        startRestTimer,
        skipRestTimer,
        setCurrentExercise,
        setCurrentSet,
        completeWorkout,
        cancelWorkout,
        clearProgressionResults,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext);
  if (context === undefined) {
    throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider');
  }
  return context;
}

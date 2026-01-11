import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, Clock, Settings, ChevronRight, Play, Check, Scale, TrendingUp, Trophy, Target, Plus, Minus, ChevronLeft, Sun, Moon, Monitor, GripVertical, X, Calculator } from 'lucide-react';

// Theme configurations
const themes = {
  light: {
    bg: 'bg-gray-100',
    bgAlt: 'bg-white',
    bgCard: 'bg-white',
    bgInput: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    textSubtle: 'text-gray-400',
    navBg: 'bg-white',
    navBorder: 'border-gray-200',
    completedBg: 'bg-green-50',
    completedBorder: 'border-green-300',
  },
  dark: {
    bg: 'bg-gray-950',
    bgAlt: 'bg-gray-900',
    bgCard: 'bg-gray-900',
    bgInput: 'bg-gray-800',
    border: 'border-gray-800',
    text: 'text-white',
    textMuted: 'text-gray-400',
    textSubtle: 'text-gray-500',
    navBg: 'bg-gray-900',
    navBorder: 'border-gray-800',
    completedBg: 'bg-green-900/30',
    completedBorder: 'border-green-700',
  }
};

// Plate colors that fit the orange theme
const plateColors = {
  45: 'bg-orange-600',
  35: 'bg-orange-500',
  25: 'bg-amber-600',
  10: 'bg-yellow-600',
  5: 'bg-orange-400',
  2.5: 'bg-amber-500'
};

// Mock data
const mockProgram = {
  name: "Novice Template A",
  currentWorkout: 7,
  totalWorkouts: 12,
  nextRoutine: "Workout B"
};

const mockNextWorkout = {
  name: "Workout B",
  exercises: [
    { name: "Squat", sets: 6 },
    { name: "Press", sets: 6 },
    { name: "Deadlift", sets: 5 }
  ]
};

const mockBodyComp = {
  weight: 185,
  bodyFat: 18.5,
  leanMass: 150.8,
  lastUpdated: "2 days ago"
};

const mockGoal = {
  workoutsThisWeek: 2,
  workoutsTarget: 3,
  streakWeeks: 4
};

const mockWorkoutExercises = [
  {
    name: "Squat",
    maxWeight: 225,
    sets: [
      { weight: 45, percent: null, reps: 10, label: "Bar", rest: 60, completed: false },
      { weight: 135, percent: 60, reps: 5, rest: 90, completed: false },
      { weight: 160, percent: 70, reps: 5, rest: 90, completed: false },
      { weight: 180, percent: 80, reps: 5, rest: 120, completed: false },
      { weight: 205, percent: 90, reps: 5, rest: 180, completed: false },
      { weight: 225, percent: 100, reps: 5, rest: 180, completed: false }
    ]
  },
  {
    name: "Press",
    maxWeight: 105,
    sets: [
      { weight: 45, percent: null, reps: 10, label: "Bar", rest: 60, completed: false },
      { weight: 65, percent: 60, reps: 5, rest: 90, completed: false },
      { weight: 75, percent: 70, reps: 5, rest: 90, completed: false },
      { weight: 85, percent: 80, reps: 5, rest: 120, completed: false },
      { weight: 95, percent: 90, reps: 5, rest: 180, completed: false },
      { weight: 105, percent: 100, reps: 5, rest: 180, completed: false }
    ]
  },
  {
    name: "Deadlift",
    maxWeight: 275,
    sets: [
      { weight: 165, percent: 60, reps: 5, rest: 90, completed: false },
      { weight: 195, percent: 70, reps: 3, rest: 90, completed: false },
      { weight: 220, percent: 80, reps: 2, rest: 120, completed: false },
      { weight: 250, percent: 90, reps: 1, rest: 180, completed: false },
      { weight: 275, percent: 100, reps: 5, rest: 180, completed: false }
    ]
  }
];

const mockPlateInventory = [
  { weight: 45, count: 4 },
  { weight: 25, count: 4 },
  { weight: 10, count: 4 },
  { weight: 5, count: 4 },
  { weight: 2.5, count: 4 }
];

const mockRoutineExercises = [
  { name: "Squat", setsCount: 6 },
  { name: "Press", setsCount: 6 },
  { name: "Deadlift", setsCount: 5 }
];

// Phone Frame Component
const PhoneFrame = ({ children, theme }) => (
  <div className="bg-gray-700 rounded-3xl p-2 shadow-2xl w-80">
    <div className={`${themes[theme].bg} rounded-2xl overflow-hidden min-h-[600px] flex flex-col`}>
      {children}
    </div>
  </div>
);

// Bottom Navigation
const BottomNav = ({ active, onNavigate, theme }) => {
  const t = themes[theme];
  return (
    <div className={`${t.navBg} border-t ${t.navBorder} px-6 py-3 flex justify-around`}>
      {[
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'exercises', icon: Dumbbell, label: 'Exercises' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-1 ${active === item.id ? 'text-orange-500' : t.textSubtle}`}
        >
          <item.icon size={20} />
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// Theme Toggle Component
const ThemeToggle = ({ themeSetting, onThemeChange, theme }) => {
  const t = themes[theme];
  const options = [
    { id: 'light', icon: Sun },
    { id: 'system', icon: Monitor },
    { id: 'dark', icon: Moon }
  ];
  
  return (
    <div className={`${t.bgInput} rounded-lg p-1 flex`}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onThemeChange(opt.id)}
          className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all ${
            themeSetting === opt.id 
              ? 'bg-orange-500 text-white' 
              : t.textMuted
          }`}
        >
          <opt.icon size={16} />
          <span className="text-xs capitalize">{opt.id}</span>
        </button>
      ))}
    </div>
  );
};

// Plate Calculator Helper
const calculatePlates = (target, barWeight = 45) => {
  let remaining = (target - barWeight) / 2;
  const plates = [];
  const available = mockPlateInventory.map(p => ({ ...p }));
  
  for (const plate of available) {
    while (remaining >= plate.weight && plate.count >= 2) {
      plates.push(plate.weight);
      remaining -= plate.weight;
      plate.count -= 2;
    }
  }
  return plates;
};

// Home Screen
const HomeScreen = ({ onStartWorkout, theme }) => {
  const t = themes[theme];
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 pt-12 pb-4">
        <h1 className={`text-2xl font-bold ${t.text}`}>RampUp</h1>
        <p className={`${t.textMuted} text-sm`}>Let's get stronger</p>
      </div>
      
      <div className="flex-1 px-4 space-y-4 overflow-auto pb-4">
        {/* Combined Program + Goal Card */}
        <div className={`${t.bgCard} rounded-xl p-4 border ${t.border}`}>
          <div className="mb-1">
            <span className={`${t.textMuted} text-sm`}>Active Program</span>
          </div>
          <h2 className={`${t.text} font-semibold`}>{mockProgram.name}</h2>
          <div className="flex items-center gap-1 mt-1 mb-3">
            <Trophy size={14} className="text-orange-500" />
            <span className="text-orange-500 text-sm font-medium">{mockGoal.streakWeeks} week streak</span>
          </div>
          
          {/* Program Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className={t.textMuted}>Program Progress</span>
              <span className="text-orange-500 font-medium">{mockProgram.currentWorkout}/{mockProgram.totalWorkouts}</span>
            </div>
            <div className={`h-2 ${t.bgInput} rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                style={{ width: `${(mockProgram.currentWorkout / mockProgram.totalWorkouts) * 100}%` }}
              />
            </div>
          </div>

          {/* Weekly Goal */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={t.textMuted}>This Week</span>
              <span className={t.text}>{mockGoal.workoutsThisWeek}/{mockGoal.workoutsTarget} workouts</span>
            </div>
            <div className="flex gap-1">
              {[...Array(mockGoal.workoutsTarget)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-2 rounded-full ${i < mockGoal.workoutsThisWeek ? 'bg-orange-500' : t.bgInput}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Next Workout Card */}
        <button 
          onClick={onStartWorkout}
          className="w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-left shadow-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-orange-100 text-sm">Next Workout</span>
              <h2 className="text-white text-xl font-bold mt-1">{mockNextWorkout.name}</h2>
            </div>
            <div className="bg-white/20 rounded-full p-2">
              <Play size={24} className="text-white" fill="white" />
            </div>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {mockNextWorkout.exercises.map((ex, i) => (
              <span key={i} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {ex.name}
              </span>
            ))}
          </div>
          <p className="text-orange-100 text-sm mt-3">Tap to start →</p>
        </button>

        {/* Body Composition Card */}
        <div className={`${t.bgCard} rounded-xl p-4 border ${t.border}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className={t.textMuted} />
              <span className={`${t.textMuted} text-sm`}>Body Composition</span>
            </div>
            <span className={`${t.textSubtle} text-xs`}>{mockBodyComp.lastUpdated}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className={`text-2xl font-bold ${t.text}`}>{mockBodyComp.weight}</p>
              <p className={`${t.textSubtle} text-xs`}>Weight (lbs)</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${t.text}`}>{mockBodyComp.bodyFat}%</p>
              <p className={`${t.textSubtle} text-xs`}>Body Fat</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${t.text}`}>{mockBodyComp.leanMass}</p>
              <p className={`${t.textSubtle} text-xs`}>Lean (lbs)</p>
            </div>
          </div>
          <button className={`w-full mt-3 py-2 border ${t.border} rounded-lg ${t.textMuted} text-sm`}>
            Log Measurement
          </button>
        </div>
      </div>
    </div>
  );
};

// Workout Exercise List Screen
const WorkoutExerciseListScreen = ({ exercises, onSelectExercise, onComplete, onBack, theme }) => {
  const t = themes[theme];
  
  return (
    <div className="flex-1 flex flex-col">
      <div className={`px-4 pt-12 pb-4 ${t.bgAlt} border-b ${t.border}`}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={t.textMuted}>Cancel</button>
          <h1 className={`${t.text} font-semibold`}>Workout B</h1>
          <button onClick={onComplete} className="text-orange-500 font-semibold">Finish</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {exercises.map((exercise, i) => {
          const completedSets = exercise.sets.filter(s => s.completed).length;
          const totalSets = exercise.sets.length;
          const isComplete = completedSets === totalSets;
          
          return (
            <button
              key={i}
              onClick={() => onSelectExercise(i)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                isComplete 
                  ? `${t.completedBg} ${t.completedBorder}` 
                  : `${t.bgCard} ${t.border}`
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {isComplete ? (
                    <Check size={18} className="text-white" />
                  ) : (
                    <span className="text-white text-sm font-bold">{i + 1}</span>
                  )}
                </div>
                <div className="text-left">
                  <p className={`${t.text} font-medium`}>{exercise.name}</p>
                  <p className={`${t.textSubtle} text-sm`}>
                    {completedSets}/{totalSets} sets • Max: {exercise.maxWeight} lbs
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className={t.textSubtle} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Workout Sets Screen
const WorkoutSetsScreen = ({ exercise, exerciseIndex, totalExercises, onBack, onToggleSet, onNextExercise, onShowPlateCalc, theme }) => {
  const t = themes[theme];
  const [restTimer, setRestTimer] = useState(null);
  
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const allSetsComplete = completedSets === exercise.sets.length;

  const handleToggleSet = (setIndex) => {
    const set = exercise.sets[setIndex];
    onToggleSet(exerciseIndex, setIndex);
    if (!set.completed && set.rest) {
      setRestTimer(set.rest);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className={`px-4 pt-12 pb-4 ${t.bgAlt} border-b ${t.border}`}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1">
            <ChevronLeft size={20} className={t.textMuted} />
            <span className={t.textMuted}>Back</span>
          </button>
          <h1 className={`${t.text} font-semibold`}>{exercise.name}</h1>
          <div className="w-16" />
        </div>
        <p className={`${t.textMuted} text-sm text-center mt-1`}>Max: {exercise.maxWeight} lbs</p>
      </div>

      {restTimer && (
        <div className="bg-orange-500 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-white" />
            <span className="text-white font-medium">Rest Timer</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-xl font-bold">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</span>
            <button onClick={() => setRestTimer(null)} className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-2">
          {exercise.sets.map((set, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl transition-all border ${
                set.completed 
                  ? `${t.completedBg} ${t.completedBorder}` 
                  : `${t.bgCard} ${t.border}`
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleToggleSet(i)}
                  className="flex items-center gap-4 flex-1"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    set.completed ? 'bg-green-500 border-green-500' : 'border-gray-500'
                  }`}>
                    {set.completed && <Check size={14} className="text-white" />}
                  </div>
                  <div className="text-left">
                    <p className={`${t.text} font-medium`}>
                      {set.label || `${set.weight} lbs`}
                      {set.percent && <span className={`${t.textSubtle} ml-1`}>({set.percent}%)</span>}
                    </p>
                    <p className={`${t.textSubtle} text-sm`}>{set.reps} reps • {set.rest}s rest</p>
                  </div>
                </button>
                <button 
                  onClick={() => onShowPlateCalc(set.weight)}
                  className={`p-2 rounded-lg ${t.bgInput}`}
                >
                  <Calculator size={18} className={t.textMuted} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {allSetsComplete && exerciseIndex < totalExercises - 1 && (
        <div className="p-4">
          <button 
            onClick={onNextExercise}
            className="w-full bg-orange-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            Next Exercise
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// Plate Calculator Modal
const PlateCalculatorModal = ({ targetWeight, onClose, theme }) => {
  const t = themes[theme];
  const [weight, setWeight] = useState(targetWeight);
  const barWeight = 45;
  
  const neededPlates = calculatePlates(weight, barWeight);
  const achievable = neededPlates.reduce((sum, p) => sum + p, 0) * 2 + barWeight;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-end">
      <div className={`${t.bgAlt} rounded-t-3xl w-full p-4 space-y-4`}>
        <div className="flex justify-between items-center">
          <h2 className={`${t.text} font-semibold text-lg`}>Plate Calculator</h2>
          <button onClick={onClose} className={`p-2 rounded-full ${t.bgInput}`}>
            <X size={20} className={t.textMuted} />
          </button>
        </div>

        {/* Target Weight Input */}
        <div className={`${t.bgCard} rounded-xl p-4 border ${t.border}`}>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setWeight(w => Math.max(barWeight, w - 5))}
              className={`w-10 h-10 ${t.bgInput} rounded-full flex items-center justify-center`}
            >
              <Minus size={18} className={t.text} />
            </button>
            <div className="text-center">
              <span className={`text-3xl font-bold ${t.text}`}>{weight}</span>
              <span className={`${t.textMuted} text-lg ml-1`}>lbs</span>
            </div>
            <button 
              onClick={() => setWeight(w => w + 5)}
              className={`w-10 h-10 ${t.bgInput} rounded-full flex items-center justify-center`}
            >
              <Plus size={18} className={t.text} />
            </button>
          </div>
        </div>

        {/* Bar Visualization */}
        <div className="flex items-center justify-center gap-1 py-4">
          <div className="flex items-center">
            {neededPlates.slice().reverse().map((plateWeight, i) => (
              <div 
                key={i}
                className={`${plateColors[plateWeight] || 'bg-orange-500'} rounded-sm flex items-center justify-center text-white text-xs font-bold`}
                style={{ 
                  width: Math.max(18, plateWeight * 0.7),
                  height: Math.min(50, 28 + plateWeight * 0.5)
                }}
              >
                {plateWeight}
              </div>
            ))}
          </div>
          <div className={`w-16 h-3 ${t.bgInput} rounded-full`} />
          <div className="flex items-center">
            {neededPlates.map((plateWeight, i) => (
              <div 
                key={i}
                className={`${plateColors[plateWeight] || 'bg-orange-500'} rounded-sm flex items-center justify-center text-white text-xs font-bold`}
                style={{ 
                  width: Math.max(18, plateWeight * 0.7),
                  height: Math.min(50, 28 + plateWeight * 0.5)
                }}
              >
                {plateWeight}
              </div>
            ))}
          </div>
        </div>

        {/* Plate List */}
        <div className={`${t.bgCard} rounded-xl p-4 border ${t.border}`}>
          <label className={`${t.textMuted} text-sm mb-2 block`}>Each Side</label>
          {neededPlates.length > 0 ? (
            <div className="space-y-1">
              {Object.entries(
                neededPlates.reduce((acc, p) => {
                  acc[p] = (acc[p] || 0) + 1;
                  return acc;
                }, {})
              ).map(([plateWeight, count]) => (
                <div key={plateWeight} className="flex justify-between items-center">
                  <span className={t.text}>{plateWeight} lbs</span>
                  <span className={t.textMuted}>× {count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={t.textMuted}>Just the bar!</p>
          )}
          
          {achievable !== weight && (
            <div className="mt-3 p-2 bg-orange-500/20 rounded-lg">
              <p className="text-orange-500 text-sm">
                Closest achievable: {achievable} lbs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Workout Screen (Main Controller)
const WorkoutScreen = ({ onComplete, onBack, theme }) => {
  const [exercises, setExercises] = useState(mockWorkoutExercises);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);

  const handleToggleSet = (exIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets[setIndex].completed = !newExercises[exIndex].sets[setIndex].completed;
    setExercises(newExercises);
  };

  const handleNextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      setCurrentExercise(null);
    }
  };

  // Auto-advance when all sets complete
  useEffect(() => {
    if (currentExercise !== null) {
      const exercise = exercises[currentExercise];
      const allComplete = exercise.sets.every(s => s.completed);
      if (allComplete && currentExercise < exercises.length - 1) {
        const timer = setTimeout(() => {
          setCurrentExercise(currentExercise + 1);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [exercises, currentExercise]);

  return (
    <div className="flex-1 flex flex-col relative">
      {currentExercise === null ? (
        <WorkoutExerciseListScreen
          exercises={exercises}
          onSelectExercise={setCurrentExercise}
          onComplete={onComplete}
          onBack={onBack}
          theme={theme}
        />
      ) : (
        <WorkoutSetsScreen
          exercise={exercises[currentExercise]}
          exerciseIndex={currentExercise}
          totalExercises={exercises.length}
          onBack={() => setCurrentExercise(null)}
          onToggleSet={handleToggleSet}
          onNextExercise={handleNextExercise}
          onShowPlateCalc={setPlateCalcWeight}
          theme={theme}
        />
      )}
      
      {plateCalcWeight !== null && (
        <PlateCalculatorModal
          targetWeight={plateCalcWeight}
          onClose={() => setPlateCalcWeight(null)}
          theme={theme}
        />
      )}
    </div>
  );
};

// Routine Builder Screen
const RoutineBuilderScreen = ({ onBack, theme }) => {
  const t = themes[theme];
  const [exercises, setExercises] = useState(mockRoutineExercises);
  const [routineName, setRoutineName] = useState("Workout B");

  return (
    <div className="flex-1 flex flex-col">
      <div className={`px-4 pt-12 pb-4 ${t.bgAlt} border-b ${t.border}`}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={t.textMuted}>Cancel</button>
          <h1 className={`${t.text} font-semibold`}>Edit Routine</h1>
          <button className="text-orange-500 font-semibold">Save</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Routine Name */}
        <div className={`${t.bgCard} rounded-xl p-4 border ${t.border}`}>
          <label className={`${t.textMuted} text-sm block mb-1`}>Routine Name</label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className={`w-full ${t.text} text-lg font-semibold bg-transparent border-none outline-none text-center`}
          />
        </div>

        {/* Exercises */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={`${t.textMuted} text-sm`}>Exercises</label>
          </div>
          
          <div className="space-y-2">
            {exercises.map((exercise, i) => (
              <div 
                key={i}
                className={`${t.bgCard} rounded-xl p-4 border ${t.border} flex items-center gap-3`}
              >
                <GripVertical size={20} className={t.textSubtle} />
                <div className="flex-1">
                  <p className={`${t.text} font-medium`}>{exercise.name}</p>
                  <p className={`${t.textSubtle} text-sm`}>{exercise.setsCount} sets</p>
                </div>
                <button className={t.textSubtle}>
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>

          <button className={`w-full mt-3 py-3 border-2 border-dashed ${t.border} rounded-xl ${t.textMuted} flex items-center justify-center gap-2`}>
            <Plus size={18} />
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Screen
const SettingsScreen = ({ themeSetting, onThemeChange, theme }) => {
  const t = themes[theme];
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 pt-12 pb-4">
        <h1 className={`text-2xl font-bold ${t.text}`}>Settings</h1>
      </div>

      <div className="flex-1 px-4 space-y-4 overflow-auto pb-4">
        {/* Appearance */}
        <div className={`${t.bgCard} rounded-xl p-4 border ${t.border}`}>
          <label className={`${t.textMuted} text-sm mb-3 block`}>Appearance</label>
          <ThemeToggle themeSetting={themeSetting} onThemeChange={onThemeChange} theme={theme} />
        </div>

        {/* Other Settings */}
        {[
          { label: 'Barbells', value: '2 configured' },
          { label: 'Plate Inventory', value: '5 sizes' },
          { label: 'Default Weight Increment', value: '5 lbs' },
          { label: 'Default Rest Time', value: '90 sec' },
        ].map((setting, i) => (
          <button 
            key={i}
            className={`w-full ${t.bgCard} rounded-xl p-4 border ${t.border} flex justify-between items-center`}
          >
            <span className={`${t.text} text-left`}>{setting.label}</span>
            <div className="flex items-center gap-2">
              <span className={t.textMuted}>{setting.value}</span>
              <ChevronRight size={18} className={t.textSubtle} />
            </div>
          </button>
        ))}

        {/* Notifications Section */}
        <div className={`${t.bgCard} rounded-xl border ${t.border} overflow-hidden`}>
          <div className={`p-4 border-b ${t.border}`}>
            <span className={`${t.textMuted} text-sm`}>Notifications</span>
          </div>
          {[
            { label: 'Post-Workout Encouragement', enabled: true },
            { label: 'Workout Reminders', enabled: true },
            { label: 'Measurement Reminders', enabled: false },
          ].map((notif, i) => (
            <div 
              key={i}
              className={`p-4 flex justify-between items-center ${i < 2 ? `border-b ${t.border}` : ''}`}
            >
              <span className={`${t.text} text-left flex-1`}>{notif.label}</span>
              <div className={`w-12 h-7 rounded-full p-1 ${notif.enabled ? 'bg-orange-500' : t.bgInput}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notif.enabled ? 'translate-x-5' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Workout Complete Screen
const WorkoutCompleteScreen = ({ onDone, theme }) => {
  const t = themes[theme];
  return (
    <div className={`flex-1 flex flex-col items-center justify-center px-6 text-center`}>
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
        <Check size={40} className="text-white" />
      </div>
      <h1 className={`text-2xl font-bold ${t.text} mb-2`}>Workout Complete!</h1>
      <p className={`${t.textMuted} mb-8`}>Great session. You're getting stronger.</p>
      
      <div className={`${t.bgCard} rounded-xl p-4 w-full mb-4 border ${t.border}`}>
        <div className="flex items-center gap-2 text-orange-500 mb-2">
          <TrendingUp size={18} />
          <span className="font-medium">Auto-Progression</span>
        </div>
        <p className={t.text}>Squat max increased to <span className="font-bold">230 lbs</span></p>
      </div>

      <div className={`${t.bgCard} rounded-xl p-4 w-full mb-8 border ${t.border}`}>
        <p className={`${t.textMuted} text-sm mb-1`}>This Week</p>
        <p className={`${t.text} text-lg`}>3 of 3 workouts complete ✓</p>
      </div>

      <button 
        onClick={onDone}
        className="w-full bg-orange-500 text-white font-semibold py-4 rounded-xl"
      >
        Done
      </button>
    </div>
  );
};

// Main App
export default function RampUpMockup() {
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [themeSetting, setThemeSetting] = useState('dark');
  
  const systemTheme = 'dark';
  const theme = themeSetting === 'system' ? systemTheme : themeSetting;

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setScreen('home');
    else if (tab === 'settings') setScreen('settings');
  };

  const showNav = ['home', 'settings'].includes(screen);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-white text-xl font-bold mb-2">RampUp Mockups</h2>
        <p className="text-gray-400 mb-6 text-sm">Interactive prototype • Click to explore</p>
        
        <PhoneFrame theme={theme}>
          {screen === 'home' && (
            <>
              <HomeScreen onStartWorkout={() => setScreen('workout')} theme={theme} />
              <BottomNav active={activeTab} onNavigate={handleNavigate} theme={theme} />
            </>
          )}
          {screen === 'workout' && (
            <WorkoutScreen 
              onComplete={() => setScreen('complete')} 
              onBack={() => setScreen('home')}
              theme={theme}
            />
          )}
          {screen === 'complete' && (
            <WorkoutCompleteScreen onDone={() => { setScreen('home'); setActiveTab('home'); }} theme={theme} />
          )}
          {screen === 'routineBuilder' && (
            <RoutineBuilderScreen onBack={() => setScreen('home')} theme={theme} />
          )}
          {screen === 'settings' && (
            <>
              <SettingsScreen 
                themeSetting={themeSetting} 
                onThemeChange={setThemeSetting} 
                theme={theme}
              />
              <BottomNav active={activeTab} onNavigate={handleNavigate} theme={theme} />
            </>
          )}
        </PhoneFrame>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => { setScreen('home'); setActiveTab('home'); }}
            className={`px-3 py-1 rounded-full text-sm ${screen === 'home' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setScreen('workout')}
            className={`px-3 py-1 rounded-full text-sm ${screen === 'workout' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Workout
          </button>
          <button 
            onClick={() => setScreen('routineBuilder')}
            className={`px-3 py-1 rounded-full text-sm ${screen === 'routineBuilder' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Routine Builder
          </button>
          <button 
            onClick={() => { setScreen('settings'); setActiveTab('settings'); }}
            className={`px-3 py-1 rounded-full text-sm ${screen === 'settings' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

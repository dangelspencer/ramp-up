# RampUp - Feature Definition

## Overview

RampUp is a personal weightlifting app designed for percentage-based training programs. It supports custom routines, automatic weight calculations, progress tracking, and mid-workout adjustments.

---

## Core Concepts

### Barbell
A piece of equipment with a defined weight:
- Name (e.g., "Olympic Bar", "Curl Bar", "EZ Bar")
- Weight (e.g., 45 lbs, 25 lbs)
- One barbell designated as default for new exercises

### Exercise
A single movement (e.g., Squat, Bench Press, Deadlift) with associated settings:
- Name
- Max weight (represents 100% for percentage calculations)
- Weight increment (2.5 lbs or 5 lbs) — used for both rounding and auto-progression
- Auto-progression enabled (boolean)
- Associated barbell (defaults to system default, changeable per exercise)
- Default rest time (used as default when adding exercise to routines)

### Routine
A reusable workout template containing:
- Name (e.g., "Workout A", "Workout B")
- Ordered list of exercises with set schemes
- Each exercise entry defines sets with:
  - Weight type toggle: Percentage or Fixed
  - Value: Percentage of max (e.g., 60%) or absolute weight (e.g., 45 lbs)
  - Rep count
  - Rest time (defaults from exercise setting, overridable per set)

### Program
A collection of routines with scheduling:
- Name (e.g., "Novice Template A: Workouts 1–12")
- Ordered list of routines (defines rotation order)
- Program type:
  - **Continuous**: Repeats indefinitely (A → B → A → B → ...)
  - **Finite**: Defined number of total workouts (e.g., 12), then complete
- Only one program is "active" at a time

### Workout
A logged training session:
- Date/time
- Associated routine (reference)
- Actual performed sets with weights and reps
- Any mid-workout adjustments noted

---

## Features

### 1. Barbell Management

**Add/Edit/Delete Barbells**
- Create barbells with name and weight
- Common presets available: Olympic Bar (45 lbs), Curl Bar (25 lbs), etc.
- Designate one barbell as system default

**Default Barbell**
- New exercises automatically use the default barbell
- Changeable per exercise when needed
- Plate calculator uses exercise's assigned barbell weight

---

### 2. Exercise Management

**Add/Edit/Delete Exercises**
- Create custom exercises with name and initial max weight
- Select associated barbell (pre-filled with system default)
- Configure weight increment (2.5 or 5 lbs) — applies to rounding and auto-progression
- Toggle auto-progression on/off
- Set default rest time for the exercise
- Global exercise library accessible from settings

**Max Weight Management**
- View and edit max weight for any exercise from global settings
- Max weight represents 100% for all percentage calculations
- History of max weight changes (optional, for reference)

---

### 3. Routine Builder

**Create/Edit/Delete Routines**
- Name the routine
- Add exercises from the exercise library
- For each exercise, define sets:
  - Toggle: Percentage (`%`) or Fixed (`lbs`)
  - Percentage mode: Enter percentage value (e.g., 60) and rep count
  - Fixed mode: Enter weight value (e.g., 45) and rep count
  - Rest time: Pre-filled from exercise default, overridable per set
- Reorder exercises via drag-and-drop
- Duplicate existing routines as templates

**Set Display Format**
- Percentage sets display calculated weight with percentage notation
- Example: "135 lbs (60%) × 5"
- Calculated weight respects exercise's weight increment setting (rounded to nearest)
- Fixed sets display as-is: "45 lbs × 10"

---

### 4. Program Management

**Create/Edit/Delete Programs**
- Name the program
- Add routines to the program in order
- Define rotation (e.g., A → B → A → B)
- Select program type:
  - **Continuous**: Repeats forever
  - **Finite**: Set total workout count (e.g., 12 workouts)
- Set one program as "active"

**Switch Active Program**
- Quick-switch from home screen or settings
- Switching programs resets position in routine rotation

**Finite Program Completion**
- When final workout is completed:
  - Trigger celebration notification
  - Notification tap opens celebration screen
- Celebration screen displays:
  - Program name and duration
  - Total workouts completed
  - Max weight increases achieved during program
  - Total volume lifted (optional stat)
  - Body composition changes during program period (if measurements logged)
- Prompt to select next program
- Completed programs stored in history

---

### 5. Home Screen

**Active Program Overview**
- Program name
- For finite programs: Progress indicator (e.g., "Workout 7 of 12" with progress bar)
- For continuous programs: Current position in rotation

**Next Workout Card**
- Prominently displayed
- Shows next routine name and exercises
- Single tap to start workout immediately

**Body Composition Card**
- Latest measurements: Weight, body fat %, lean mass
- Date of last measurement
- Tap to log new measurement or view history

**Goal Progress** (if active)
- Current streak
- This week's workout count vs target

---

### 6. Workout Execution

**Start Workout**
- Tap next workout card on home screen to begin instantly
- Alternative: Manual routine selection available

**During Workout**
- Display all sets with calculated weights
- Check off completed sets
- Log actual reps performed (pre-filled with target, editable)
- Rest timer:
  - Automatically starts after completing a set
  - Displays countdown based on set's rest time
  - Skip button to proceed early
  - Optional audio/haptic alert when rest complete
- Tap any weight to:
  - View plate breakdown (using exercise's assigned barbell)
  - Manually adjust weight for this set only

**Mid-Workout Adjustments**
- Adjustments affect current session only
- Tap a set's weight to modify just that set
- Log missed reps by editing rep count
- Add notes to individual sets if needed

**Complete Workout**
- Summary screen showing completed sets
- Auto-progression trigger: If ALL sets at 100% completed with full reps:
  - Increase exercise max weight by configured increment
  - Display notification: "Nice work! [Exercise] max increased to [new weight] lbs"
- Save workout to history

---

### 7. Workout History

**View Past Workouts**
- List view sorted by date (newest first)
- Filter by program, routine, or exercise
- Each entry shows:
  - Date
  - Routine name
  - Exercises performed
  - Any notes or adjustments made

**Exercise History**
- View all instances of a specific exercise
- Track max weight progression over time
- See trends (optional: simple chart)

---

### 8. Goal Tracking

**Workout Frequency Goal**
- Define goal: X workouts per week for Y weeks
- Define preferred schedule: Specific days (e.g., Mon/Wed/Fri) with target time
- Progress tracking:
  - Current streak (weeks completed)
  - This week's progress (X of Y workouts done)

**Streak Rules**
- Missing a required workout day resets the streak
- Flexible timing: Workout can be done anytime on scheduled day
- Grace: Workout counts for the day it's logged

**Notifications**
- If scheduled workout day and no workout logged by configured time:
  - Send reminder notification
  - Rotating messages:
    - "You've got a workout scheduled today—let's keep the momentum going!"
    - "Still time to get your workout in. Your future self will thank you."
    - "Don't break the chain! Your workout's waiting for you."
    - "Quick reminder: you planned to lift today. Let's make it happen."
  - Configurable reminder time (e.g., 6 PM if no workout by then)

---

### 9. Plate Calculator

**Plate Inventory**
- Define owned plates:
  - Quantity of each plate size (e.g., 4× 45 lbs, 4× 25 lbs, etc.)
  - Support standard sizes: 45, 35, 25, 10, 5, 2.5 lbs
  - Support custom plate sizes if needed

**Calculator Function**
- Input: Target weight
- Output: Plates needed per side (based on selected barbell weight)
- Select which barbell to use for calculation
- Accounts for available inventory
- Warns if target weight not achievable with owned plates
- Accessible from:
  - Standalone tool in app
  - Quick-access during workout: Tap any weight to see plate breakdown (auto-selects exercise's assigned barbell)

---

### 10. Rest Timer

**Configuration**
- Exercise default: Set default rest time when creating/editing exercise
- Per-set override: Adjust rest time for individual sets in routine builder
- Common presets: 1:00, 1:30, 2:00, 3:00, 5:00 + custom entry

**During Workout**
- Auto-starts countdown after marking set complete
- Visual countdown display
- Skip button to proceed immediately
- Audio and/or haptic alert when rest complete (configurable)

---

### 11. Body Composition Tracking

**Log Measurements**
- Weight
- Waist circumference
- Neck circumference
- Date/time auto-captured, editable

**Automatic Calculations**
- Body fat percentage (US Navy Method — requires height and gender in settings)
- BMI (Body Mass Index)
- Lean body mass
- Calculations update automatically when new measurements logged

**Measurement History**
- Chronological list of all entries
- View trends over time (simple chart showing weight, body fat %, lean mass)
- Correlate with workout history (optional: overlay lifting milestones)

**Reminder Notifications**
- Configurable reminder to log measurements
- Frequency options: Daily, Weekly, Custom interval (e.g., every 3 days)
- Set preferred time of day
- Enable/disable independently from workout reminders

**Apple Health Integration** (iOS only)
- Sync measurements to Apple Health:
  - Weight
  - Body fat percentage
  - Lean body mass
- Pull height from Apple Health (or set manually)
- Toggle sync on/off
- Only available when running on Apple device

---

### 12. Notifications

**Post-Workout Encouragement**
- Trigger: After completing and saving a workout
- Randomized encouraging messages:
  - "Great session! You're getting stronger."
  - "Another one in the books. Keep it up!"
  - "Consistency builds strength. Nice work today."
  - "That's how it's done. Recovery time—you earned it."

**Workout Reminder**
- Trigger: Scheduled workout day, no workout logged by configured time
- Rotating motivational messages (see Goal Tracking section)
- Configurable: Enable/disable, set reminder time

**Max Weight Increase**
- Trigger: Auto-progression activates after successful workout
- Message: "Nice work! [Exercise] max increased to [new weight] lbs"

**Measurement Reminder**
- Trigger: Based on configured frequency and time
- Message: "Time to log your measurements. Stay consistent, stay informed."

**Program Complete**
- Trigger: Final workout of a finite program completed
- Message: "You finished [Program Name]! Tap to see your progress."
- Tapping notification opens celebration screen

---

## Settings

### Global Settings
- Default barbell (for new exercises)
- Default weight increment for new exercises (2.5 or 5 lbs)
- Default rest time for new exercises
- Notification preferences (enable/disable each type)
- Workout reminder time

### Barbell Settings
- Add/edit/delete barbells
- Set default barbell

### Exercise Settings (per exercise)
- Max weight
- Weight increment (2.5 or 5 lbs)
- Auto-progression enabled
- Associated barbell
- Default rest time

### Plate Calculator Settings
- Plate inventory

### Body Composition Settings
- Height (manual entry or pulled from Apple Health)
- Gender (required for US Navy Method body fat calculation)
- Units preference: Imperial (lbs, inches) or Metric (kg, cm)
- Measurement reminder: Enable/disable, frequency, time of day
- Apple Health sync: Enable/disable (iOS only, hidden on non-Apple devices)

### Rest Timer Settings
- Audio alert: Enable/disable
- Haptic alert: Enable/disable

---

## User Flows

### First Launch
1. Welcome screen introducing RampUp
2. Set up profile: Height, gender, unit preferences
3. Apple Health permissions (iOS only): Sync measurements, pull height
4. Set up barbells (start with common presets, designate default)
5. Set up plate inventory (optional, can skip)
6. Create first exercise(s) with max weights
7. Create first routine
8. Create first program (choose continuous or finite)
9. Set program as active
10. Optional: Log initial body composition measurements
11. Ready to work out

### Typical Workout Session
1. Open app → Home screen shows next workout card with routine preview
2. Tap workout card to start immediately
3. View first exercise with calculated weights
4. Perform set, mark complete
5. Rest timer counts down automatically
6. Continue through all sets, tapping weights to see plate breakdown as needed
7. Move to next exercise, repeat
8. Complete all exercises
9. View summary, receive encouragement notification
10. If auto-progression triggered, see notification of max weight increase

### Adjusting Max Weight
1. Go to Settings → Exercises
2. Select exercise
3. Edit max weight
4. Save → All routines using this exercise now reflect new weight

### Logging Body Measurements
1. Navigate to Body Composition section
2. Tap "Log Measurement"
3. Enter weight, waist, neck (weight required, others optional but needed for body fat calc)
4. Review calculated metrics (body fat %, BMI, lean mass)
5. Save → Data stored locally, synced to Apple Health if enabled
6. View updated trends in history

---

## Technical Considerations

### Platform & Framework
- **Expo** (managed workflow) with **React Native**
- Target: iOS primary, Android secondary
- Expo SDK features utilized:
  - `expo-notifications` — local notifications for reminders, encouragement, auto-progression alerts
  - `expo-haptics` — rest timer haptic feedback
  - `expo-av` — rest timer audio alerts
  - `expo-apple-health` or `react-native-health` — Apple Health integration (iOS only, conditionally loaded)

### Data Persistence
- **Local-first architecture** — all data stored on device
- **SQLite** via `expo-sqlite` + **Drizzle ORM**:
  - Type-safe queries with SQL-like syntax
  - Schema defined in TypeScript, validated at compile time
  - Built-in migration system for schema updates between app versions
  - Tables: Barbells, Exercises, Routines, Programs, Workouts, BodyComposition, Goals

### State Management
- **React Context + useReducer** for global app state (active program, theme, settings)
- **Local component state** for UI-specific state (modals, form inputs)
- Consider **Zustand** if state complexity grows — lightweight and pairs well with persistence

### Navigation
- **React Navigation** (configuration-based routing)
- Tab navigator for main sections (Home, History, Exercises, Settings)
- Stack navigator for drill-downs (Workout → Sets, Exercise → Edit)
- Modal presentation for Plate Calculator

### Key Data Models

```
Barbell: { id, name, weight, isDefault }

Exercise: { id, name, maxWeight, weightIncrement, autoProgression, barbellId, defaultRestTime }

Routine: { id, name, exercises: [{ exerciseId, sets: [{ type, value, reps, restTime }] }] }

Program: { id, name, type, totalWorkouts?, routineIds[], currentPosition }

Workout: { id, date, programId, routineId, exercises: [{ exerciseId, sets: [{ targetWeight, actualWeight, targetReps, actualReps, completed }] }] }

BodyComposition: { id, date, weight, waist?, neck?, bodyFatPercent?, bmi?, leanMass? }

Goal: { id, workoutsPerWeek, weeks, scheduledDays[], reminderTime, startDate, currentStreak }
```

### Notifications Strategy
- All notifications are **local** (no push server required)
- Notification types:
  - **Scheduled**: Workout reminders, measurement reminders (recurring)
  - **Immediate**: Post-workout encouragement, auto-progression alerts, program complete
- Cancel/reschedule workout reminders when workout is logged

### Apple Health Integration
- **react-native-health** with Expo config plugin
- Conditionally import health module only on iOS (`Platform.OS === 'ios'`)
- Request permissions during onboarding (optional, skippable)
- Sync on measurement save:
  - Write: weight, body fat %, lean body mass
  - Read: height (one-time, to pre-fill settings)

### UI & Styling
- **NativeWind** (Tailwind CSS for React Native) — utility-first styling
- **lucide-react-native** — icon library
- Custom components built on React Native primitives (no heavy UI framework)

### Theming
- Theme context providing `light` / `dark` / `system` modes
- `useColorScheme()` hook for system preference detection
- Consistent color tokens across all components

### Offline-First
- No network dependency for core functionality
- App works fully offline
- Future consideration: optional cloud backup/sync

---

## Out of Scope (v1)

- Cloud sync / backup
- Social features
- Apple Watch app
- Video form guides
- AI-powered recommendations
- Units toggle (lbs / kg) — future consideration

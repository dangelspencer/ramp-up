# AGENTS.md

Guidelines for AI agents working in this React Native / Expo codebase.

## Build & Development Commands

```bash
# Start development server
yarn start              # or: npx expo start
yarn start --clear      # Clear Metro cache

# Run on devices/simulators
yarn ios                # iOS simulator
yarn android            # Android emulator

# Type checking
npx tsc --noEmit

# Linting
yarn lint               # Check for issues
yarn lint:fix           # Auto-fix issues

# Database (Drizzle ORM)
yarn db:generate        # Generate migrations
yarn db:push            # Push schema to database

# Clean build artifacts
yarn clean              # Removes node_modules/.cache, ios, android
```

## Testing

```bash
# Run all tests
yarn test

# Run a single test file
yarn test __tests__/calculations/plateCalculator.test.ts

# Run tests matching a pattern
yarn test --testNamePattern="calculatePlates"

# Watch mode
yarn test:watch

# Coverage report
yarn test:coverage
```

Tests use Jest with ts-jest. Test files live in `__tests__/` with `.test.ts` extension.

## Project Structure

```
app/                    # Expo Router screens (file-based routing)
components/             # React components
  ui/                   # Primitives (Button, Input, Modal, etc.)
  workout/              # Feature-specific components
  home/                 # Home screen widgets
context/                # React Context providers
db/
  schema/               # Drizzle ORM table definitions
  client.ts             # Database connection
services/               # Business logic layer (*.service.ts)
hooks/                  # Custom React hooks
utils/
  calculations/         # Pure calculation functions
  formatting/           # Display formatting utilities
__tests__/              # Jest tests mirror source structure
```

## Code Style

### Imports

Order imports in groups, separated by blank lines:
1. External packages (react, react-native, expo-*, drizzle-orm)
2. Internal aliases (@/db, @/services, @/components, @/utils, @/hooks)
3. Relative imports (./sibling, ../parent)

```typescript
import { eq, desc } from 'drizzle-orm';

import { db } from '@/db/client';
import { workouts } from '@/db/schema';
import { exerciseService } from '@/services/exercise.service';

import { LocalHelper } from './helpers';
```

Use path aliases (`@/`) instead of deep relative paths.

### TypeScript

- Strict mode enabled - no implicit any
- Export types alongside implementations: `export type Workout = typeof workouts.$inferSelect`
- Prefer interfaces for object shapes, types for unions/primitives
- Use explicit return types on exported functions
- Prefix unused variables with underscore: `_unusedVar`

```typescript
export interface WorkoutWithDetails extends Workout {
  routine: { id: string; name: string };
  exercises: WorkoutExerciseWithDetails[];
}

export async function getById(id: string): Promise<Workout | undefined> {
  // ...
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files - components | PascalCase.tsx | `RestTimer.tsx` |
| Files - services | camelCase.service.ts | `workout.service.ts` |
| Files - schemas | camelCase.ts | `workout.ts` |
| Files - utils | camelCase.ts | `plateCalculator.ts` |
| Components | PascalCase | `function RestTimer()` |
| Hooks | useCamelCase | `useSettings`, `usePrograms` |
| Services | camelCaseService | `workoutService` |
| DB tables | camelCase (plural) | `workouts`, `workoutSets` |
| DB columns | snake_case | `started_at`, `workout_id` |
| Types/Interfaces | PascalCase | `WorkoutSet`, `AppSettings` |
| Functions | camelCase | `calculatePlates` |
| Constants | SCREAMING_SNAKE | `DEFAULT_REST_TIME` |

### Services Pattern

Services are exported objects with async methods that interact with the database:

```typescript
export const workoutService = {
  async getById(id: string): Promise<Workout | undefined> {
    const results = await db.select().from(workouts).where(eq(workouts.id, id));
    return results[0];
  },

  async create(data: NewWorkout): Promise<Workout> {
    const [workout] = await db.insert(workouts).values(data).returning();
    return workout;
  },
};
```

### Components Pattern

- Use function declarations for components
- Props interfaces defined inline or above component
- Destructure props in function signature
- Use NativeWind (Tailwind) for styling via `className`

```typescript
interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  onSkip: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function RestTimer({
  remainingSeconds,
  totalSeconds,
  onSkip,
  size = 'md',
}: RestTimerProps) {
  const { effectiveTheme } = useSettings();
  const isDark = effectiveTheme === 'dark';

  return (
    <View className={`p-4 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
      {/* ... */}
    </View>
  );
}
```

### Context Pattern

```typescript
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // state and logic
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
```

### Error Handling

- Use try/catch in async service methods
- Log errors with `console.error('Failed to X:', error)`
- Throw meaningful errors for callers to handle
- Return `undefined` for not-found cases, don't throw

```typescript
async loadSettings() {
  try {
    const settings = await settingsService.getAll();
    setSettings(settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}
```

### Database Schema

Use Drizzle ORM with SQLite. Tables use `expo-crypto` for UUIDs:

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import * as Crypto from 'expo-crypto';

export const workouts = sqliteTable('workouts', {
  id: text('id').primaryKey().$defaultFn(() => Crypto.randomUUID()),
  routineId: text('routine_id').notNull().references(() => routines.id),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
});

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
```

### Testing

- Mock database and external services with `jest.mock()`
- Use `beforeEach` to clear mocks
- Use `jest.useFakeTimers()` for time-dependent tests
- Test files mirror source structure: `services/foo.service.ts` -> `__tests__/services/foo.service.test.ts`

```typescript
jest.mock('@/db/client', () => ({
  db: { select: jest.fn(), insert: jest.fn() },
}));

describe('workoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return workout by id', async () => {
    // arrange, act, assert
  });
});
```

### Barrel Exports

Use index.ts files to re-export from directories:

```typescript
// components/index.ts
export * from './ui';
export * from './workout';

// services/index.ts
export { workoutService } from './workout.service';
export { exerciseService } from './exercise.service';
```

## Key Dependencies

- **expo** ~54.x - React Native framework
- **drizzle-orm** - Type-safe SQL ORM
- **nativewind** - Tailwind CSS for React Native
- **lucide-react-native** - Icons
- **react-navigation** - Navigation (via Expo Router)

## Things to Avoid

- Don't use `any` without justification
- Don't mix snake_case and camelCase in JS/TS code (snake_case is only for DB columns)
- Don't import from deep paths when aliases exist
- Don't create components without dark mode support
- Don't forget to export types alongside service functions

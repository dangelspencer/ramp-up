# RampUp

A progressive strength training app built with React Native and Expo. RampUp helps you train smarter with percentage-based programming, automatic weight progression, and comprehensive body composition tracking.

## Features

- **Percentage-Based Training**: Calculate working weights as percentages of your 1-rep max
- **Auto-Progression**: Automatically increase your max when you complete all sets at target reps
- **Plate Calculator**: See exactly which plates to load based on your available inventory
- **Body Composition Tracking**: Track weight, measurements, and body fat using the US Navy method
- **Weekly Goals & Streaks**: Stay consistent with workout goal tracking
- **Apple Health Integration**: Sync body composition data to Apple Health (iOS only)
- **Customizable Programs**: Create routines and programs that cycle through your workouts
- **Rest Timer**: Configurable rest periods with audio and haptic feedback
- **Dark Mode**: Full light/dark/system theme support

## Tech Stack

- **Framework**: Expo (managed workflow) + React Native
- **Database**: SQLite via `expo-sqlite` + Drizzle ORM
- **Styling**: NativeWind (Tailwind CSS for RN)
- **Navigation**: Expo Router (file-based)
- **State**: React Context + useReducer
- **Testing**: Jest + jest-expo
- **Icons**: lucide-react-native

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- For physical device testing: Expo Go app or development build

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ramp-up
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

## Running the App

### On iOS Simulator (Mac only)

```bash
npx expo run:ios
```

Or press `i` in the Expo CLI after running `npx expo start`.

### On Android Emulator

```bash
npx expo run:android
```

Or press `a` in the Expo CLI after running `npx expo start`.

### On Physical Device with Expo Go

1. Install **Expo Go** from the App Store (iOS) or Play Store (Android)
2. Run `npx expo start`
3. Scan the QR code with your camera (iOS) or Expo Go app (Android)

### Creating a Development Build

For features like notifications and Apple Health, you'll need a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project (first time only)
eas build:configure

# Create a development build for iOS
eas build --profile development --platform ios

# Create a development build for Android
eas build --profile development --platform android
```

## Installing on Your Device

### iOS (TestFlight / Ad Hoc)

1. **Create a production build**
   ```bash
   eas build --platform ios
   ```

2. **Submit to TestFlight**
   ```bash
   eas submit --platform ios
   ```

3. Or install directly via ad-hoc distribution (requires Apple Developer account)

### Android (APK / Play Store)

1. **Create an APK for direct installation**
   ```bash
   eas build --platform android --profile preview
   ```

2. Download the APK and install on your device (enable "Install from unknown sources")

3. **For Play Store submission**
   ```bash
   eas build --platform android
   eas submit --platform android
   ```

## Project Structure

```
ramp-up/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigator screens
│   ├── onboarding/         # First-launch flow
│   ├── workout/            # Workout execution
│   ├── routine/            # Routine management
│   ├── program/            # Program management
│   ├── body-composition/   # Body tracking
│   └── settings/           # Settings screens
├── components/             # Reusable components
│   ├── ui/                 # Primitive components
│   ├── workout/            # Workout-specific
│   └── home/               # Home screen cards
├── context/                # React Context providers
├── db/                     # Database (Drizzle ORM)
│   └── schema/             # Database schemas
├── hooks/                  # Custom React hooks
├── services/               # Business logic layer
├── utils/                  # Utility functions
│   └── calculations/       # Core algorithms
└── __tests__/              # Jest tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Development Commands

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint
npx eslint "app/**/*.{ts,tsx}" "components/**/*.{ts,tsx}"

# Generate Drizzle migrations
npx drizzle-kit generate

# Push schema changes to database
npx drizzle-kit push
```

## Configuration

### Environment Setup

No environment variables are required for basic development. For production:

- **Apple Health**: Requires iOS development build with HealthKit entitlements
- **Notifications**: Works in Expo Go, but scheduled notifications require a development build

### Customizing the App

- **Default plates**: Edit `services/plateInventory.service.ts`
- **Default barbells**: Edit `services/barbell.service.ts`
- **Theme colors**: Edit `tailwind.config.js`
- **Database schema**: Edit files in `db/schema/`

## Troubleshooting

### "Metro bundler failed to start"
```bash
npx expo start --clear
```

### "Module not found" errors
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Database issues
The SQLite database is stored locally on the device. To reset:
- iOS Simulator: Reset the simulator (Device > Erase All Content and Settings)
- Android: Clear app data or uninstall/reinstall

### TypeScript errors
```bash
npx tsc --noEmit
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

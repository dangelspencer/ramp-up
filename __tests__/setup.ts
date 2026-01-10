// Jest setup file for unit tests

// Mock crypto.randomUUID for database operations
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    },
  });
}

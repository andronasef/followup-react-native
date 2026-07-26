jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reanimated ships its own jest mock. Shared values stay static under it, so
// reveal-gated buttons never animate in — tests assert on the emitted events
// rather than on animation-driven visibility.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

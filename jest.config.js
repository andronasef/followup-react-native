module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // Only *.test.* are suites — __tests__ also holds shared helpers
  // (fakeAnalytics.ts) that would otherwise be collected as empty test files.
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  // The react-native preset's default, widened to cover the two peer deps that
  // ship untranspiled TS/ESM (reanimated's jest mock, svg's source).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|react-native-svg)/)',
  ],
};

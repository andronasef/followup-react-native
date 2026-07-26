import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-native',
    'react-native-reanimated',
    'react-native-svg',
    '@react-native-async-storage/async-storage',
    'expo-linking',
    'expo-localization',
  ],
  outDir: 'lib',
});

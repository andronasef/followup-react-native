const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// The library lives one level up (linked via the "file:.." dependency in
// package.json) — metro won't resolve modules outside its project root
// without being told to watch it.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// The linked library's real path is outside projectRoot, so Metro's normal
// hierarchical node_modules search resolves these from the workspace root's
// node_modules first — a second copy of React/RN, breaking hooks ("Invalid
// hook call"). `extraNodeModules` is only a fallback for names that fail to
// resolve at all, so it doesn't help here; force resolution to always start
// from the example's own project root instead.
const singletons = [
  'react',
  'react-dom',
  'react-native',
  'scheduler',
  'react-native-reanimated',
  'react-native-svg',
  '@react-native-async-storage/async-storage',
  'expo-linking',
  'expo-localization',
];
// Matches both the bare specifier ("react") and subpath imports
// ("react/jsx-runtime", "react-native/Libraries/...").
const isSingletonRequest = (moduleName) =>
  singletons.some((name) => moduleName === name || moduleName.startsWith(name + '/'));

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isSingletonRequest(moduleName)) {
    return (defaultResolveRequest ?? context.resolveRequest)(
      { ...context, originModulePath: path.join(projectRoot, 'noop.js') },
      moduleName,
      platform
    );
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;

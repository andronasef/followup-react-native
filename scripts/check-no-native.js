#!/usr/bin/env node
/**
 * Fails if this package ever starts declaring native code.
 *
 * A pure-JS package installs into Expo Go with no prebuild. The moment an
 * android/ or ios/ folder, a podspec, a react-native.config.js linking a
 * native module, or an Expo config plugin appears, every consumer is forced
 * into a development build / EAS Build. That must be a deliberate decision,
 * not something that arrives with a dependency.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const errors = [];

const FORBIDDEN_PATHS = [
  ['android', 'native Android sources'],
  ['ios', 'native iOS sources'],
  ['react-native.config.js', 'RN autolinking config'],
  ['react-native.config.cjs', 'RN autolinking config'],
  ['app.plugin.js', 'Expo config plugin entry'],
  ['plugin', 'Expo config plugin sources'],
  ['expo-module.config.json', 'Expo module declaration'],
];

for (const [rel, what] of FORBIDDEN_PATHS) {
  if (fs.existsSync(path.join(root, rel))) {
    errors.push(`${rel} exists (${what}) — this package must stay pure JS / Expo Go compatible.`);
  }
}

for (const entry of fs.readdirSync(root)) {
  if (entry.endsWith('.podspec')) {
    errors.push(`${entry} exists — CocoaPods specs mean native code.`);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.expo && pkg.expo.plugin) {
  errors.push('package.json declares expo.plugin — config plugins require a development build.');
}
if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
  errors.push(`package.json has runtime dependencies (${Object.keys(pkg.dependencies).join(', ')}) — this package ships with none.`);
}
for (const field of ['dependencies', 'peerDependencies']) {
  for (const name of Object.keys(pkg[field] || {})) {
    if (/clarity|firebase|analytics|segment|amplitude|mixpanel|posthog/i.test(name)) {
      errors.push(`"${name}" is listed in ${field} — analytics SDKs belong to the host app, not here.`);
    }
  }
}

if (errors.length > 0) {
  console.error('Native/autolinking check FAILED:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Native/autolinking check passed — pure JS, no config plugin, Expo Go compatible.');

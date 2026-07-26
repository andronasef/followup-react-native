#!/usr/bin/env node
/**
 * Fails if the built bundle imports anything the library hasn't declared.
 *
 * The point is to keep this package analytics-agnostic and Expo Go friendly:
 * an analytics SDK sneaking into src/ would drag in a native module, break
 * Expo Go for every consumer, and risk a duplicate-initialization conflict
 * with whatever the host app already runs.
 *
 * The allowlist is react + react-native + the declared peerDependencies. The
 * brief said "nothing outside react / react-native"; it is widened to the
 * declared peers because this library legitimately imports reanimated, svg,
 * async-storage and the expo modules — all of which the host already installs.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const allowed = new Set(['react', 'react-native', ...Object.keys(pkg.peerDependencies || {})]);

// Anything that would pull in a process-wide analytics singleton.
const BANNED = /clarity|firebase|analytics|segment|amplitude|mixpanel|posthog|sentry|bugsnag/i;

const BUNDLES = ['lib/index.js', 'lib/index.mjs'];

/** Bare specifiers only — relative and absolute paths are our own code. */
function bareSpecifiers(source) {
  const found = new Set();
  const patterns = [
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const spec = match[1];
      if (spec.startsWith('.') || spec.startsWith('/')) continue;
      // Reduce "@scope/pkg/sub" -> "@scope/pkg", "pkg/sub" -> "pkg".
      const parts = spec.split('/');
      found.add(spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
    }
  }
  return found;
}

const errors = [];
let checked = 0;

for (const rel of BUNDLES) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    errors.push(`${rel} is missing — run \`npm run build\` before this check.`);
    continue;
  }
  checked++;
  for (const spec of bareSpecifiers(fs.readFileSync(file, 'utf8'))) {
    if (BANNED.test(spec)) {
      errors.push(`${rel} imports "${spec}" — analytics SDKs must never be imported from src/.`);
    } else if (!allowed.has(spec)) {
      errors.push(`${rel} imports undeclared package "${spec}".`);
    }
  }
}

if (errors.length > 0) {
  console.error('Bundle import check FAILED:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Bundle import check passed (${checked} bundle(s); allowed: ${[...allowed].sort().join(', ')}).`);

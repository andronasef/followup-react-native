// Used only by jest. The published bundle is built by tsup, which does not
// read this file. React Native's own preset is used rather than
// babel-preset-expo so that testing doesn't require the whole `expo` package
// as a devDependency — this library depends on two expo modules, not expo.
module.exports = {
  presets: ['module:@react-native/babel-preset'],
};

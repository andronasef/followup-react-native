import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../colors';

/** Appears after a scene's entrance animation settles — icon-only by design
 * so it needs no per-language "next" label. */
export function NextButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      hitSlop={8}
    >
      <Text style={styles.arrow}>{'→'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  buttonPressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
  arrow: { color: colors.buttonText, fontSize: 24 },
});

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { FollowUpGate, FollowUpTracker } from 'react-native-follow-up';

// Demo config: lowered threshold/delay so you can see the flow without
// opening the app 40 times. In a real app, use the defaults (40 / 10000ms).
const DEMO_THRESHOLD = 3;
const DEMO_DELAY_MS = 3000;

export default function App() {
  // Bumped to force FollowUpGate to remount (re-run its init/trigger logic)
  // after a debug reset — mirrors the Flutter example's `ValueKey` bump.
  const [gateGeneration, setGateGeneration] = useState(0);

  const forceTriggerNow = async () => {
    const tracker = await FollowUpTracker.create();
    await tracker.debugForceReady({ threshold: DEMO_THRESHOLD });
    setGateGeneration((g) => g + 1);
  };

  return (
    <FollowUpGate
      key={gateGeneration}
      openThreshold={DEMO_THRESHOLD}
      delay={DEMO_DELAY_MS}
      copyVariant={0}
      onInterested={async () => {
        Alert.alert('Thanks for your interest!', 'onInterested callback fired');
      }}
    >
      <View style={styles.container}>
        <Text style={styles.text}>
          This screen is wrapped in FollowUpGate.{'\n\n'}
          Demo config: shows after 3 "opens" + 3s delay, instead of the 40
          opens / 10s production default.
        </Text>
        <Pressable style={styles.button} onPress={forceTriggerNow}>
          <Text style={styles.buttonText}>Force-trigger the flow now</Text>
        </Pressable>
      </View>
    </FollowUpGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#B23A2E', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  buttonText: { color: '#FFF8EA', fontWeight: '700' },
});

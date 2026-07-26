import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { FollowUpStrings } from '../types';
import { colors } from '../colors';

/** The forced teaser shown before the flow: no close icon, no backdrop
 * dismiss, back gesture disabled by the host Modal. The only way forward is
 * "Learn More". */
export function TeaserPopup({
  strings,
  isRtl,
  onLearnMore,
}: {
  strings: FollowUpStrings;
  isRtl: boolean;
  onLearnMore: () => void;
}) {
  const textDir = isRtl ? ('rtl' as const) : ('ltr' as const);
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={[styles.headline, { writingDirection: textDir }]}>{strings.popupHeadline}</Text>
        <Text style={[styles.body, { writingDirection: textDir }]}>{strings.popupBody}</Text>
        <Pressable style={styles.button} onPress={onLearnMore}>
          <Text style={styles.buttonText}>{strings.learnMoreButton}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  card: { width: '100%', backgroundColor: colors.teaserBg, borderRadius: 24, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 28 },
  headline: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', lineHeight: 30 },
  body: { fontSize: 15, color: colors.soft, textAlign: 'center', marginTop: 14, lineHeight: 22 },
  button: { marginTop: 28, backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: colors.buttonText, fontSize: 16, fontWeight: '700' },
});

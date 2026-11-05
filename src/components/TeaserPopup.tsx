import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { FollowUpStrings } from '../types';
import { colors } from '../colors';

/** The teaser shown before the flow. Visitors can tap "Learn More" to enter
 * the flow, or dismiss via the close button or backdrop. */
export function TeaserPopup({
  strings,
  isRtl,
  onLearnMore,
  onClose,
}: {
  strings: FollowUpStrings;
  isRtl: boolean;
  onLearnMore: () => void;
  onClose?: () => void;
}) {
  const textDir = isRtl ? ('rtl' as const) : ('ltr' as const);
  return (
    <View style={styles.backdrop}>
      {onClose && <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />}
      <View style={styles.card}>
        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            hitSlop={12}
            style={[styles.closeButton, isRtl ? styles.closeLeft : styles.closeRight]}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        )}
        <Text style={[styles.headline, { writingDirection: textDir }]}>{strings.popupHeadline}</Text>
        <Text style={[styles.body, { writingDirection: textDir }]}>{strings.popupBody}</Text>
        <Pressable style={styles.button} onPress={onLearnMore}>
          <Text style={styles.buttonText}>{strings.learnMoreButton}</Text>
        </Pressable>
        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.notNowButton}
            onPress={onClose}
            style={({ pressed }) => [styles.notNowButton, pressed && styles.notNowPressed]}
          >
            <Text style={styles.notNowText}>{strings.notNowButton}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  card: { width: '100%', backgroundColor: colors.teaserBg, borderRadius: 24, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 20, position: 'relative' },
  closeButton: {
    position: 'absolute',
    top: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFCF5',
    borderWidth: 1,
    borderColor: 'rgba(111,94,71,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeRight: { right: 14 },
  closeLeft: { left: 14 },
  closeIcon: { fontSize: 14, color: colors.soft, fontWeight: '600', lineHeight: 16 },
  headline: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', lineHeight: 30 },
  body: { fontSize: 15, color: colors.soft, textAlign: 'center', marginTop: 14, lineHeight: 22 },
  button: { marginTop: 28, backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: colors.buttonText, fontSize: 16, fontWeight: '700' },
  notNowButton: { marginTop: 8, paddingVertical: 10, alignItems: 'center' },
  notNowPressed: { opacity: 0.6 },
  notNowText: { fontSize: 15, fontWeight: '600', color: colors.soft },
});

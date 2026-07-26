import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, I18nManager } from 'react-native';
import * as Linking from 'expo-linking';
import { colors } from '../colors';
import { SceneFrame } from './SceneFrame';
import { availableChannels, contactUri, type ContactChannel, type ContactConfig } from '../contactConfig';
import type { ContactStrings } from '../types';

const BRAND: Record<Exclude<ContactChannel, 'email'>, string> = {
  whatsapp: '#25D366',
  telegram: '#229ED9',
  messenger: '#0084FF',
};

const LABEL: Record<Exclude<ContactChannel, 'email'>, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  messenger: 'Messenger',
};

/** The last step of the flow: hand the visitor off to whichever messaging app
 * they already use. Mirrors the web page at
 * https://followup-web-simple.pages.dev and reads the same config. */
export function ContactScreen({
  config,
  strings,
  isRtl,
  onChannelOpened,
}: {
  config: ContactConfig;
  strings: ContactStrings;
  isRtl: boolean;
  /** Fired with the channel name when a visitor opens one. Analytics only. */
  onChannelOpened?: (channel: ContactChannel) => void;
}) {
  const chat = availableChannels(config).filter((c): c is Exclude<ContactChannel, 'email'> => c !== 'email');

  const open = async (channel: ContactChannel) => {
    const uri = contactUri(config, channel);
    if (!uri) return;
    onChannelOpened?.(channel);
    await Linking.openURL(uri);
  };

  const dir = { writingDirection: isRtl ? ('rtl' as const) : ('ltr' as const) };

  return (
    <SceneFrame sunOpacity={0.5}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, dir]}>{strings.title}</Text>
        <Text style={[styles.intro, dir]}>{strings.intro}</Text>

        {chat.map((channel) => (
          <Pressable
            key={channel}
            onPress={() => open(channel)}
            style={({ pressed }) => [styles.tile, isRtl && styles.tileRtl, pressed && styles.tilePressed]}
          >
            <View style={[styles.dot, { backgroundColor: BRAND[channel] }]} />
            <View style={styles.tileText}>
              {/* A brand name reads left-to-right even in an RTL layout. */}
              <Text style={[styles.tileLabel, isRtl && styles.textRight]}>{LABEL[channel]}</Text>
              <Text style={[styles.tileHint, isRtl && styles.textRight, dir]}>{hintFor(channel, strings)}</Text>
            </View>
            <Text style={styles.chevron}>{isRtl ? '‹' : '›'}</Text>
          </Pressable>
        ))}

        {config.email && (
          <Pressable onPress={() => open('email')} style={styles.emailWrap} hitSlop={8}>
            <Text style={[styles.email, dir]}>
              {strings.emailPrompt} {strings.emailAction}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SceneFrame>
  );
}

function hintFor(channel: Exclude<ContactChannel, 'email'>, s: ContactStrings): string {
  return channel === 'whatsapp' ? s.whatsappHint : channel === 'telegram' ? s.telegramHint : s.messengerHint;
}

const styles = StyleSheet.create({
  scroll: { alignSelf: 'stretch' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink, textAlign: 'center', lineHeight: 36 },
  intro: { marginTop: 14, fontSize: 16, color: colors.soft, textAlign: 'center', lineHeight: 25 },
  tile: {
    marginTop: 10,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(111,94,71,0.18)',
    backgroundColor: '#FFFCF5',
  },
  // I18nManager.isRTL already flips flex rows natively; this covers the case
  // where the app locale is LTR but the flow is showing Arabic copy.
  tileRtl: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse' },
  tilePressed: { opacity: 0.7 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  tileText: { flex: 1, marginHorizontal: 14 },
  tileLabel: { fontSize: 17, fontWeight: '600', color: colors.ink },
  tileHint: { marginTop: 2, fontSize: 13, color: colors.soft },
  textRight: { textAlign: 'right' },
  chevron: { fontSize: 26, color: colors.soft, lineHeight: 28 },
  emailWrap: { marginTop: 24, paddingVertical: 8 },
  email: { fontSize: 14, color: colors.soft, textAlign: 'center' },
});

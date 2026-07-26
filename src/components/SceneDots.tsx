import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../colors';

export function SceneDots({ count, current, isRtl = false }: { count: number; current: number; isRtl?: boolean }) {
  return (
    <View style={[styles.row, isRtl && styles.rowRtl]}>
      {Array.from({ length: count }).map((_, i) => {
        const active = i === current;
        return (
          <View
            key={i}
            style={[styles.dot, { width: active ? 22 : 8, backgroundColor: active ? colors.gold : 'rgba(111,94,71,0.28)' }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  rowRtl: { flexDirection: 'row-reverse' },
  dot: { height: 8, borderRadius: 999, marginHorizontal: 5 },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import Colors from '../constants/colors';
import { Radius, Spacing } from '../constants/layout';

export default function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="caption" style={styles.chipText}>
        {label.trim()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.light.secondarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipText: {
    color: Colors.light.primaryText,
  },
});

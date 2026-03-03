import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Radius, Spacing } from '../constants/layout';
import Colors from '../constants/colors';

export default function InfoRow({
  icon,
  children,
  onPress,
  accent,
}: {
  icon: string;
  children: React.ReactNode;
  onPress?: () => void;
  accent?: string;
}) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap onPress={onPress} activeOpacity={0.7} style={styles.infoRow}>
      <View
        style={[
          styles.iconBadge,
          accent ? { backgroundColor: accent + '20' } : {},
        ]}
      >
        <Ionicons name={icon} size={18} color={accent || '#5C4F42'} />
      </View>
      <View style={styles.infoRowContent}>{children}</View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.light.secondaryText}
        />
      )}
    </Wrap>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRowContent: {
    flex: 1,
    justifyContent: 'center',
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from './AppText';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Radius, Spacing } from '../constants/layout';
import Colors from '../constants/colors';

export default function PageHeader({
  title,
  subtitle,
  backArrow = true,
  rightComponent,
}: {
  title: string;
  subtitle?: string;
  backArrow?: boolean;
  rightComponent?: React.ReactNode;
}) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.header}>
      <View style={styles.headerLeftView}>
        {backArrow && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={Colors.light.primaryText}
            />
          </TouchableOpacity>
        )}

        <View>
          <AppText variant="title">{title}</AppText>
          {subtitle && (
            <AppText
              variant="caption"
              style={styles.subtitle}
              color={Colors.light.secondaryText}
            >
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
      {rightComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  headerLeftView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.secondarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  subtitle: {
    marginTop: Spacing.xs - 1,
  },
});

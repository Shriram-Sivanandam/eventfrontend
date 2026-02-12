import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/colors';
import { Spacing, Radius } from '../constants/layout';
import AppText from './AppText';

type Props = {
  title: string;
  loading?: boolean;
  onPress: () => void;
};

const AppButton = ({ title, loading, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.button}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <AppText variant="subtitle" color="#fff">
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});

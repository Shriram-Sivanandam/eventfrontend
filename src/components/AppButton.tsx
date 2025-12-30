import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { Spacing, Radius } from '../constants/layout';
import AppText from './AppText';

type Props = {
  title: string;
  onPress: () => void;
};

const AppButton = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.button}
    >
      <AppText variant="subtitle" color="#fff">
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
});

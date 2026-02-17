import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ButtonProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Colors from '../constants/colors';
import { Spacing, Radius } from '../constants/layout';
import AppText from './AppText';

type Props = ButtonProps & {
  title: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

const AppButton = ({ title, loading, style, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, style]}
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

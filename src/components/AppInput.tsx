import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';
import Colors from '../constants/colors';
import { Spacing, Radius } from '../constants/layout';
import { Typography } from '../constants/typography';

interface AppInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

const AppInput = ({ style, ...props }: AppInputProps) => {
  return (
    <TextInput
      {...props}
      placeholderTextColor={Colors.light.secondaryText}
      style={[styles.input, style]}
    />
  );
};

export default AppInput;

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.light.primaryText,
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Colors from '../constants/colors';
import { Spacing } from '../constants/layout';

const Screen = ({ style, ...props }: ViewProps) => {
  return (
    <KeyboardAvoidingView
      style={styles.keyboardCont}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View {...props} style={[styles.container, style]} />
    </KeyboardAvoidingView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  keyboardCont: {
    flex: 1,
  },
  container: {
    flex: 1,
    //backgroundColor: Colors.light.background,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
});

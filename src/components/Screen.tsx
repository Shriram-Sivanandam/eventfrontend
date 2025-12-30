import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import Colors from '../constants/colors';
import { Spacing } from '../constants/layout';

const Screen = ({ style, ...props }: ViewProps) => {
  return <View {...props} style={[styles.container, style]} />;
};

export default Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
  },
});

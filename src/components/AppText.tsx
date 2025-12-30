import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { Typography } from '../constants/typography';

type Props = TextProps & {
  variant?: keyof typeof Typography;
  color?: string;
};

const AppText = ({ variant = 'body', color, style, ...props }: Props) => {
  return (
    <Text
      {...props}
      style={[
        styles.text,
        Typography[variant],
        { color: color ?? Colors.light.primaryText },
        style,
      ]}
    />
  );
};

export default AppText;

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
});

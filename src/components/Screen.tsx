import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Colors from '../constants/colors';
import { Spacing } from '../constants/layout';
import { useBehavior } from '../hooks/useBehaviour';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Screen = ({ style, ...props }: ViewProps) => {
  const insets = useSafeAreaInsets();
  const behaviour = useBehavior();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardOpen(false),
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView style={styles.keyboardCont} behavior={behaviour}>
      <View
        {...props}
        style={[
          styles.container,
          {
            paddingTop: keyboardOpen ? 0 : insets.top,
            paddingBottom: keyboardOpen ? 0 : insets.bottom,
          },
          style,
        ]}
      />
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
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
  },
});

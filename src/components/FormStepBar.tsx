import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from './AppText';
import { Radius, Spacing } from '../constants/layout';
import Colors from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STEP_LABELS = ['Basics', 'Location', 'Details'];

export default function StepProgressBar({
  step,
  onStepPress,
}: {
  step: number;
  onStepPress: (i: number) => void;
}) {
  return (
    <View style={styles.wrapper}>
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < step;
        const isActive = i === step;

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <View style={styles.lineContainer}>
                <View style={[styles.line, isActive && styles.lineActive]} />
              </View>
            )}

            <TouchableOpacity
              onPress={() => isCompleted && onStepPress(i)}
              activeOpacity={isCompleted ? 0.7 : 1}
              style={styles.stepTouch}
            >
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              >
                {isCompleted ? (
                  <Ionicons
                    name="checkmark-sharp"
                    size={18}
                    color={Colors.light.surface}
                  />
                ) : (
                  <AppText
                    variant="caption"
                    fontWeight="bold"
                    style={[styles.stepNum, isActive && styles.stepNumActive]}
                  >
                    {i + 1}
                  </AppText>
                )}
              </View>
              <AppText
                variant="caption"
                fontWeight="bold"
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isCompleted && styles.labelCompleted,
                ]}
              >
                {label}
              </AppText>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  stepTouch: {
    alignItems: 'center',
    width: 64,
  },
  lineContainer: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  line: {
    height: 2,
    backgroundColor: Colors.light.border,
  },
  lineActive: {
    backgroundColor: Colors.light.primary,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  circleActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  circleCompleted: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  checkmark: {
    color: '#fff',
  },
  stepNum: {
    color: Colors.light.secondaryText,
  },
  stepNumActive: {
    color: '#fff',
  },
  label: {
    color: Colors.light.secondaryText,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: Colors.light.primary,
  },
  labelCompleted: {
    color: Colors.light.primary,
  },
});

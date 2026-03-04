import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppText from './AppText';
import { Spacing } from '../constants/layout';

export default function FAQRow({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.7}
      >
        <AppText style={styles.question}>{question}</AppText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#C4BAB0"
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.answerWrap}>
          <AppText variant="caption">{answer}</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  question: {
    flex: 1,
    fontSize: 14,
  },
  answerWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

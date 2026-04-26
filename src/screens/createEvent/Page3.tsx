import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import { Spacing } from '../../constants/layout';
import Colors from '../../constants/colors';
import { FormState, ErrorState } from '../../constants/types';
import TagPicker from '../../components/TagPicker';

export default function Page3({
  form,
  errors,
  onFormChange,
  onOpenDatePicker,
  onOpenTimePicker,
  selectedTagIds,
  onTagsChange,
}: {
  form: FormState;
  errors: ErrorState;
  onFormChange: (key: keyof FormState) => (val: string) => void;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  selectedTagIds: string[];
  onTagsChange: (ids: string[]) => void;
}) {
  return (
    <View>
      <AppText variant="title">When is it happening?</AppText>
      <AppText variant="caption" style={styles.pageSubheading}>
        Set timing, capacity, and what to expect.
      </AppText>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Date & Time
        </AppText>
        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={onOpenDatePicker}
            style={styles.dateBtn}
            activeOpacity={0.8}
          >
            <AppInput
              placeholder="Select date"
              value={form.date.toLocaleDateString('en-GB')}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenTimePicker}
            style={styles.dateBtn}
            activeOpacity={0.8}
          >
            <AppInput
              placeholder="Select time"
              value={form.date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Duration (minutes)
        </AppText>
        <AppInput
          placeholder="e.g. 120"
          value={form.duration_minutes}
          onChangeText={onFormChange('duration_minutes')}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.rowFields}>
        <View style={styles.halfField}>
          <AppText variant="caption" style={styles.inputLabel}>
            Price (₹) *
          </AppText>
          <AppInput
            placeholder="0 = Free"
            value={form.price}
            onChangeText={onFormChange('price')}
            keyboardType="numeric"
          />
          {errors.price ? (
            <AppText
              variant="caption"
              color={Colors.light.danger}
              style={styles.errorText}
            >
              {errors.price}
            </AppText>
          ) : null}
        </View>
        <View style={styles.halfField}>
          <AppText variant="caption" style={styles.inputLabel}>
            Capacity *
          </AppText>
          <AppInput
            placeholder="e.g. 20"
            value={form.capacity}
            onChangeText={onFormChange('capacity')}
            keyboardType="numeric"
          />
          {errors.capacity ? (
            <AppText
              variant="caption"
              color={Colors.light.danger}
              style={styles.errorText}
            >
              {errors.capacity}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Things to Bring
        </AppText>
        <AppInput
          placeholder="e.g. Water bottle, cash, your own racquet"
          value={form.things_to_bring}
          onChangeText={onFormChange('things_to_bring')}
          multiline
        />
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Things Provided
        </AppText>
        <AppInput
          placeholder="e.g. Snacks, extra racquets, Wi-Fi"
          value={form.things_provided}
          onChangeText={onFormChange('things_provided')}
          multiline
        />
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Event Tags <AppText style={styles.tagOptional}>(up to 3)</AppText>
        </AppText>
        <TagPicker selectedTagIds={selectedTagIds} onChange={onTagsChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageSubheading: {
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  fieldWrap: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    color: Colors.light.primaryText,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateBtn: {
    flex: 1,
  },
  tagOptional: {
    fontWeight: '400',
    color: Colors.light.secondaryText,
  },
});

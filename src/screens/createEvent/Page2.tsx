import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import Colors from '../../constants/colors';
import { FormState, ErrorState } from '../../constants/types';
import { Spacing } from '../../constants/layout';

export default function Page2({
  form,
  errors,
  onFormChange,
}: {
  form: FormState;
  errors: ErrorState;
  onFormChange: (key: keyof FormState) => (val: string) => void;
}) {
  return (
    <View>
      <AppText variant="title">Where is it happening?</AppText>
      <AppText variant="caption" style={styles.pageSubheading}>
        Help attendees find your venue easily.
      </AppText>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Venue / Landmark *
        </AppText>
        <AppInput
          placeholder="e.g. Lodha Society Gymnasium"
          value={form.location}
          onChangeText={onFormChange('location')}
        />
        {errors.location ? (
          <AppText
            variant="caption"
            color={Colors.light.danger}
            style={styles.errorText}
          >
            {errors.location}
          </AppText>
        ) : null}
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Street
        </AppText>
        <AppInput
          placeholder="e.g. Lodha Society, Majiwada"
          value={form.address_line_one}
          onChangeText={onFormChange('address_line_one')}
        />
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          City *
        </AppText>
        <AppInput
          placeholder="e.g. Mumbai"
          value={form.city}
          onChangeText={onFormChange('city')}
        />
        {errors.city ? (
          <AppText
            variant="caption"
            color={Colors.light.danger}
            style={styles.errorText}
          >
            {errors.city}
          </AppText>
        ) : null}
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Pincode
        </AppText>
        <AppInput
          placeholder="e.g. 400001"
          value={form.pincode}
          onChangeText={onFormChange('pincode')}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Google Maps Link
        </AppText>
        <AppInput
          placeholder="https://maps.google.com/..."
          value={form.maps_link}
          onChangeText={onFormChange('maps_link')}
        />
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
});

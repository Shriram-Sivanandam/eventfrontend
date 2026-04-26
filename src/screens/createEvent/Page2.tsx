import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import Colors from '../../constants/colors';
import { FormState, ErrorState } from '../../constants/types';
import { Radius, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CitySheet from '../../components/CitySheet';

function isValidMapsLink(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url) as any;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'maps.google.com' ||
      (host === 'www.google.com' && parsed.pathname.startsWith('/maps')) ||
      host === 'goo.gl' ||
      host === 'maps.app.goo.gl'
    );
  } catch {
    return false;
  }
}

export default function Page2({
  form,
  errors,
  onFormChange,
}: {
  form: FormState;
  errors: ErrorState;
  onFormChange: (key: keyof FormState) => (val: string) => void;
}) {
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [mapsError, setMapsError] = useState('');

  const handleMapsChange = (val: string) => {
    onFormChange('maps_link')(val);
    if (val && !isValidMapsLink(val)) {
      setMapsError('Please enter a valid Google Maps link.');
    } else {
      setMapsError('');
    }
  };

  const handleCitySelect = (city: string | null) => {
    onFormChange('city')(city ?? '');
  };

  const hasCity = !!form.city;

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
        <TouchableOpacity
          style={[styles.cityTrigger, hasCity && styles.cityTriggerFilled]}
          onPress={() => setCitySheetOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={hasCity ? 'location' : 'location-outline'}
            size={16}
            color={hasCity ? Colors.light.primary : Colors.light.secondaryText}
          />
          <AppText
            style={[
              styles.cityTriggerText,
              !hasCity && styles.cityTriggerPlaceholder,
            ]}
          >
            {hasCity ? form.city : 'Select your city'}
          </AppText>
          <Ionicons
            name="chevron-down"
            size={14}
            color={Colors.light.secondaryText}
          />
        </TouchableOpacity>
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
          Pincode *
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
          onChangeText={handleMapsChange}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {mapsError ? (
          <View style={styles.mapsErrorWrap}>
            <Ionicons
              name="alert-circle-outline"
              size={13}
              color={Colors.light.danger}
            />
            <AppText
              variant="caption"
              color={Colors.light.danger}
              style={styles.errorText}
            >
              {mapsError}
            </AppText>
          </View>
        ) : form.maps_link && !mapsError ? (
          <View style={styles.mapsValidWrap}>
            <Ionicons
              name="checkmark-circle-outline"
              size={13}
              color={Colors.light.success}
            />
            <AppText variant="caption" style={styles.mapsValidText}>
              Valid Maps link
            </AppText>
          </View>
        ) : (
          <AppText variant="caption" style={styles.mapsHint}>
            Paste a link from Google Maps → Share → Copy link
          </AppText>
        )}
      </View>

      <CitySheet
        visible={citySheetOpen}
        selectedCity={form.city || null}
        onSelect={handleCitySelect}
        onClose={() => setCitySheetOpen(false)}
      />
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
  cityTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  cityTriggerFilled: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  cityTriggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primaryText,
  },
  cityTriggerPlaceholder: {
    color: Colors.light.secondaryText,
  },
  mapsErrorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  mapsValidWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  mapsValidText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '600',
  },
  mapsHint: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
  },
});

import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import Colors from '../../constants/colors';
import { FormState, ErrorState } from '../../constants/types';
import { Radius, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Page1({
  form,
  errors,
  image,
  onFormChange,
  onPickImage,
}: {
  form: FormState;
  errors: ErrorState;
  image: any;
  onFormChange: (key: keyof FormState) => (val: string) => void;
  onPickImage: () => void;
}) {
  return (
    <View>
      <AppText variant="title">Tell us about your event</AppText>
      <AppText variant="caption" style={styles.pageSubheading}>
        A great title and description help people decide to join.
      </AppText>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Title *
        </AppText>
        <AppInput
          placeholder="e.g. F1 Watch Party at Mine"
          value={form.title}
          onChangeText={onFormChange('title')}
        />
        {errors.title ? (
          <AppText
            variant="caption"
            color={Colors.light.danger}
            style={styles.errorText}
          >
            {errors.title}
          </AppText>
        ) : null}
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Description
        </AppText>
        <AppInput
          placeholder="What's this event about? What can attendees expect?"
          value={form.description}
          onChangeText={onFormChange('description')}
          multiline
        />
      </View>

      <View style={styles.fieldWrap}>
        <AppText variant="caption" style={styles.inputLabel}>
          Cover Image
        </AppText>
        <TouchableOpacity
          onPress={onPickImage}
          style={styles.imagePicker}
          activeOpacity={0.8}
        >
          {image ? (
            <Image
              source={{ uri: image.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={35}
                color={Colors.light.primaryText}
              />
              <AppText variant="body" style={styles.imagePlaceholderText}>
                Tap to add a cover photo
              </AppText>
            </View>
          )}
        </TouchableOpacity>
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
  imagePicker: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    height: 180,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondarySurface,
    gap: 8,
  },
  imagePlaceholderText: {
    color: Colors.light.secondaryText,
  },
});

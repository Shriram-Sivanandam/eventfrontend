import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { Spacing } from '../../constants/layout';
import Colors from '../../constants/colors';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { FormState, ErrorState } from '../../constants/types';
import Page1 from '../createEvent/Page1';
import Page2 from '../createEvent/Page2';
import Page3 from '../createEvent/Page3';
import FormStepBar from '../../components/FormStepBar';
import PageHeader from '../../components/PageHeader';
import SuccessOverlay from '../../components/SuccessOverlay';

const TOTAL_STEPS = 3;

export default function CreateEventScreen() {
  const navigation = useNavigation<any>();
  const [image, setImage] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    location: '',
    address_line_one: '',
    city: '',
    pincode: '',
    maps_link: '',
    date: new Date(),
    duration_minutes: '',
    price: '',
    capacity: '',
    things_to_bring: '',
    things_provided: '',
  });

  const [errors, setErrors] = useState<ErrorState>({});

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets?.length) {
      setImage(result.assets[0]);
    }
  };

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

  const validateStep = (s: number): boolean => {
    const e: ErrorState = {};
    if (s === 0) if (!form.title.trim()) e.title = 'Event title is required';
    if (s === 1) {
      if (!form.location.trim())
        e.location = 'Enter a location name or landmark';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.pincode.trim()) e.pincode = 'Pincode is required';
      if (form.maps_link.trim() && !isValidMapsLink(form.maps_link))
        e.maps_link = 'Please enter a valid Google Maps link.';
    }
    if (s === 2) {
      if (!form.price.trim()) e.price = 'Enter a price (0 for free)';
      if (!form.capacity.trim()) e.capacity = 'Enter max capacity';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const animateTransition = (direction: 'forward' | 'back') => {
    slideAnimation.setValue(direction === 'forward' ? 40 : -40);
    Animated.spring(slideAnimation, {
      toValue: 0,
      useNativeDriver: true,
      speed: 3,
      bounciness: 3,
    }).start();
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    animateTransition('forward');
    setErrors({});
    setStep(s => s + 1);
  };

  const goToStep = (i: number) => {
    if (i >= step) return;
    if (i < 0) {
      return setTimeout(() => {
        navigation.goBack();
      }, 200);
    }
    animateTransition('back');
    setErrors({});
    setStep(i);
  };

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: form.date || new Date(),
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setForm(prev => ({
            ...prev,
            date: selectedDate,
          }));
        }
      },
    });
  };

  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      value: form.date || new Date(),
      mode: 'time',
      is24Hour: true,
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setForm(prev => ({
            ...prev,
            date: selectedDate,
          }));
        }
      },
    });
  };

  const handleFormChange = (key: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const createEvent = async () => {
    if (!validateStep(step)) return;

    const data = new FormData();

    data.append('title', form.title);
    data.append('description', form.description);
    data.append('location', form.location);
    data.append('address_line_one', form.address_line_one);
    data.append('city', form.city);
    data.append('pincode', form.pincode);
    data.append('maps_link', form.maps_link);
    data.append('event_start', form.date.toISOString());
    data.append('duration_minutes', form.duration_minutes);
    data.append('price', form.price);
    data.append('capacity', form.capacity);
    data.append('things_to_bring', form.things_to_bring);
    data.append('things_provided', form.things_provided);
    selectedTagIds.forEach(id => data.append('tag_ids', id));

    if (image) {
      data.append('image', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'photo.jpg',
      });
    }

    try {
      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowSuccess(true);
    } catch (err: any) {
      console.log('SERVER ERROR:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <PageHeader title="Create Event" />

        <FormStepBar step={step} onStepPress={goToStep} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{ transform: [{ translateX: slideAnimation }] }}
          >
            {step === 0 && (
              <Page1
                form={form}
                errors={errors}
                image={image}
                onFormChange={handleFormChange}
                onPickImage={pickImage}
              />
            )}
            {step === 1 && (
              <Page2
                form={form}
                errors={errors}
                onFormChange={handleFormChange}
              />
            )}
            {step === 2 && (
              <Page3
                form={form}
                errors={errors}
                onFormChange={handleFormChange}
                onOpenDatePicker={openDatePicker}
                onOpenTimePicker={openTimePicker}
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
              />
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title={step < TOTAL_STEPS - 1 ? 'Continue' : 'Create Event'}
            onPress={step < TOTAL_STEPS - 1 ? goNext : createEvent}
            style={styles.footerBtn}
          />
          <AppText variant="caption" style={styles.stepHint}>
            Step {step + 1} of {TOTAL_STEPS}
          </AppText>
        </View>
        <SuccessOverlay
          visible={showSuccess}
          emoji="🎟️"
          title="Event Created"
          subtitle={`Your event "${form.title}" has been successfully created.`}
          onDone={() => {
            setShowSuccess(false);
            navigation.goBack();
          }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  inputLabel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  createBtn: {
    marginVertical: Spacing.md,
  },
  dateTimeCont: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dateTimeInputs: {
    flex: 1,
  },
  footer: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerBtn: {
    marginBottom: Spacing.sm,
  },
  stepHint: {
    textAlign: 'center',
    color: Colors.light.secondaryText,
  },
});

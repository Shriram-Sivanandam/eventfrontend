import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors.js';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader.tsx';
import CitySheet from '../../components/CitySheet.tsx';
import { GENDER_OPTIONS } from '../../constants/values';
import { useToast } from '../../context/ToastContext.tsx';

const STEPS = [
  { id: 'welcome', title: null },
  { id: 'name', title: "What's your name?" },
  { id: 'dob', title: 'When were you born?' },
  { id: 'city', title: 'Where are you based?' },
  { id: 'gender', title: 'How do you identify?' },
  { id: 'photo', title: 'Add a profile photo' },
  { id: 'phone', title: 'Your phone number' },
];

const TOTAL = STEPS.length;

function ProgressDots({ step }: { step: number }) {
  return (
    <View style={pd.row}>
      {STEPS.map((_, i) => (
        <View
          key={i}
          style={[pd.dot, i === step && pd.dotActive, i < step && pd.dotDone]}
        />
      ))}
    </View>
  );
}
const pd = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.light.primary,
  },
  dotDone: {
    backgroundColor: Colors.light.primary + '80',
  },
});

export default function OnboardingScreen() {
  const { setOnboardingComplete } = useAuth() as any;
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [citySheet, setCitySheet] = useState(false);

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const animateStep = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 4,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    animateStep();
  }, [animateStep, step]);

  const goNext = () => {
    if (step < TOTAL - 1) setStep(s => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const canContinue = () => {
    const id = STEPS[step].id;
    if (id === 'name') return name.trim().length >= 2;
    if (id === 'dob') return isValidDob(dob);
    if (id === 'city') return !!city;
    if (id === 'gender') return !!gender;
    return true;
  };

  const handleDobChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 3)
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length >= 5)
      formatted =
        digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    setDob(formatted);
  };

  const isValidDob = (val: string): boolean => {
    const parts = val.split('/');
    if (parts.length !== 3) return false;
    const [d, m, y] = parts.map(Number);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    if (d < 1 || d > 31 || m < 1 || m > 12) return false;
    const year = y;
    const now = new Date().getFullYear();
    return year >= 1900 && year <= now - 13;
  };

  const dobToISO = (val: string): string => {
    const [d, m, y] = val.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  const handleCitySelect = (cityVal: string | null) => {
    setCity(cityVal ?? '');
  };

  const pickAvatar = () => {
    Alert.alert('Profile Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera(
            { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
            r => {
              if (r.assets?.length) setAvatar(r.assets[0]);
            },
          ),
      },
      {
        text: 'Photo Library',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, r => {
            if (r.assets?.length) setAvatar(r.assets[0]);
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', name.trim());
      data.append('onboarding', 'true');
      if (dob) data.append('date_of_birth', dobToISO(dob));
      if (city) data.append('city', city);
      if (gender) data.append('gender', gender);
      if (phone) data.append('phone', phone);
      if (avatar) {
        data.append('avatar', {
          uri: avatar.uri,
          type: avatar.type || 'image/jpeg',
          name: avatar.fileName || 'avatar.jpg',
        } as any);
      }
      await api.patch('/auth/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOnboardingComplete(true);
    } catch {
      showToast({
        type: 'error',
        message: 'Something went wrong while onboarding',
      });
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === TOTAL - 1;
  const currentStep = STEPS[step];

  const renderContent = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <View style={styles.welcomeWrap}>
            <AppText style={styles.welcomeEmoji}>👋</AppText>
            <AppText style={styles.welcomeTitle}>Welcome!</AppText>
            <AppText style={styles.welcomeSub}>
              Let's set up your profile so hosts and attendees know who you are.
            </AppText>
            <AppText style={styles.welcomeNote}>
              Takes about 30 seconds.
            </AppText>
          </View>
        );

      case 'name':
        return (
          <View style={styles.fieldWrap}>
            <TextInput
              style={styles.bigInput}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={Colors.light.secondaryText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => canContinue() && goNext()}
            />
            <AppText style={styles.fieldHint}>
              This is how you'll appear to hosts and attendees.
            </AppText>
          </View>
        );

      case 'dob':
        return (
          <View style={styles.fieldWrap}>
            <TextInput
              style={styles.bigInput}
              value={dob}
              onChangeText={handleDobChange}
              placeholder="DD / MM / YYYY"
              placeholderTextColor={Colors.light.secondaryText}
              keyboardType="numeric"
              maxLength={10}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => canContinue() && goNext()}
            />
            {dob.length > 0 && !isValidDob(dob) && (
              <AppText style={styles.fieldError}>
                Enter a valid date. You must be at least 13.
              </AppText>
            )}
            <AppText style={styles.fieldHint}>
              Your age may be shown on your public profile.
            </AppText>
          </View>
        );

      case 'city':
        return (
          <View style={styles.fieldWrap}>
            <TouchableOpacity
              style={[styles.selectTrigger, city && styles.selectTriggerFilled]}
              onPress={() => setCitySheet(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={city ? 'location' : 'location-outline'}
                size={18}
                color={city ? Colors.light.primary : Colors.light.secondaryText}
              />
              <AppText
                style={[
                  styles.selectTriggerText,
                  !city && styles.selectTriggerPlaceholder,
                ]}
              >
                {city || 'Tap to select your city'}
              </AppText>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.light.secondaryText}
              />
            </TouchableOpacity>
            <AppText style={styles.fieldHint}>
              Helps people find local events.
            </AppText>
            <CitySheet
              visible={citySheet}
              selectedCity={city || null}
              onSelect={handleCitySelect}
              onClose={() => setCitySheet(false)}
            />
          </View>
        );

      case 'gender':
        return (
          <View style={styles.genderOptions}>
            {GENDER_OPTIONS.map(opt => {
              const sel = gender === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.genderOption, sel && styles.genderOptionSel]}
                  onPress={() => setGender(opt.value)}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.genderEmoji}>{opt.icon}</AppText>
                  <AppText
                    style={[styles.genderLabel, sel && styles.genderLabelSel]}
                  >
                    {opt.label}
                  </AppText>
                  {sel && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.light.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'photo':
        return (
          <View style={styles.photoWrap}>
            <TouchableOpacity
              style={avatar ? styles.avatarPickerFilled : styles.avatarPicker}
              onPress={pickAvatar}
              activeOpacity={0.85}
            >
              {avatar ? (
                <Image
                  source={{ uri: avatar.uri }}
                  style={styles.avatarPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarEmpty}>
                  <Ionicons
                    name="camera-outline"
                    size={36}
                    color={Colors.light.secondaryText}
                  />
                  <AppText style={styles.avatarEmptyText}>
                    Tap to add photo
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
            {avatar && (
              <TouchableOpacity
                onPress={() => setAvatar(null)}
                style={styles.removePhoto}
                activeOpacity={0.7}
              >
                <AppText style={styles.removePhotoText}>Remove</AppText>
              </TouchableOpacity>
            )}
            <AppText style={styles.fieldHint}>
              Optional — you can add one later from your profile.
            </AppText>
          </View>
        );

      case 'phone':
        return (
          <View style={styles.fieldWrap}>
            <TextInput
              style={styles.bigInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={Colors.light.secondaryText}
              keyboardType="phone-pad"
              autoFocus
            />
            <AppText style={styles.fieldHint}>
              Optional. Only shared with hosts when relevant.
            </AppText>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Screen>
      <PageHeader
        title="Onboarding"
        onPressBack={goBack}
        rightComponent={
          <View>
            {(currentStep.id === 'photo' || currentStep.id === 'phone') && (
              <TouchableOpacity
                onPress={isLastStep ? submit : goNext}
                activeOpacity={0.7}
              >
                <AppText style={styles.skipText}>Skip</AppText>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProgressDots step={step} />

        <Animated.View
          style={[
            styles.contentWrap,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {currentStep.title && (
            <AppText style={styles.stepTitle}>{currentStep.title}</AppText>
          )}
          {renderContent()}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            !canContinue() &&
              !['photo', 'phone'].includes(currentStep.id) &&
              styles.ctaBtnDisabled,
          ]}
          onPress={isLastStep ? submit : goNext}
          activeOpacity={0.88}
          disabled={
            saving ||
            (!canContinue() && !['photo', 'phone'].includes(currentStep.id))
          }
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <AppText style={styles.ctaBtnText}>
              {currentStep.id === 'welcome'
                ? "Let's go →"
                : isLastStep
                ? 'All done →'
                : 'Continue →'}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  skipText: { fontSize: 14, fontWeight: '600', color: '#8A7B6B' },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
    flexGrow: 1,
  },

  contentWrap: { flex: 1 },

  stepTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.light.primaryText,
    lineHeight: 36,
    marginBottom: 28,
  },

  welcomeWrap: { alignItems: 'center', paddingTop: Spacing.xl },
  welcomeEmoji: { fontSize: 72, marginBottom: Spacing.xl },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.light.primaryText,
    marginBottom: Spacing.md,
  },
  welcomeSub: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  welcomeNote: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '500',
    textAlign: 'center',
  },

  fieldWrap: {},
  bigInput: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primaryText,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fieldHint: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '400',
  },
  fieldError: {
    fontSize: 12,
    color: Colors.light.danger,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.tertiarySurface,
    marginBottom: Spacing.md,
  },
  selectTriggerFilled: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  selectTriggerText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.primaryText,
  },
  selectTriggerPlaceholder: {
    color: Colors.light.secondaryText,
    fontWeight: '400',
  },

  genderOptions: { gap: Spacing.sm },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  genderOptionSel: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  genderEmoji: { fontSize: 22 },
  genderLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primaryText,
  },
  genderLabelSel: { color: Colors.light.primary, fontWeight: '700' },

  photoWrap: { alignItems: 'center' },
  avatarPickerFilled: {
    width: 140,
    height: 140,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 4,
    borderColor: Colors.light.primary,
    borderStyle: 'solid',
  },
  avatarPicker: {
    width: 140,
    height: 140,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  avatarEmpty: {
    flex: 1,
    backgroundColor: Colors.light.tertiarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  avatarEmptyText: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
  removePhoto: { marginBottom: Spacing.md },
  removePhotoText: {
    fontSize: 13,
    color: Colors.light.danger,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  ctaBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.card,
  },
  ctaBtnDisabled: {
    backgroundColor: Colors.light.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnText: {
    color: Colors.light.tertiaryText,
    fontSize: 16,
    fontWeight: '800',
  },
});

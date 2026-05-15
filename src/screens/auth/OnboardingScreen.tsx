import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import { Radius, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { INDIAN_CITIES } from '../../data/IndianCities.ts';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors.js';
import Screen from '../../components/Screen';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: '♂️' },
  { value: 'female', label: 'Female', icon: '♀️' },
  { value: 'non_binary', label: 'Non-binary', icon: '⚧️' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
];

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

function CitySheet({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [visible]);

  const filtered = query.trim()
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : INDIAN_CITIES;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={css.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={css.sheet}>
        <View style={css.handle} />
        <AppText style={css.title}>Select City</AppText>
        <View style={css.searchWrap}>
          <Ionicons name="search-outline" size={16} color="#8A7B6B" />
          <TextInput
            ref={inputRef}
            style={css.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search cities..."
            placeholderTextColor="#C4BAB0"
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={i => i}
          style={{ flexShrink: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sel = item === selected;
            return (
              <TouchableOpacity
                style={[css.cityRow, sel && css.cityRowSel]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={sel ? 'location' : 'location-outline'}
                  size={15}
                  color={sel ? '#FF6B35' : '#8A7B6B'}
                />
                <AppText style={[css.cityName, sel && css.cityNameSel]}>
                  {item}
                </AppText>
                {sel && (
                  <Ionicons name="checkmark-circle" size={17} color="#FF6B35" />
                )}
              </TouchableOpacity>
            );
          }}
        />
        <View style={{ height: 24 }} />
      </View>
    </Modal>
  );
}

const css = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,10,0,0.4)' },
  sheet: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EDE8DF',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A0A00',
    marginBottom: 14,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A0A00', padding: 0 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },
  cityRowSel: {
    backgroundColor: '#FF6B3508',
    borderRadius: 10,
    borderBottomColor: 'transparent',
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  cityName: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1A0A00' },
  cityNameSel: { fontWeight: '700', color: '#FF6B35' },
});

export default function OnboardingScreen() {
  const { setOnboardingComplete } = useAuth() as any;

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
      await api.post('/auth/onboarding', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOnboardingComplete(true);
    } catch (err: any) {
      console.log('ONBOARDING ERROR', err.response?.data);
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
              placeholderTextColor="#C4BAB0"
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
              placeholderTextColor="#C4BAB0"
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
                color={city ? '#FF6B35' : '#8A7B6B'}
              />
              <AppText
                style={[
                  styles.selectTriggerText,
                  !city && styles.selectTriggerPlaceholder,
                ]}
              >
                {city || 'Tap to select your city'}
              </AppText>
              <Ionicons name="chevron-down" size={16} color="#C4BAB0" />
            </TouchableOpacity>
            <AppText style={styles.fieldHint}>
              Helps people find local events.
            </AppText>
            <CitySheet
              visible={citySheet}
              selected={city}
              onSelect={setCity}
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
                      color="#FF6B35"
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
              style={styles.avatarPicker}
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
                  <Ionicons name="camera-outline" size={36} color="#C4BAB0" />
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
              placeholderTextColor="#C4BAB0"
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Screen>
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={goBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#1A0A00" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          {(currentStep.id === 'photo' || currentStep.id === 'phone') && (
            <TouchableOpacity
              onPress={isLastStep ? submit : goNext}
              activeOpacity={0.7}
            >
              <AppText style={styles.skipText}>Skip</AppText>
            </TouchableOpacity>
          )}
        </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    color: '#1A0A00',
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 28,
  },

  welcomeWrap: { alignItems: 'center', paddingTop: 20 },
  welcomeEmoji: { fontSize: 72, marginBottom: 20 },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A0A00',
    letterSpacing: -1,
    marginBottom: 12,
  },
  welcomeSub: {
    fontSize: 16,
    color: '#5C4F42',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  welcomeNote: {
    fontSize: 13,
    color: '#C4BAB0',
    fontWeight: '500',
    textAlign: 'center',
  },

  fieldWrap: {},
  bigInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A0A00',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  fieldHint: {
    fontSize: 13,
    color: '#C4BAB0',
    fontWeight: '400',
    lineHeight: 18,
  },
  fieldError: {
    fontSize: 12,
    color: '#E63946',
    fontWeight: '600',
    marginBottom: 8,
  },

  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFDF8',
    marginBottom: 12,
  },
  selectTriggerFilled: { borderColor: '#FF6B35', backgroundColor: '#FF6B3508' },
  selectTriggerText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A0A00',
  },
  selectTriggerPlaceholder: { color: '#C4BAB0', fontWeight: '400' },

  genderOptions: { gap: 10 },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  genderOptionSel: { borderColor: '#FF6B35', backgroundColor: '#FF6B3508' },
  genderEmoji: { fontSize: 22 },
  genderLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A0A00' },
  genderLabelSel: { color: '#FF6B35', fontWeight: '700' },

  photoWrap: { alignItems: 'center' },
  avatarPicker: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#EDE8DF',
    borderStyle: 'dashed',
  },
  avatarPreview: { width: '100%', height: '100%' },
  avatarEmpty: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  avatarEmptyText: { fontSize: 12, color: '#C4BAB0', fontWeight: '500' },
  removePhoto: { marginBottom: 12 },
  removePhotoText: { fontSize: 13, color: '#E63946', fontWeight: '600' },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    paddingTop: Spacing.sm,
  },
  ctaBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaBtnDisabled: {
    backgroundColor: '#EDE8DF',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AppText from '../../components/AppText';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import Colors from '../../constants/colors';
import Screen from '../../components/Screen';
import { Radius, Shadows, Spacing } from '../../constants/layout';

const DECORATIONS = [
  {
    emoji: '🎾',
    top: '8%',
    left: '6%',
    rotate: '-15deg',
    size: 28,
    opacity: 0.18,
  },
  {
    emoji: '🍜',
    top: '14%',
    right: '8%',
    rotate: '12deg',
    size: 24,
    opacity: 0.15,
  },
  {
    emoji: '🎵',
    top: '28%',
    left: '4%',
    rotate: '8deg',
    size: 20,
    opacity: 0.12,
  },
  {
    emoji: '🏋️',
    top: '22%',
    right: '5%',
    rotate: '-8deg',
    size: 22,
    opacity: 0.13,
  },
  {
    emoji: '🎮',
    top: '38%',
    left: '8%',
    rotate: '18deg',
    size: 18,
    opacity: 0.1,
  },
  {
    emoji: '🥂',
    top: '5%',
    left: '44%',
    rotate: '-5deg',
    size: 22,
    opacity: 0.14,
  },
];

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  const inputBorderAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 4,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
        delay: 100,
      }),
    ]).start();
  }, [cardScale, fadeAnim, slideAnim]);

  const handleFocus = () => {
    containerRef.current?.setNativeProps({
      style: { borderColor: Colors.light.primary },
    });
    Animated.timing(inputBorderAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    containerRef.current?.setNativeProps({
      style: { borderColor: Colors.light.border },
    });
    Animated.timing(inputBorderAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const requestOtp = async () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { email });
      navigation.navigate('otp', { email });
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputShadowOpacity = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.12],
  });

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.primaryText}
      />

      <Screen style={styles.container}>
        {DECORATIONS.map((d, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.decoration,
              {
                top: d.top as any,
                left: (d.left as any) ?? undefined,
                right: (d.right as any) ?? undefined,
                fontSize: d.size,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, d.opacity],
                }),
                transform: [{ rotate: d.rotate }, { scale: fadeAnim }],
              },
            ]}
          >
            {d.emoji}
          </Animated.Text>
        ))}

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoWrap}>
            <View style={styles.logoDot} />
            <AppText style={styles.logoText}>Spotlight</AppText>
          </View>

          <AppText style={styles.headline}>Find your{'\n'}people.</AppText>
          <AppText style={styles.subheadline}>
            Join events hosted by real people in your city.
          </AppText>
        </Animated.View>

        <Animated.View
          style={[styles.card, { transform: [{ scale: cardScale }] }]}
        >
          <AppText style={styles.cardTitle}>Enter your email</AppText>
          <AppText style={styles.cardSubtitle}>
            We'll send a 6-digit code to verify it's you.
          </AppText>

          <Animated.View
            style={[
              styles.inputShadowWrap,
              { shadowOpacity: inputShadowOpacity },
            ]}
          >
            <View ref={containerRef} style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  setEmailError('');
                }}
                placeholder="you@example.com"
                placeholderTextColor={Colors.light.secondaryText + 85}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={handleFocus}
                onBlur={handleBlur}
                returnKeyType="done"
                onSubmitEditing={requestOtp}
              />
            </View>
          </Animated.View>

          {emailError ? (
            <View style={styles.errorWrap}>
              <AppText style={styles.errorText}>{emailError}</AppText>
            </View>
          ) : (
            <View style={styles.errorSpacer} />
          )}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnLoading]}
            onPress={requestOtp}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={Colors.light.tertiaryText}
                size="small"
              />
            ) : (
              <AppText style={styles.btnText}>Continue →</AppText>
            )}
          </TouchableOpacity>

          <AppText style={styles.finePrint}>
            By continuing you agree to our Terms &amp; Privacy Policy.
          </AppText>
        </Animated.View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  container: {
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  decoration: {
    position: 'absolute',
    fontFamily: undefined,
  },
  content: {
    marginBottom: 32,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  headline: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.light.primaryText,
    letterSpacing: -0.5,
    lineHeight: 46,
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: 15,
    color: Colors.light.secondaryText,
  },
  card: {
    backgroundColor: Colors.light.secondarySurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primaryText,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '500',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  inputShadowWrap: {
    borderRadius: Radius.md,
    ...Shadows.card,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.secondarySurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primaryText,
    padding: 0,
  },
  errorWrap: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.danger,
    fontWeight: '600',
  },
  errorSpacer: {
    height: 20,
  },
  btn: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  btnLoading: {
    opacity: 0.8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.tertiaryText,
    letterSpacing: 0.2,
  },
  finePrint: {
    fontSize: 11,
    color: Colors.light.secondaryText + 85,
    textAlign: 'center',
    lineHeight: 16,
  },
});

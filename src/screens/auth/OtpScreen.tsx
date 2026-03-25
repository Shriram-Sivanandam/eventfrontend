import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import Colors from '../../constants/colors';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Screen from '../../components/Screen';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

function OtpBox({
  value,
  focused,
  hasError,
}: {
  value: string;
  focused: boolean;
  hasError: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 30,
          bounciness: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
      ]).start();
    }
  }, [scaleAnim, value]);

  const borderColor = hasError
    ? Colors.light.danger
    : focused
    ? Colors.light.primary
    : value
    ? Colors.light.primaryText
    : Colors.light.border;

  const bgColor = hasError
    ? Colors.light.danger + 10
    : focused
    ? Colors.light.primary + 10
    : value
    ? Colors.light.secondarySurface
    : Colors.light.secondarySurface;

  return (
    <Animated.View
      style={[
        box.wrap,
        { borderColor, backgroundColor: bgColor },
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <AppText style={[box.digit, value ? box.digitFilled : box.digitEmpty]}>
        {value || (focused ? '' : '·')}
      </AppText>
      {focused && !value && <View style={box.cursor} />}
    </Animated.View>
  );
}

const box = StyleSheet.create({
  wrap: {
    width: 46,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  digitFilled: {
    color: Colors.light.primaryText,
  },
  digitEmpty: {
    color: Colors.light.secondaryText,
    fontSize: 18,
  },
  cursor: {
    position: 'absolute',
    bottom: 10,
    width: 18,
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
  },
});

export default function OtpScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { email } = route.params;
  const { setToken } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const refocusKeyboard = () => {
    inputRef.current?.blur();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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
        delay: 80,
      }),
    ]).start();

    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [cardScale, fadeAnim, slideAnim]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (code.length < OTP_LENGTH) {
        setOtpError('Please enter the full 6-digit code.');
        return;
      }
      setLoading(true);
      setOtpError('');
      try {
        const res = await api.post('/auth/verify-otp', { email, otp: code });
        await AsyncStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } catch {
        setOtpError('Incorrect or expired code. Try again.');
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -8,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 8,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -5,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ]).start();
        setOtp('');
        setFocusedIdx(0);
        setTimeout(() => inputRef.current?.focus(), 100);
      } finally {
        setLoading(false);
      }
    },
    [email, setToken, slideAnim],
  );

  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      verifyOtp(otp);
    }
  }, [otp, verifyOtp]);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
    setOtpError('');
    setFocusedIdx(Math.min(cleaned.length, OTP_LENGTH - 1));
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await api.post('/auth/request-otp', { email });
      setCooldown(RESEND_COOLDOWN);
      setOtp('');
      setOtpError('');
      setFocusedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      setOtpError('Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const digits = otp.split('').concat(Array(OTP_LENGTH - otp.length).fill(''));
  const hasError = !!otpError;

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.primaryText}
      />

      <Screen style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AppText style={styles.backArrow}>←</AppText>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.topContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.envelopeWrap}>
            <AppText style={styles.envelopeEmoji}>📬</AppText>
            <View style={styles.envelopeDot} />
          </View>

          <AppText style={styles.headline}>Check your{'\n'}email.</AppText>
          <AppText style={styles.subheadline}>
            We sent a 6-digit code to{'\n'}
            <AppText style={styles.emailText}>{email}</AppText>
          </AppText>
        </Animated.View>

        <Animated.View
          style={[styles.card, { transform: [{ scale: cardScale }] }]}
        >
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={styles.hiddenInput}
            caretHidden
            showSoftInputOnFocus={true}
            onFocus={() => setFocusedIdx(Math.min(otp.length, OTP_LENGTH - 1))}
            onBlur={() => setFocusedIdx(-1)}
          />

          <TouchableOpacity
            style={styles.boxesRow}
            onPress={refocusKeyboard}
            activeOpacity={1}
          >
            {digits.map((d, i) => (
              <OtpBox
                key={i}
                value={d}
                focused={focusedIdx === i}
                hasError={hasError}
              />
            ))}
          </TouchableOpacity>

          {hasError ? (
            <View style={styles.errorWrap}>
              <AppText style={styles.errorText}>{otpError}</AppText>
            </View>
          ) : (
            <View style={styles.errorSpacer} />
          )}

          <TouchableOpacity
            style={[
              styles.btn,
              (loading || otp.length < OTP_LENGTH) && styles.btnDim,
            ]}
            onPress={() => verifyOtp(otp)}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={Colors.light.tertiaryText}
                size="small"
              />
            ) : (
              <AppText style={styles.btnText}>Verify & Continue →</AppText>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <AppText style={styles.resendCaption}>Didn't get a code? </AppText>
            {cooldown > 0 ? (
              <AppText style={styles.resendCooldown}>
                Resend in {cooldown}s
              </AppText>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                activeOpacity={0.7}
                disabled={resending}
              >
                <AppText style={styles.resendBtn}>
                  {resending ? 'Sending...' : 'Resend'}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  container: {
    justifyContent: 'flex-end',
  },
  backBtn: {
    position: 'absolute',
    top: 32,
    left: 0,
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: Colors.light.primaryText,
    fontWeight: '600',
  },
  topContent: {
    marginBottom: Spacing.xl,
    marginTop: 80,
  },
  envelopeWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    marginBottom: Spacing.md,
  },
  envelopeEmoji: {
    fontSize: 52,
  },
  envelopeDot: {
    position: 'absolute',
    top: 2,
    right: -5,
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
  },
  headline: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.light.primaryText,
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: 15,
    color: Colors.light.secondaryText,
  },
  emailText: {
    fontWeight: '800',
    color: Colors.light.primaryText,
  },
  card: {
    backgroundColor: Colors.light.secondarySurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  errorWrap: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSpacer: {
    height: 22,
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
  btnDim: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.tertiaryText,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendCaption: {
    fontSize: 13,
    color: Colors.light.secondaryText + 95,
  },
  resendBtn: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  resendCooldown: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.secondaryText + 95,
  },
});

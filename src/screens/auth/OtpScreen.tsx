import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import Colors from '../../constants/colors';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { email } = route.params;

  const verifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError('Please enter valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      await AsyncStorage.setItem('token', res.data.token);
      navigation.reset({
        index: 0,
        routes: [{ name: 'home' }],
      });
    } catch (error) {
      setOtpError('The code is incorrect or has expired.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/request-otp', { email });
      Alert.alert('Sent!', 'A new code has been sent to your email.');
    } catch (error) {
      setOtpError('Could not resend code. Try again later.');
      console.log(error);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          OTP Verification
        </AppText>
        <AppText variant="caption" style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <AppText style={styles.emailHighlight}>{email}</AppText>
        </AppText>

        <View style={styles.inputContainer}>
          <AppInput
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.otpInput}
          />
        </View>

        <AppText variant="caption" style={styles.errorText}>
          {otpError}
        </AppText>

        <AppButton title="Verify & Continue" onPress={verifyOtp} />

        <View style={styles.resendContainer}>
          <AppText variant="caption">Didn't receive a code? </AppText>
          <TouchableOpacity onPress={handleResend}>
            <AppText style={styles.resendText}>Resend</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  content: {
    marginTop: 10,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: Colors.light.primaryText,
  },
  inputContainer: {
    width: '100%',
  },
  errorText: {
    color: Colors.light.danger,
    marginBottom: 20,
  },
  otpInput: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    fontWeight: 'bold',
    color: Colors.light.linkText,
  },
});

import React, { useState } from 'react';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import api from '../../api/client';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const route = useRoute<any>();
  const { email } = route.params;

  const verifyOtp = async () => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    await AsyncStorage.setItem('token', res.data.token);
  };

  return (
    <Screen>
      <AppText variant="title">Enter OTP</AppText>
      <AppInput value={otp} onChangeText={setOtp} placeholder="6-digit OTP" />

      <AppButton title="Verify" onPress={verifyOtp} />
    </Screen>
  );
}

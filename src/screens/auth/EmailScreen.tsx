import React, { useState } from 'react';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/client';

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<any>();

  const requestOtp = async () => {
    console.log('hellooo');
    await api.post('/auth/request-otp', { email });

    navigation.navigate('otp', { email });
  };

  return (
    <Screen>
      <AppText variant="title">Welcome</AppText>
      <AppText variant="caption">Enter your email</AppText>

      <AppInput value={email} onChangeText={setEmail} placeholder="Email" />

      <AppButton title="Continue" onPress={requestOtp} />
    </Screen>
  );
}

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import Colors from '../../constants/colors';
import { Radius } from '../../constants/layout';

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigation = useNavigation<any>();

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const requestOtp = async () => {
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/request-otp', { email });
      navigation.navigate('otp', { email });
    } catch (error) {
      setEmailError('Something went wrong. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.borderCont}>
        <View style={styles.border} />
        <AppText variant="caption" style={styles.borderText}>
          LOG IN OR SIGN UP
        </AppText>
        <View style={styles.border} />
      </View>

      <View style={styles.header}>
        {/* <AppText variant="title">Welcome Back</AppText> */}
        <AppText variant="caption">
          We'll send a 6-digit code to your email for verification.
        </AppText>
      </View>

      <View style={styles.form}>
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="10-digit mobile number"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AppText variant="caption" style={styles.errorText}>
          {emailError}
        </AppText>

        <AppButton title="Continue" loading={loading} onPress={requestOtp} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginVertical: 15,
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: Colors.light.danger,
    marginBottom: 20,
  },
  borderCont: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  border: {
    borderTopColor: Colors.light.borderSecondary,
    flex: 1,
    height: 0.5,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
  },
  borderText: {
    marginHorizontal: 10,
    color: Colors.light.secondaryText,
  },
});

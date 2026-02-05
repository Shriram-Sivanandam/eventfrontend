import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmailScreen from '../screens/auth/EmailScreen';
import OtpScreen from '../screens/auth/OtpScreen';

export type AuthStackParamList = {
  email: undefined;
  otp: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="email" component={EmailScreen} />
      <Stack.Screen name="otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}

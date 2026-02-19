import React from 'react';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import Screen from '../../components/Screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { setToken } = useAuth();

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Screen>
      <AppText />
      <AppButton title="logout" onPress={logout} />
    </Screen>
  );
}

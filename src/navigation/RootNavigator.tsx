import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import EventsStack from './EventsStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function RootNavigator() {
  const { token, setToken } = useAuth();

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
  }, [setToken]);

  return (
    <NavigationContainer>
      {token ? <EventsStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

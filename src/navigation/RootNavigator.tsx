import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import EventsStack from './EventsStack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootNavigator() {
  const { token, setToken, onboardingComplete, isLoading } = useAuth();

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
  }, [setToken]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  } else {
    return (
      <NavigationContainer>
        {token ? (
          onboardingComplete ? (
            <EventsStack />
          ) : (
            <OnboardingScreen />
          )
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

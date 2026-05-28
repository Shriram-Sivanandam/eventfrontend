import React, { useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import AuthStack from './AuthStack';
import EventsStack from './EventsStack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { useNotifications } from '../hooks/useNotifications';

export default function RootNavigator() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const { token, onboardingComplete, isLoading } = useAuth();

  useNotifications(navigationRef, !!token);

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

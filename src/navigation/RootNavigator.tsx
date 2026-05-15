import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import EventsStack from './EventsStack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

export default function RootNavigator() {
  const { token, onboardingComplete, isLoading } = useAuth();

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

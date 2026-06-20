import React, { useEffect, useRef, useState } from 'react';
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
import BootSplash from 'react-native-bootsplash';
import NotificationPermissionModal from '../components/NotificationPermissionModal';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootNavigator() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const { token, onboardingComplete, isLoading } = useAuth();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { status, requestPermissionNow } = useNotificationPermission(!!token);

  useNotifications(navigationRef, !!token);

  useEffect(() => {
    if (!token || !onboardingComplete) return;
    if (status !== 'denied') return;

    const check = async () => {
      const asked = await AsyncStorage.getItem('notification_permission_asked');
      if (!asked) setShowPermissionModal(true);
    };
    check();
  }, [token, onboardingComplete, status]);

  const handleAllow = async () => {
    setShowPermissionModal(false);
    await requestPermissionNow();
  };

  const handleSkip = async () => {
    setShowPermissionModal(false);
    await AsyncStorage.setItem('notification_permission_asked', 'true');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  } else {
    return (
      <>
        <NavigationContainer
          onReady={() => {
            BootSplash.hide({ fade: true });
          }}
        >
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

        <NotificationPermissionModal
          visible={showPermissionModal}
          onAllow={handleAllow}
          onSkip={handleSkip}
        />
      </>
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

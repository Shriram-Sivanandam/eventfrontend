import { useCallback, useEffect, useState } from 'react';
import {
  getMessaging,
  requestPermission,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

type PermissionStatus = 'loading' | 'granted' | 'denied' | 'blocked';

const PERMISSION_ASKED_KEY = 'notification_permission_asked';

export function useNotificationPermission(enabled: boolean) {
  const [status, setStatus] = useState<PermissionStatus>('loading');

  const checkPermission = useCallback(async () => {
    const messaging = getMessaging();
    const current = await requestPermission(messaging);

    if (
      current === AuthorizationStatus.AUTHORIZED ||
      current === AuthorizationStatus.PROVISIONAL
    ) {
      setStatus('granted');
      await saveToken();
      return;
    }

    if (current === AuthorizationStatus.DENIED) {
      // On iOS denied = permanently blocked (user has to go to Settings)
      // On Android 13+ denied means we haven't asked yet or they said no
      setStatus(Platform.OS === 'ios' ? 'blocked' : 'denied');
      return;
    }

    // NOT_DETERMINED — first time, haven't asked yet
    setStatus('denied');
  }, []);

  useEffect(() => {
    if (!enabled) return;
    checkPermission();
  }, [checkPermission, enabled]);

  // Called when the user taps "Allow" on your pre-permission modal
  const requestPermissionNow = async (): Promise<boolean> => {
    const messaging = getMessaging();
    const result = await requestPermission(messaging);

    await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');

    if (
      result === AuthorizationStatus.AUTHORIZED ||
      result === AuthorizationStatus.PROVISIONAL
    ) {
      setStatus('granted');
      await saveToken();
      return true;
    }

    // User denied — on subsequent denies it becomes blocked on iOS
    setStatus(Platform.OS === 'ios' ? 'blocked' : 'denied');
    return false;
  };

  // Opens the device Settings app so the user can enable notifications manually
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const saveToken = async () => {
    try {
      const messaging = getMessaging();
      const token = await getToken(messaging);
      await api.post('/auth/fcm-token', { token });
    } catch (err) {
      console.log('FCM token save error:', err);
    }
  };

  return { status, requestPermissionNow, openSettings };
}

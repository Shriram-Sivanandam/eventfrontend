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
import { useToast } from '../context/ToastContext';

type PermissionStatus = 'loading' | 'granted' | 'denied' | 'blocked';

const PERMISSION_ASKED_KEY = 'notification_permission_asked';

export function useNotificationPermission(enabled: boolean) {
  const [status, setStatus] = useState<PermissionStatus>('loading');
  const { showToast } = useToast();

  const saveToken = useCallback(async () => {
    try {
      const messaging = getMessaging();
      const token = await getToken(messaging);
      await api.post('/auth/fcm-token', { token });
    } catch {
      showToast({
        type: 'error',
        message: 'Something went wrong while saving token',
      });
    }
  }, [showToast]);

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
      setStatus(Platform.OS === 'ios' ? 'blocked' : 'denied');
      return;
    }

    setStatus('denied');
  }, [saveToken]);

  useEffect(() => {
    if (!enabled) return;
    checkPermission();
  }, [checkPermission, enabled]);

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

    setStatus(Platform.OS === 'ios' ? 'blocked' : 'denied');
    return false;
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return { status, requestPermissionNow, openSettings };
}

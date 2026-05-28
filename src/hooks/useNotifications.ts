import { useCallback, useEffect } from 'react';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const SCREEN_MAP: Record<string, string> = {
  EventDashboard: 'EventDashboard',
  EventDetails: 'EventDetails',
  RegisteredEvents: 'RegisteredEvents',
};

export function useNotifications(navigationRef: any, loggedIn: boolean) {
  const { showToast } = useToast();

  const registerToken = useCallback(async (messagingInstance: any) => {
    try {
      const token = await getToken(messagingInstance);
      await saveToken(token);
    } catch (err) {
      console.log('Failed to get FCM token:', err);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    const messagingInstance = getMessaging();

    let unsubscribeTokenRefresh: (() => void) | undefined;
    let unsubscribeForeground: (() => void) | undefined;

    const setup = async () => {
      const status = await requestPermission(messagingInstance);
      const allowed =
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL;

      if (!allowed) {
        console.log('Notification permission denied');
        return;
      }

      await registerToken(messagingInstance);

      unsubscribeTokenRefresh = onTokenRefresh(
        messagingInstance,
        async token => {
          await saveToken(token);
        },
      );

      unsubscribeForeground = onMessage(
        messagingInstance,
        async remoteMessage => {
          const title = remoteMessage.notification?.title ?? '';
          const body = remoteMessage.notification?.body ?? '';
          if (title || body) {
            showToast({
              type: 'info',
              message: title ? `${title}: ${body}` : body,
            });
          }
        },
      );

      onNotificationOpenedApp(messagingInstance, remoteMessage => {
        handleNotificationTap(remoteMessage.data, navigationRef);
      });

      const initialMessage = await getInitialNotification(messagingInstance);
      if (initialMessage) {
        setTimeout(() => {
          handleNotificationTap(initialMessage.data, navigationRef);
        }, 500);
      }
    };

    setup();

    return () => {
      unsubscribeTokenRefresh?.();
      unsubscribeForeground?.();
    };
  }, [loggedIn, navigationRef, registerToken, showToast]);

  const saveToken = async (token: string) => {
    try {
      await api.post('/auth/fcm-token', { token });
    } catch (err) {
      console.log('Failed to save FCM token:', err);
    }
  };
}

function handleNotificationTap(data: any, navigationRef: any) {
  if (!data?.screen || !navigationRef?.current) return;
  const screen = SCREEN_MAP[data.screen];
  if (!screen) return;
  const params = data.event_id ? { eventId: data.event_id } : undefined;
  navigationRef.current.navigate(screen, params);
}

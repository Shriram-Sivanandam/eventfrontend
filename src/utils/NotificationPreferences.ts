import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'notification_preferences';

export type NotificationPreferences = {
  events: boolean;
  chat: boolean;
  reminders: boolean;
};

const DEFAULTS: NotificationPreferences = {
  events: true,
  chat: true,
  reminders: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export async function setNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<void> {
  try {
    const current = await getNotificationPreferences();
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {
    // ignore
  }
}

export function notificationTypeToPreference(
  type: string,
): keyof NotificationPreferences | null {
  if (
    [
      'new_registration',
      'registration_accepted',
      'registration_rejected',
      'event_cancelled',
      'attendee_left',
    ].includes(type)
  ) {
    return 'events';
  }
  if (type === 'chat_message') return 'chat';
  if (type === 'event_reminder') return 'reminders';
  return null;
}

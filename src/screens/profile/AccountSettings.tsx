import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import {
  getNotificationPreferences,
  setNotificationPreferences,
} from '../../utils/NotificationPreferences';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import { useToast } from '../../context/ToastContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function SectionLabel({ label }: { label: string }) {
  return <AppText style={styles.sectionLabel}>{label}</AppText>;
}

function SettingsRow({
  icon,
  iconBg,
  label,
  sublabel,
  onPress,
  rightElement,
  destructive,
}: {
  icon: IconName;
  iconBg: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color="#fff" />
      </View>
      <View style={styles.rowContent}>
        <AppText
          style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}
        >
          {label}
        </AppText>
        {sublabel && <AppText style={styles.rowSublabel}>{sublabel}</AppText>}
      </View>
      {rightElement ??
        (onPress && (
          <Ionicons name="chevron-forward" size={15} color="#C4BAB0" />
        ))}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const { setToken, setOnboardingComplete } = useAuth() as any;
  const { showToast } = useToast();

  const [notifEvents, setNotifEvents] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const { status: permStatus, openSettings } = useNotificationPermission(true);
  const notificationsBlocked =
    permStatus === 'blocked' || permStatus === 'denied';

  useEffect(() => {
    getNotificationPreferences().then(prefs => {
      setNotifEvents(prefs.events);
      setNotifChat(prefs.chat);
      setNotifReminders(prefs.reminders);
    });
  }, []);

  const handleToggleEvents = (val: boolean) => {
    setNotifEvents(val);
    setNotificationPreferences({ events: val });
  };
  const handleToggleChat = (val: boolean) => {
    setNotifChat(val);
    setNotificationPreferences({ chat: val });
  };
  const handleToggleReminders = (val: boolean) => {
    setNotifReminders(val);
    setNotificationPreferences({ reminders: val });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, all your events, registrations, messages and ratings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: confirmDelete },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Final confirmation',
      'Your account will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Go back', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ],
    );
  };

  const deleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete('/auth/me');
      await AsyncStorage.clear();
      setToken(null);
      setOnboardingComplete(false);
    } catch {
      showToast({
        type: 'error',
        message: 'Could not delete your account. Please try again later',
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1A0A00" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Account</AppText>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionLabel label="Notifications" />
        {notificationsBlocked && (
          <TouchableOpacity
            style={styles.blockedBanner}
            onPress={openSettings}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-off-outline"
              size={16}
              color="#E63946"
            />
            <View style={{ flex: 1 }}>
              <AppText style={styles.blockedTitle}>
                Notifications are disabled
              </AppText>
              <AppText style={styles.blockedSub}>
                Tap to open Settings and enable them
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#E63946" />
          </TouchableOpacity>
        )}
        <Card>
          <SettingsRow
            icon="notifications-outline"
            iconBg="#FF6B35"
            label="Event updates"
            sublabel="Registrations, acceptances, cancellations"
            rightElement={
              <Switch
                value={notifEvents}
                onValueChange={handleToggleEvents}
                trackColor={{ false: '#EDE8DF', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <SettingsRow
            icon="chatbubble-outline"
            iconBg="#2EC4B6"
            label="Chat messages"
            sublabel="New messages in event chats"
            rightElement={
              <Switch
                value={notifChat}
                onValueChange={handleToggleChat}
                trackColor={{ false: '#EDE8DF', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <SettingsRow
            icon="time-outline"
            iconBg="#8338EC"
            label="Event reminders"
            sublabel="1 hour before events start"
            rightElement={
              <Switch
                value={notifReminders}
                onValueChange={handleToggleReminders}
                trackColor={{ false: '#EDE8DF', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            }
          />
        </Card>

        <SectionLabel label="Support" />
        <Card>
          <SettingsRow
            icon="mail-outline"
            iconBg="#2EC4B6"
            label="Contact support"
            sublabel="support@spotlight.app"
            onPress={() =>
              Linking.openURL(
                'mailto:support@spotlight.app?subject=Support Request',
              )
            }
          />
          <Divider />
          <SettingsRow
            icon="bug-outline"
            iconBg="#8338EC"
            label="Report a bug"
            onPress={() =>
              Linking.openURL('mailto:support@spotlight.app?subject=Bug Report')
            }
          />
          <Divider />
          <SettingsRow
            icon="star-outline"
            iconBg="#FF6B35"
            label="Rate Spotlight"
            sublabel="Enjoying the app? Leave us a review"
            onPress={() =>
              Linking.openURL('market://details?id=com.spotlightevents.myapp')
            }
          />
        </Card>

        <SectionLabel label="Legal" />
        <Card>
          <SettingsRow
            icon="document-text-outline"
            iconBg="#5C4F42"
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://spotlightinfo.in/privacy')}
          />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconBg="#5C4F42"
            label="Terms of Service"
            onPress={() => Linking.openURL('https://spotlightinfo.in/terms')}
          />
          <Divider />
          <SettingsRow
            icon="information-circle-outline"
            iconBg="#5C4F42"
            label="App version"
            sublabel="1.0.0"
          />
        </Card>

        <SectionLabel label="Danger Zone" />
        <Card>
          <TouchableOpacity
            style={styles.deleteRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={deletingAccount}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: Colors.light.danger },
              ]}
            >
              {deletingAccount ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="trash-outline" size={17} color="#fff" />
              )}
            </View>
            <View style={styles.rowContent}>
              <AppText style={styles.rowLabelDestructive}>
                Delete account
              </AppText>
              <AppText style={styles.rowSublabel}>
                Permanently removes all your data
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={15} color="#E63946" />
          </TouchableOpacity>
        </Card>

        <AppText style={styles.deletionNote}>
          You can also request account deletion by emailing{' '}
          <AppText
            style={styles.deletionLink}
            onPress={() =>
              Linking.openURL(
                'mailto:support@spotlight.app?subject=Delete my account',
              )
            }
          >
            support@spotlight.app
          </AppText>
        </AppText>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A0A00',
    letterSpacing: -0.5,
  },

  scrollContent: { paddingHorizontal: Spacing.md },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFDF8',
    borderRadius: 20,
    padding: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 22, fontWeight: '900', color: '#fff' },
  profileText: { flex: 1 },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A0A00',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#8A7B6B',
    fontWeight: '500',
    marginBottom: 4,
  },
  profileCity: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  profileCityText: { fontSize: 11, color: '#8A7B6B', fontWeight: '500' },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FF6B3512',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B3530',
  },
  editBadgeText: { fontSize: 12, fontWeight: '700', color: '#FF6B35' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C4BAB0',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    marginBottom: Spacing.lg,
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#1A0A00' },
  rowLabelDestructive: { fontSize: 15, fontWeight: '600', color: '#E63946' },
  rowSublabel: {
    fontSize: 11,
    color: '#8A7B6B',
    fontWeight: '400',
    marginTop: 1,
  },
  divider: { height: 1, backgroundColor: '#F5F0E8', marginLeft: 64 },

  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  deletionNote: {
    fontSize: 11,
    color: '#C4BAB0',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: -8,
    paddingHorizontal: 16,
  },
  deletionLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E6394610',
    borderWidth: 1.5,
    borderColor: '#E6394630',
    borderRadius: 14,
    padding: 14,
    marginBottom: Spacing.lg,
  },
  blockedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E63946',
    marginBottom: 2,
  },
  blockedSub: { fontSize: 11, color: '#E6394690', fontWeight: '500' },
});

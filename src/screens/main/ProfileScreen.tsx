import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import api from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import { useNavigation } from '@react-navigation/native';
import InfoRow from '../../components/InfoRow';

function getInitials(name: string, email: string): string {
  const source = name || email || '?';
  return source
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const { setToken } = useAuth();
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<any>(null);
  const [eventCount, setEventCount] = useState<number>(0);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);

      const eventsRes = await api.get('/events?host_user_id=' + res.data.id);
      setEventCount(eventsRes.data.count ?? eventsRes.data.events?.length ?? 0);
    } catch (err) {
      console.log('PROFILE ERROR', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = user ? getInitials(user.name, user.email) : '';
  const displayName = user?.name || user?.email?.split('@')[0] || '';

  return (
    <Screen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF8" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="pageHeader" style={styles.headerTitle}>
            Profile
          </AppText>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Ionicons name="pencil" size={16} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.nameCardCont}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <AppText style={styles.avatarInitials}>{initials}</AppText>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <AppText style={styles.profileName}>{displayName}</AppText>
              {user?.name && (
                <AppText style={styles.profileEmail}>{user.email}</AppText>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText style={styles.statNumber}>{eventCount}</AppText>
              <AppText style={styles.statLabel}>Hosted</AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AppText style={styles.statNumber}>—</AppText>
              <AppText style={styles.statLabel}>Attended</AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AppText style={styles.statNumber}>—</AppText>
              <AppText style={styles.statLabel}>Following</AppText>
            </View>
          </View>
        </View>

        <View>
          <AppText style={styles.sectionLabel}>Activity</AppText>
          <View style={styles.menuSection}>
            <InfoRow
              icon="albums-outline"
              accent="#FF6B35"
              onPress={() => navigation.navigate('MyEvents')}
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">My Events</AppText>
            </InfoRow>
            <View style={styles.menuDivider} />
            <InfoRow
              icon="calendar-clear-outline"
              accent="#2EC4B6"
              onPress={() => navigation.navigate('RegisteredEvents')}
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">Registered Events</AppText>
            </InfoRow>
          </View>

          <AppText style={styles.sectionLabel}>Account</AppText>
          <View style={styles.menuSection}>
            <InfoRow
              icon="person-outline"
              accent="#8338EC"
              onPress={() => navigation.navigate('AccountSettings')}
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">Account Settings</AppText>
            </InfoRow>
            <View style={styles.menuDivider} />
            <InfoRow
              icon="notifications-outline"
              accent="#FFBE0B"
              onPress={() => navigation.navigate('Notifications')}
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">Notifications</AppText>
            </InfoRow>
            <View style={styles.menuDivider} />
            <InfoRow
              icon="shield-checkmark-outline"
              accent="#2EC4B6"
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">Privacy & Security</AppText>
            </InfoRow>
          </View>

          <AppText style={styles.sectionLabel}>More</AppText>
          <View style={styles.menuSection}>
            <InfoRow
              icon="help-circle-outline"
              accent="#5C4F42"
              onPress={() => navigation.navigate('HelpAndSupport')}
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">Help & Support</AppText>
            </InfoRow>
            <View style={styles.menuDivider} />
            <InfoRow
              icon="exit-outline"
              onPress={logout}
              accent={Colors.light.danger}
              rowStyle={styles.rowStyle}
            >
              <AppText variant="body">Log Out</AppText>
            </InfoRow>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xxl,
    backgroundColor: Colors.light.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    letterSpacing: 0.5,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B3518',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  nameCardCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
    width: 70,
    height: 70,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: Radius.pill,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.light.surface,
    letterSpacing: 1,
  },
  profileInfo: {
    marginBottom: Spacing.lg,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primaryText,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.secondaryText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  menuSection: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  rowStyle: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: 0,
  },
});

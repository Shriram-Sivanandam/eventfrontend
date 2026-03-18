import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HostProfile } from '../../constants/types';
import RegisteredEventCard from '../../components/RegisteredEventCard';
import Colors from '../../constants/colors';
import Screen from '../../components/Screen';

const IMAGE_BASE = 'http://10.0.2.2:8080';

function getInitials(name?: string, email?: string) {
  const src = name || email || '?';
  return src
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

const AVATAR_COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function RatingCard({
  label,
  score,
  count,
  accent,
  icon,
}: {
  label: string;
  score?: number;
  count?: number;
  accent: string;
  icon: string;
}) {
  return (
    <View style={[rc.card, { borderColor: accent + '30' }]}>
      <View style={[rc.iconWrap, { backgroundColor: accent + '18' }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <AppText style={rc.label}>{label}</AppText>
      {score != null ? (
        <>
          <AppText style={[rc.score, { color: accent }]}>
            {score.toFixed(1)}{' '}
            <Ionicons name={'star'} size={20} color={'#FFBE0B'} />
          </AppText>
          {count != null && (
            <AppText style={rc.count}>
              {count} rating{count !== 1 ? 's' : ''}
            </AppText>
          )}
        </>
      ) : (
        <AppText style={rc.noRating}>No ratings yet</AppText>
      )}
    </View>
  );
}
const rc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    ...Shadows.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  score: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  count: {
    fontSize: 10,
    color: Colors.light.secondaryText,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  noRating: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

function StatItem({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={stat.item}>
      <AppText style={stat.value}>{value}</AppText>
      <AppText style={stat.label}>{label}</AppText>
    </View>
  );
}
const stat = StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  label: {
    fontSize: 10,
    color: Colors.light.secondaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
});

export default function HostProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { hostId } = route.params;

  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const res = await api.get(`/users/${hostId}/profile`);
        setProfile(res.data);
      } catch (err) {
        console.log('HOST PROFILE ERROR', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hostId],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading || !profile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
        <View style={styles.loadingWrap}>
          <AppText style={styles.loadingText}>Loading profile…</AppText>
        </View>
      </View>
    );
  }

  const avatarUri = profile.avatar_url
    ? `${IMAGE_BASE}${profile.avatar_url}`
    : null;
  const initials = getInitials(profile.name, profile.email);
  const color = avatarColor(profile.user_id);
  const displayName = profile.name || profile.email.split('@')[0];

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetch(true)}
            tintColor="#FF6B35"
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A0A00" />
          </TouchableOpacity>
        </View>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.avatarPlaceholder, { backgroundColor: color }]}
              >
                <AppText style={styles.avatarInitials}>{initials}</AppText>
              </View>
            )}
          </View>

          <AppText style={styles.displayName}>{displayName}</AppText>

          {/* City + age + gender chips */}
          <View style={styles.chipRow}>
            {profile.city && (
              <View style={styles.chip}>
                <Ionicons name="location-outline" size={11} color="#8A7B6B" />
                <AppText style={styles.chipText}>{profile.city}</AppText>
              </View>
            )}
            {profile.age && (
              <View style={styles.chip}>
                <AppText style={styles.chipText}>{profile.age} yrs</AppText>
              </View>
            )}
            {profile.gender && profile.gender !== 'prefer_not_to_say' && (
              <View style={styles.chip}>
                <AppText style={styles.chipText}>
                  {profile.gender.replace('_', '-')}
                </AppText>
              </View>
            )}
          </View>

          {/* Bio */}
          {profile.bio && <AppText style={styles.bio}>{profile.bio}</AppText>}
        </View>

        {/* ── Activity stats ── */}
        <View style={styles.statsCard}>
          <StatItem value={profile.total_hosted} label="Hosted" />
          <View style={styles.statsDivider} />
          <StatItem value={profile.total_attended} label="Attended" />
          <View style={styles.statsDivider} />
          <StatItem value={profile.total_ratings} label="Reviews" />
        </View>

        {/* ── Ratings ── */}
        <View style={styles.sectionWrap}>
          <AppText style={styles.sectionLabel}>Ratings</AppText>
          <View style={styles.ratingsRow}>
            <RatingCard
              label="As a Host"
              score={profile.hosting_rating ?? undefined}
              count={profile.total_ratings}
              accent="#FF6B35"
              icon="megaphone-outline"
            />
            <View style={{ width: 10 }} />
            <RatingCard
              label="As Attendee"
              score={profile.attendee_rating ?? undefined}
              accent="#2EC4B6"
              icon="person-outline"
            />
          </View>
        </View>

        {/* ── Past events ── */}
        <View style={styles.sectionWrap}>
          <AppText style={styles.sectionLabel}>
            Past Events{' '}
            {profile.past_events.length > 0
              ? `· ${profile.past_events.length}`
              : ''}
          </AppText>

          {profile.past_events.length === 0 ? (
            <View style={styles.emptyEvents}>
              <AppText style={styles.emptyEmoji}>📭</AppText>
              <AppText style={styles.emptyText}>No past events yet</AppText>
            </View>
          ) : (
            profile.past_events.map(ev => (
              <RegisteredEventCard
                isPast={false}
                key={ev.id}
                isBottomRow={false}
                event={ev}
                onPress={() =>
                  navigation.navigate('EventDetails', { event: ev })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: '#8A7B6B', fontWeight: '500' },
  header: {
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  avatarWrap: { marginBottom: Spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.tertiaryText,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primaryText,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.light.secondarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipText: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    fontWeight: '600',
  },
  bio: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF8',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  statsDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.xs,
  },
  sectionWrap: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.secondaryText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  ratingsRow: { flexDirection: 'row' },
  emptyEvents: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
});

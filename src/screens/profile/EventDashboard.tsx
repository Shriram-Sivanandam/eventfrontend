import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../../components/Screen';
import Colors from '../../constants/colors';
import {
  Dashboard,
  FilterTab,
  Registrant,
  RegistrantStatus,
} from '../../constants/types';
import RegistrantRow from '../../components/RegistrantRow';

const IMAGE_BASE = 'http://10.0.2.2:8080';

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    full: d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    day: d.getDate(),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
}
function formatDuration(mins?: number) {
  if (!mins) return null;
  const h = Math.floor(mins / 60),
    m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={[sc.wrap, { borderTopColor: color }]}>
      <AppText style={[sc.val, { color }]}>{value}</AppText>
      <AppText style={sc.lbl}>{label}</AppText>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    ...Shadows.card,
  },
  val: { fontSize: 22, fontWeight: '900' },
  lbl: {
    fontSize: 10,
    color: Colors.light.secondaryText,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default function EventDashboard() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params.id;

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const res = await api.get(`/events/${id}/dashboard`);
        setDashboard(res.data);
      } catch (err) {
        console.log('DASHBOARD ERROR', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const updateStatus = async (reg: Registrant, status: RegistrantStatus) => {
    setUpdatingId(reg.registration_id);
    try {
      await api.patch(`/events/${id}/registrations/${reg.registration_id}`, {
        status,
      });
      setDashboard(prev => {
        if (!prev) return prev;
        const updated = prev.registrants.map(r =>
          r.registration_id === reg.registration_id ? { ...r, status } : r,
        );
        const accepted = updated.filter(r => r.status === 'accepted').length;
        const pending = updated.filter(r => r.status === 'pending').length;
        const rejected = updated.filter(r => r.status === 'rejected').length;
        return {
          ...prev,
          registrants: updated,
          accepted,
          pending,
          rejected,
          total_registered: accepted + pending,
        };
      });
    } catch {
      Alert.alert('Error', 'Failed to update registration.');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmUpdate = (reg: Registrant, status: RegistrantStatus) => {
    const name = reg.name || reg.email;
    const labels: Record<RegistrantStatus, string> = {
      accepted: 'Accept',
      rejected: 'Reject',
      pending: 'Reset to Pending',
    };
    Alert.alert(
      `${labels[status]} registration`,
      `${labels[status]} ${name}'s registration?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: labels[status],
          style: status === 'rejected' ? 'destructive' : 'default',
          onPress: () => updateStatus(reg, status),
        },
      ],
    );
  };

  if (loading || !dashboard) {
    return (
      <View style={s.loadingWrap}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const { event, accepted, pending, rejected, registrants } = dashboard;
  const { full: fullDate, time, day, month } = formatDate(event.event_start);
  const duration = formatDuration(event.duration_minutes);
  const isPast = new Date(event.event_start) < new Date();
  const addressParts = [
    event.address_line_one,
    event.city,
    event.pincode,
  ].filter(Boolean);

  const FILTER_TABS: {
    key: FilterTab;
    label: string;
    count: number;
    color: string;
  }[] = [
    { key: 'all', label: 'All', count: registrants.length, color: '#FF6B35' },
    { key: 'pending', label: 'Pending', count: pending, color: '#FFBE0B' },
    { key: 'accepted', label: 'Accepted', count: accepted, color: '#2EC4B6' },
    { key: 'rejected', label: 'Rejected', count: rejected, color: '#E63946' },
  ];

  const filtered =
    filterTab === 'all'
      ? registrants
      : registrants.filter(r => r.status === filterTab);

  return (
    <View style={s.mainCont}>
      <View style={s.heroWrap}>
        {event.image_url ? (
          <Image
            source={{ uri: `${IMAGE_BASE}${event.image_url}` }}
            style={s.heroImg}
            resizeMode="cover"
          />
        ) : (
          <View style={s.heroFb}>
            <AppText style={s.heroEmoji}>🎉</AppText>
          </View>
        )}
        <View style={s.heroScrim} />
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => navigation.navigate('EditEvent', { event })}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <View
          style={[
            s.heroPill,
            { backgroundColor: isPast ? '#8A7B6B' : '#FF6B35' },
          ]}
        >
          <AppText style={s.heroPillTxt}>
            {isPast ? 'ENDED' : 'UPCOMING'}
          </AppText>
        </View>
      </View>

      <Screen>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchDashboard(true)}
              tintColor={Colors.light.primary}
            />
          }
        >
          <View>
            <View style={s.titleCard}>
              <AppText style={s.title}>{event.title}</AppText>
              <View style={s.dateRow}>
                <View style={s.datePill}>
                  <AppText style={s.dpDay}>{day}</AppText>
                  <AppText style={s.dpMon}>{month}</AppText>
                </View>
                <View>
                  <AppText style={s.dateMain}>{fullDate}</AppText>
                  <AppText style={s.dateSub}>
                    {time}
                    {duration ? ` · ${duration}` : ''}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={s.statsRow}>
              <StatCard
                value={dashboard.total_registered}
                label="Total"
                color="#FF6B35"
              />
              <StatCard value={pending} label="Pending" color="#FFBE0B" />
              <StatCard value={accepted} label="Accepted" color="#2EC4B6" />
              <StatCard value={rejected} label="Rejected" color="#E63946" />
            </View>

            {event.capacity && (
              <View style={s.capCard}>
                <View style={s.capHeader}>
                  <AppText style={s.capLbl}>
                    Capacity — {dashboard.total_registered} / {event.capacity}
                  </AppText>
                  <AppText style={s.capPct}>
                    {Math.round(
                      (dashboard.total_registered / event.capacity) * 100,
                    )}
                    %
                  </AppText>
                </View>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        width: `${Math.min(
                          (dashboard.total_registered / event.capacity) * 100,
                          100,
                        )}%` as any,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            <AppText style={s.secLabel}>Event Details</AppText>
            <View style={s.card}>
              {event.description ? (
                <View style={s.dRow}>
                  <View style={s.dIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={15}
                      color="#8A7B6B"
                    />
                  </View>
                  <AppText style={s.dText}>{event.description}</AppText>
                </View>
              ) : null}
              <View style={s.dRow}>
                <View style={s.dIcon}>
                  <Ionicons name="location-outline" size={15} color="#8A7B6B" />
                </View>
                <View>
                  <AppText style={s.dMain}>{event.location || 'TBA'}</AppText>
                  {addressParts.length > 0 && (
                    <AppText style={s.dSub}>{addressParts.join(', ')}</AppText>
                  )}
                </View>
              </View>
              <View style={s.dRow}>
                <View style={s.dIcon}>
                  <Ionicons name="pricetag-outline" size={15} color="#8A7B6B" />
                </View>
                <AppText style={s.dMain}>
                  {event.price > 0 ? `₹${event.price} per person` : 'Free'}
                </AppText>
              </View>
              {event.things_to_bring && (
                <View style={s.dRow}>
                  <View style={s.dIcon}>
                    <Ionicons name="bag-outline" size={15} color="#8A7B6B" />
                  </View>
                  <View>
                    <AppText style={s.dMeta}>Things to bring</AppText>
                    <AppText style={s.dText}>{event.things_to_bring}</AppText>
                  </View>
                </View>
              )}
              {event.things_provided && (
                <View style={s.dRow}>
                  <View style={s.dIcon}>
                    <Ionicons name="gift-outline" size={15} color="#8A7B6B" />
                  </View>
                  <View>
                    <AppText style={s.dMeta}>Things provided</AppText>
                    <AppText style={s.dText}>{event.things_provided}</AppText>
                  </View>
                </View>
              )}
            </View>

            <AppText style={s.secLabel}>
              Registrants ({registrants.length})
            </AppText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.sm }}
            >
              {FILTER_TABS.map(ft => (
                <TouchableOpacity
                  key={ft.key}
                  style={[
                    s.ftTab,
                    filterTab === ft.key && {
                      backgroundColor: ft.color + '18',
                      borderColor: ft.color,
                    },
                  ]}
                  onPress={() => setFilterTab(ft.key)}
                  activeOpacity={0.8}
                >
                  <AppText
                    style={[
                      s.ftText,
                      filterTab === ft.key && {
                        color: ft.color,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {ft.label}
                  </AppText>
                  <View
                    style={[
                      s.ftBadge,
                      {
                        backgroundColor:
                          filterTab === ft.key ? ft.color : '#EDE8DF',
                      },
                    ]}
                  >
                    <AppText
                      style={[
                        s.ftBadgeText,
                        filterTab === ft.key && { color: '#fff' },
                      ]}
                    >
                      {ft.count}
                    </AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.card}>
              {filtered.length === 0 ? (
                <View style={s.emptyWrap}>
                  <AppText style={s.emptyTxt}>
                    No {filterTab === 'all' ? '' : filterTab} registrations
                  </AppText>
                </View>
              ) : (
                filtered.map((reg, i) => (
                  <React.Fragment key={reg.registration_id}>
                    <RegistrantRow
                      reg={reg}
                      updating={updatingId === reg.registration_id}
                      onAccept={() => confirmUpdate(reg, 'accepted')}
                      onReject={() => confirmUpdate(reg, 'rejected')}
                      onPending={() => confirmUpdate(reg, 'pending')}
                      onViewProfile={() =>
                        navigation.navigate('UserProfile', {
                          userId: reg.user_id,
                        })
                      }
                    />
                    {i < filtered.length - 1 && <View style={s.divider} />}
                  </React.Fragment>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  mainCont: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
  },
  heroWrap: { width: '100%', height: 180 },
  heroImg: { width: '100%', height: '100%' },
  heroFb: {
    flex: 1,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 56 },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,10,0,0.3)',
  },
  backBtn: {
    position: 'absolute',
    top: 35,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(26,10,0,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: 35,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: '#FF6B35CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPill: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  heroPillTxt: {
    color: Colors.light.tertiaryText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  titleCard: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.light.primaryText,
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  datePill: {
    width: 46,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpDay: {
    color: Colors.light.tertiaryText,
    fontSize: 20,
    fontWeight: '900',
  },
  dpMon: {
    color: Colors.light.tertiaryText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateMain: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primaryText,
  },
  dateSub: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  capCard: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  capHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  capLbl: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primaryText,
  },
  capPct: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.pill,
  },
  secLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.secondaryText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  dRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  dIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dMain: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primaryText,
  },
  dSub: {
    fontSize: 12,
    color: Colors.light.secondaryText,
  },
  dMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  ftTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.secondarySurface,
  },
  ftText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.secondaryText,
  },
  ftBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  ftBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.secondaryText,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: Spacing.md,
  },
  emptyWrap: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTxt: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PageHeader from '../../components/PageHeader';
import Screen from '../../components/Screen';
import Colors from '../../constants/colors';

const IMAGE_BASE = 'http://10.0.2.2:8080';

// ── Types ──────────────────────────────────────────────────────────────────────
type Event = {
  id: string;
  title: string;
  location?: string;
  city?: string;
  event_start: string;
  event_end?: string;
  price: number;
  capacity?: number;
  image_url?: string;
  registrant_count?: number;
};

type Tab = 'upcoming' | 'past';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatEventDate(isoString: string) {
  const d = new Date(isoString);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  return { day, month, time, dayName };
}

function isUpcoming(isoString: string) {
  return new Date(isoString) >= new Date();
}

// ── Accent colors (deterministic per event title) ─────────────────────────────
const ACCENTS = ['#FF6B35', '#E63946', '#2EC4B6', '#FFBE0B', '#8338EC'];
function getAccent(title: string) {
  return ACCENTS[(title?.charCodeAt(0) ?? 0) % ACCENTS.length];
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ tab, onCreate }: { tab: Tab; onCreate: () => void }) {
  return (
    <View style={empty.wrap}>
      <View style={empty.iconWrap}>
        <AppText style={empty.emoji}>
          {tab === 'upcoming' ? '🗓️' : '📦'}
        </AppText>
      </View>
      <AppText style={empty.title}>
        {tab === 'upcoming' ? 'No upcoming events' : 'No past events yet'}
      </AppText>
      <AppText style={empty.sub}>
        {tab === 'upcoming'
          ? 'Host your first event and bring people together.'
          : 'Events youve hosted will appear here once theyre done.'}
      </AppText>
      {tab === 'upcoming' && (
        <TouchableOpacity
          style={empty.btn}
          onPress={onCreate}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <AppText style={empty.btnText}>Create Event</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const empty = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emoji: { fontSize: 36 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A0A00',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#8A7B6B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});

// ── Host Event Card ────────────────────────────────────────────────────────────
function HostEventCard({
  event,
  isPast,
  onPress,
  onEdit,
  onDelete,
}: {
  event: Event;
  isPast: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { day, month, time, dayName } = formatEventDate(event.event_start);
  const accent = getAccent(event.title);
  const registrants = event.registrant_count ?? 0;
  const capacity = event.capacity;
  const fillPercent = capacity
    ? Math.min((registrants / capacity) * 100, 100)
    : null;

  return (
    <TouchableOpacity
      style={[card.wrap, isPast && card.wrapPast]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={card.imageWrap}>
        {event.image_url ? (
          <Image
            source={{ uri: `${IMAGE_BASE}${event.image_url}` }}
            style={card.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[card.imagePlaceholder, { backgroundColor: accent + '22' }]}
          >
            <AppText style={card.placeholderEmoji}>🎉</AppText>
          </View>
        )}

        <View
          style={[
            card.statusPill,
            { backgroundColor: isPast ? '#8A7B6B' : accent },
          ]}
        >
          <AppText style={card.statusText}>
            {isPast ? 'ENDED' : 'UPCOMING'}
          </AppText>
        </View>
      </View>

      <View style={card.body}>
        <View style={card.topRow}>
          <View
            style={[
              card.dateBlock,
              { borderColor: isPast ? '#C4BAB0' : accent },
            ]}
          >
            <AppText
              style={[card.dateMonth, { color: isPast ? '#C4BAB0' : accent }]}
            >
              {month}
            </AppText>
            <AppText style={[card.dateDay, isPast && card.dateDayPast]}>
              {day}
            </AppText>
          </View>
          <View style={card.titleBlock}>
            <AppText
              style={[card.title, isPast && card.titlePast]}
              numberOfLines={2}
            >
              {event.title}
            </AppText>
            <AppText style={card.meta}>
              {dayName} · {time}
            </AppText>
          </View>
        </View>

        {(event.location || event.city) && (
          <View style={card.locationRow}>
            <Ionicons name="location-outline" size={12} color="#8A7B6B" />
            <AppText style={card.locationText} numberOfLines={1}>
              {event.location || event.city}
            </AppText>
          </View>
        )}

        <View style={card.statsRow}>
          <View style={card.registrantInfo}>
            <Ionicons
              name="people-outline"
              size={13}
              color={isPast ? '#8A7B6B' : accent}
            />
            <AppText
              style={[
                card.registrantText,
                { color: isPast ? '#8A7B6B' : '#1A0A00' },
              ]}
            >
              {registrants}
              {capacity ? ` / ${capacity}` : ''} registered
            </AppText>
          </View>
          <AppText
            style={[card.priceText, { color: isPast ? '#8A7B6B' : accent }]}
          >
            {event.price > 0 ? `₹${event.price}` : 'Free'}
          </AppText>
        </View>

        {fillPercent !== null && (
          <View style={card.barTrack}>
            <View
              style={[
                card.barFill,
                {
                  width: `${fillPercent}%` as any,
                  backgroundColor: isPast ? '#C4BAB0' : accent,
                },
              ]}
            />
          </View>
        )}

        {!isPast && (
          <View style={card.actions}>
            <TouchableOpacity
              style={card.actionBtn}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={14} color="#5C4F42" />
              <AppText style={card.actionBtnText}>Edit</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[card.actionBtn, card.actionBtnDanger]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="#E63946" />
              <AppText style={[card.actionBtnText, { color: '#E63946' }]}>
                Cancel
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  wrapPast: {
    borderColor: '#E5E0D8',
    shadowOpacity: 0.04,
  },

  // Image
  imageWrap: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 40 },
  statusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // Body
  body: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  dateBlock: {
    width: 48,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 5,
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A0A00',
    lineHeight: 24,
  },
  dateDayPast: {
    color: '#C4BAB0',
  },
  titleBlock: { flex: 1, paddingTop: 2 },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A0A00',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: 3,
  },
  titlePast: { color: '#8A7B6B' },
  meta: {
    fontSize: 12,
    color: '#8A7B6B',
    fontWeight: '500',
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#8A7B6B',
    fontWeight: '500',
    flex: 1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  registrantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  registrantText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
  },

  // Capacity bar
  barTrack: {
    height: 4,
    backgroundColor: '#F0EBE3',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
    paddingTop: 12,
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: '#F5F0E8',
  },
  actionBtnDanger: {
    backgroundColor: '#E6394610',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C4F42',
  },
});

function AddEventBtn() {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      style={styles.createBtn}
      onPress={() => navigation.navigate('CreateEvent')}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

export default function MyEventsScreen() {
  const navigation = useNavigation<any>();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('upcoming');

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const meRes = await api.get('/auth/me');
      const uid = meRes.data.id;

      const eventsRes = await api.get(`/events?host_user_id=${uid}&limit=50`);
      setEvents(eventsRes.data.events ?? []);
    } catch (err) {
      console.log('MY EVENTS ERROR', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = events.filter(e => isUpcoming(e.event_start));
  const pastEvents = events.filter(e => !isUpcoming(e.event_start));
  const displayedEvents = tab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleDelete = (event: Event) => {
    Alert.alert(
      'Cancel Event',
      `Cancel "${event.title}"? All registered attendees will be notified.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Event',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/events/${event.id}`);
              setEvents(prev => prev.filter(e => e.id !== event.id));
            } catch (err) {
              console.log('DELETE ERROR', err);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      <PageHeader
        title="My Events"
        subtitle={`${upcomingEvents.length} upcoming · ${pastEvents.length} past`}
        rightComponent={<AddEventBtn />}
      />

      <View style={styles.tabBar}>
        {(['upcoming', 'past'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <AppText
              variant="body"
              style={[styles.tabText, tab === t && styles.tabTextActive]}
            >
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </AppText>
            {t === 'upcoming' && upcomingEvents.length > 0 && (
              <View style={styles.tabBadge}>
                <AppText variant="small" style={styles.tabBadgeText}>
                  {upcomingEvents.length}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayedEvents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvents(true)}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              tab={tab}
              onCreate={() => navigation.navigate('CreateEvent')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <HostEventCard
            event={item}
            isPast={!isUpcoming(item.event_start)}
            onPress={() => navigation.navigate('EventDetails', { event: item })}
            onEdit={() => navigation.navigate('EditEvent', { event: item })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.secondarySurface,
    borderRadius: Radius.md,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  tabActive: {
    backgroundColor: Colors.light.tertiarySurface,
    ...Shadows.card,
  },
  tabText: {
    color: Colors.light.secondaryText,
  },
  tabTextActive: {
    fontWeight: '800',
    color: Colors.light.primaryText,
  },
  tabBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: Colors.light.tertiaryText,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 32,
  },
});

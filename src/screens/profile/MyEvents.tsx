import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
import HostEventCard from '../../components/HostEventCard';
import { Event } from '../../constants/types';
import { useToast } from '../../context/ToastContext';

type Tab = 'upcoming' | 'past';

function isUpcoming(isoString: string) {
  return new Date(isoString) >= new Date();
}

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

function AddEventBtn() {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      style={styles.createBtn}
      onPress={() => navigation.navigate('CreateEvent')}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={20} color={Colors.light.tertiaryText} />
    </TouchableOpacity>
  );
}

export default function MyEventsScreen() {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('upcoming');

  const fetchEvents = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const meRes = await api.get('/auth/me');
        const uid = meRes.data.id;

        const eventsRes = await api.get(`/events?host_user_id=${uid}&limit=50`);
        setEvents(eventsRes.data.events ?? []);
      } catch {
        showToast({
          type: 'error',
          message: 'Something went wrong while fetching events.',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast],
  );

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
            } catch {
              showToast({
                type: 'error',
                message: 'Something went wrong while deleting this event.',
              });
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
            onPress={() => {
              navigation.navigate('EventDashboard', { id: item.id });
            }}
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

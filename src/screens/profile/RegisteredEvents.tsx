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
import RegisteredEventCard from '../../components/RegisteredEventCard';
import { Event } from '../../constants/types';
import RatingModal from '../../components/RatingModal';

type Tab = 'upcoming' | 'past';

function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

function EmptyState({ tab }: { tab: Tab }) {
  const navigation = useNavigation<any>();
  return (
    <View style={empty.wrap}>
      <View style={empty.iconWrap}>
        <AppText style={empty.emoji}>
          {tab === 'upcoming' ? '🎟️' : '🗃️'}
        </AppText>
      </View>
      <AppText style={empty.title}>
        {tab === 'upcoming' ? 'No upcoming registrations' : 'No past events'}
      </AppText>
      <AppText style={empty.sub}>
        {tab === 'upcoming'
          ? 'Browse events and register to see them here.'
          : 'Events youve attended will appear here.'}
      </AppText>
      {tab === 'upcoming' && (
        <TouchableOpacity
          style={empty.btn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={16} color="#fff" />
          <AppText style={empty.btnText}>Explore Events</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const empty = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emoji: { fontSize: 36 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primaryText,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    textAlign: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginVertical: Spacing.md,
  },
  btnText: {
    color: Colors.light.tertiaryText,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default function RegisteredEventsScreen() {
  const navigation = useNavigation<any>();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [ratingEvent, setRatingEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/events/registered');
      setEvents(res.data.events ?? []);
    } catch (err) {
      console.log('REGISTERED EVENTS ERROR', err);
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

  const handleLeave = (event: Event) => {
    Alert.alert(
      'Cancel Registration',
      `Are you sure you want to cancel your spot at "${event.title}"?`,
      [
        { text: 'Keep my spot', style: 'cancel' },
        {
          text: 'Cancel Registration',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/events/${event.id}/leave`);
              setEvents(prev => prev.filter(e => e.id !== event.id));
            } catch (err) {
              console.log('LEAVE ERROR', err);
            }
          },
        },
      ],
    );
  };

  const handleRatingSubmitted = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, has_rated: true } : e)),
    );
    setRatingEvent(null);
  };

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      <PageHeader
        title="Registered Events"
        subtitle={`${upcomingEvents.length} upcoming · ${pastEvents.length} past`}
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
        ListEmptyComponent={!loading ? <EmptyState tab={tab} /> : null}
        renderItem={({ item }) => (
          <RegisteredEventCard
            event={item}
            isPast={!isUpcoming(item.event_start)}
            onPress={() => navigation.navigate('EventDetails', { event: item })}
            onLeave={() => handleLeave(item)}
            onRate={() => setRatingEvent(item)}
          />
        )}
      />
      {ratingEvent && (
        <RatingModal
          visible={!!ratingEvent}
          event={{
            id: ratingEvent.id,
            title: ratingEvent.title,
            image_url: ratingEvent.image_url,
            host_user_id: ratingEvent.id ?? '',
          }}
          onClose={() => setRatingEvent(null)}
          onSubmitted={() => handleRatingSubmitted(ratingEvent.id)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: Spacing.xs - 2,
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

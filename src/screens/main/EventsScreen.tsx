import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import api from '../../api/client';
import EventCard from '../../components/EventCard';
import Colors from '../../constants/colors';

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.events);
    } catch (err) {
      console.log('EVENT FETCH ERROR', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </Screen>
    );
  }

  if (!events.length) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <AppText variant="subtitle">No events near you</AppText>
        <AppText variant="caption">Be the first to create one ✨</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      />
    </Screen>
  );
}

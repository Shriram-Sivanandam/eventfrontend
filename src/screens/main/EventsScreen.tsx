import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import api from '../../api/client';
import EventCard from '../../components/EventCard';
import Colors from '../../constants/colors';
import AppInput from '../../components/AppInput';
import { Radius, Spacing } from '../../constants/layout';
import { useNavigation } from '@react-navigation/native';

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const navigation = useNavigation<any>();

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
      <Screen style={styles.loadingCont}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </Screen>
    );
  }

  if (!events.length) {
    return (
      <Screen style={styles.noEventsCont}>
        <AppText variant="subtitle">No events near you</AppText>
        <AppText variant="caption">Be the first to create one ✨</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search for your favourite events"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.searchCont}
      />
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <EventCard event={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <AppText variant="title" style={styles.addBtn}>
          ＋
        </AppText>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCont: {
    marginBottom: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    backgroundColor: Colors.light.primary,
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  addBtn: {
    color: Colors.light.surface,
  },
});

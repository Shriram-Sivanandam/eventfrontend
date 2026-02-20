import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import Colors from '../../constants/colors';
import { useRoute } from '@react-navigation/native';

export default function EventDetailsScreen() {
  const route = useRoute<any>();
  const { event } = route.params;

  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const joinEvent = async () => {
    try {
      setLoading(true);
      await api.post(`/events/${event.id}/join`);
      setJoined(true);
    } catch (err) {
      console.log('JOIN ERROR', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppText variant="title">{event.title}</AppText>

      {event.description && (
        <AppText style={styles.section}>{event.description}</AppText>
      )}

      <AppText style={styles.section}>{event.location || 'TBA'}</AppText>

      <AppText style={styles.section}>
        {new Date(event.event_start).toLocaleString()}
      </AppText>

      <AppText style={styles.section}>
        {event.price > 0 ? `₹${event.price}` : 'Free'}
      </AppText>

      <AppText style={styles.section}>
        Capacity: {event.capacity || 'Unlimited'}
      </AppText>

      {joined ? (
        <AppText style={{ marginTop: 20, color: Colors.light.primary }}>
          You’re registered
        </AppText>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <AppButton title="Register" onPress={joinEvent} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
});

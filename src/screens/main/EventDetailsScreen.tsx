import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import Colors from '../../constants/colors';
import { useRoute } from '@react-navigation/native';
import { Spacing } from '../../constants/layout';

export default function EventDetailsScreen() {
  const route = useRoute<any>();
  const { event } = route.params;

  const startDate = new Date(event.event_start);
  const day = startDate.getDate();
  const dayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' });
  const time = startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const month = startDate
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

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
      <AppText variant="caption" color={Colors.light.secondaryText}>
        {dayShort}, {day} {month}, {time}
      </AppText>

      <AppText style={styles.section}>{event.location || 'TBA'}</AppText>

      <View style={styles.section}>
        <AppText variant="subtitle">About this event</AppText>
        {event.description && (
          <AppText variant="caption">{event.description}</AppText>
        )}
      </View>

      <AppText style={styles.section}>
        Capacity: {event.capacity || 'Unlimited'}
      </AppText>

      <View style={styles.bottomCont}>
        <View style={styles.bottomCentCont}>
          <AppText variant="subtitle" style={styles.costText}>
            {event.price > 0 ? `₹${event.price}` : 'Free'}
            {event.price > 0 && (
              <AppText variant="caption" style={styles.perPersonText}>
                /person
              </AppText>
            )}
          </AppText>

          {joined ? (
            <AppText variant="subtitle">You’re registered</AppText>
          ) : loading ? (
            <ActivityIndicator />
          ) : (
            <AppButton
              title="Register"
              onPress={joinEvent}
              style={styles.regBtn}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.xl,
  },
  bottomCont: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
  },
  bottomCentCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    flex: 1,
    fontWeight: 'bold',
  },
  perPersonText: {
    fontWeight: 'light',
  },
  regBtn: {
    flex: 1,
  },
});

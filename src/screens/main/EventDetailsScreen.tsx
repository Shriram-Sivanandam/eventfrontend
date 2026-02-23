import React, { useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
  Pressable,
} from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import Colors from '../../constants/colors';
import { useRoute } from '@react-navigation/native';
import { Radius, Shadows, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  const IMAGE_BASE = 'http://10.0.2.2:8080';

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
    <View style={styles.mainCont}>
      {event.image_url && (
        <Image
          source={{ uri: `${IMAGE_BASE}${event.image_url}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Screen>
        <AppText variant="title">{event.title}</AppText>
        <AppText variant="caption" color={Colors.light.secondaryText}>
          {dayShort}, {day} {month}, {time}
        </AppText>

        <Pressable style={styles.locationCont}>
          <View style={styles.locationLeftCont}>
            <Ionicons
              name="location-outline"
              size={23}
              color={Colors.light.primaryText}
            />
            <AppText variant="body" style={styles.locationText}>
              {event.location || 'TBA'}
            </AppText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={25}
            color={Colors.light.primaryText}
          />
        </Pressable>

        <View style={styles.section}>
          <AppText variant="subtitle" fontWeight="bold">
            About this event
          </AppText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.xl,
  },
  locationCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    ...Shadows.card,
  },
  locationLeftCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: Spacing.md,
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
  image: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
});

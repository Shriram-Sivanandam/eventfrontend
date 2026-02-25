import React from 'react';
import { StyleSheet, Pressable, Image, View } from 'react-native';
import AppText from './AppText';
import Colors from '../constants/colors';
import { Spacing, Radius, Shadows } from '../constants/layout';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function EventCard({ event }: any) {
  const navigation = useNavigation<any>();
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

  const IMAGE_BASE = 'http://10.0.2.2:8080';

  return (
    <Pressable
      onPress={() => navigation.navigate('EventDetails', { event })}
      style={styles.mainCont}
    >
      {event.image_url && (
        <Image
          source={{ uri: `${IMAGE_BASE}${event.image_url}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.infoCont}>
        <AppText
          variant="subtitle"
          fontWeight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          {event.title}
        </AppText>
        <View style={styles.iconCont}>
          <Ionicons
            name="calendar-clear-outline"
            size={17}
            color={Colors.light.primaryText}
            style={styles.icon}
          />
          <AppText variant="caption" color={Colors.light.secondaryText}>
            {dayShort}, {day} {month}, {time}
          </AppText>
        </View>
        <View style={styles.iconCont}>
          <Ionicons
            name="location-outline"
            size={17}
            color={Colors.light.primaryText}
            style={styles.icon}
          />
          <AppText variant="caption" color={Colors.light.secondaryText}>
            {event.location}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    backgroundColor: Colors.light.secondarySurface,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  title: {
    marginVertical: Spacing.sm,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
  },
  infoCont: {
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  iconCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.sm,
  },
});

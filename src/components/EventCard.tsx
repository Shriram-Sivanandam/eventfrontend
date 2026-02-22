import React from 'react';
import { StyleSheet, Pressable, Image, View } from 'react-native';
import AppText from './AppText';
import Colors from '../constants/colors';
import { Spacing, Radius, Shadows } from '../constants/layout';
import { useNavigation } from '@react-navigation/native';

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
        <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
          {event.title}
        </AppText>
        <AppText variant="caption" color={Colors.light.secondaryText}>
          {dayShort}, {day} {month}, {time}
        </AppText>
        <AppText variant="caption" color={Colors.light.secondaryText}>
          {event.location}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadows.card,
  },
  dateContainer: {
    width: 65,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  monthText: {
    fontWeight: '700',
    color: '#EF4444',
  },
  dayText: {
    fontWeight: '800',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  badgeText: {
    color: '#0369A1',
    fontWeight: '600',
  },
  priceBadge: {
    backgroundColor: '#DCFCE7',
    opacity: 0.6,
  },
  priceText: {
    color: Colors.light.success,
    fontWeight: '700',
  },
  freeBadge: {
    backgroundColor: '#FEF3C7',
  },
  freeText: {
    color: '#B45309',
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
  },
  infoCont: {
    padding: Spacing.sm,
  },
});

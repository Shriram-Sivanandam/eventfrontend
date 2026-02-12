import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import Colors from '../constants/colors';
import { Spacing, Radius, Shadows } from '../constants/layout';

export default function EventCard({ event }: any) {
  const startDate = new Date(event.event_start);
  const day = startDate.getDate();
  const month = startDate
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.dateContainer}>
        <AppText variant="subtitle" style={styles.monthText}>
          {month}
        </AppText>
        <AppText variant="title" style={styles.dayText}>
          {day}
        </AppText>
      </View>

      <View style={styles.content}>
        <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
          {event.title}
        </AppText>

        <View style={styles.infoRow}>
          {event.location && (
            <View style={styles.badge}>
              <AppText variant="caption" style={styles.badgeText}>
                {event.location}
              </AppText>
            </View>
          )}

          {event.price > 0 ? (
            <View style={[styles.badge, styles.priceBadge]}>
              <AppText variant="caption" style={styles.priceText}>
                ₹{event.price}
              </AppText>
            </View>
          ) : (
            <View style={[styles.badge, styles.freeBadge]}>
              <AppText variant="caption" style={styles.freeText}>
                FREE
              </AppText>
            </View>
          )}
        </View>

        <AppText variant="caption" color={Colors.light.secondaryText}>
          {startDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
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
    marginBottom: 6,
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
});

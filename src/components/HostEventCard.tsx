import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Radius, Shadows, Spacing } from '../constants/layout';
import Colors from '../constants/colors';
import AppText from './AppText';
import { Event } from '../constants/types';

function formatEventDate(isoString: string) {
  const d = new Date(isoString);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  return { day, month, time, dayName };
}

const ACCENTS = ['#FF6B35', '#E63946', '#2EC4B6', '#FFBE0B', '#8338EC'];
function getAccent(title: string) {
  return ACCENTS[(title?.charCodeAt(0) ?? 0) % ACCENTS.length];
}

export default function HostEventCard({
  event,
  isPast,
  onPress,
  onEdit,
  onDelete,
}: {
  event: Event;
  isPast: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { day, month, time, dayName } = formatEventDate(event.event_start);
  const accent = getAccent(event.title);
  const registrants = event.registrant_count ?? 0;
  const capacity = event.capacity;
  const fillPercent = capacity
    ? Math.min((registrants / capacity) * 100, 100)
    : null;

  return (
    <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.92}>
      <View style={card.imageWrap}>
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={card.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[card.imagePlaceholder, { backgroundColor: accent + '22' }]}
          >
            <AppText style={card.placeholderEmoji}>🎉</AppText>
          </View>
        )}

        <View
          style={[
            card.statusPill,
            { backgroundColor: isPast ? '#8A7B6B' : accent },
          ]}
        >
          <AppText style={card.statusText}>
            {isPast ? 'ENDED' : 'UPCOMING'}
          </AppText>
        </View>
      </View>

      <View style={card.body}>
        <View style={card.topRow}>
          <View
            style={[
              card.dateBlock,
              { borderColor: isPast ? '#C4BAB0' : accent },
            ]}
          >
            <AppText
              style={[card.dateMonth, { color: isPast ? '#C4BAB0' : accent }]}
            >
              {month}
            </AppText>
            <AppText style={[card.dateDay, isPast && card.dateDayPast]}>
              {day}
            </AppText>
          </View>
          <View style={card.titleBlock}>
            <AppText
              style={[card.title, isPast && card.titlePast]}
              numberOfLines={2}
            >
              {event.title}
            </AppText>
            <AppText style={card.meta}>
              {dayName} · {time}
            </AppText>
          </View>
        </View>

        {(event.location || event.city) && (
          <View style={card.locationRow}>
            <Ionicons name="location-outline" size={12} color="#8A7B6B" />
            <AppText style={card.locationText} numberOfLines={1}>
              {event.location || event.city}
            </AppText>
          </View>
        )}

        <View style={card.statsRow}>
          <View style={card.registrantInfo}>
            <Ionicons
              name="people-outline"
              size={13}
              color={isPast ? '#8A7B6B' : accent}
            />
            <AppText
              style={[
                card.registrantText,
                { color: isPast ? '#8A7B6B' : '#1A0A00' },
              ]}
            >
              {registrants}
              {capacity ? ` / ${capacity}` : ''} registered
            </AppText>
          </View>
          <AppText
            style={[card.priceText, { color: isPast ? '#8A7B6B' : accent }]}
          >
            {event.price > 0 ? `₹${event.price}` : 'Free'}
          </AppText>
        </View>

        {fillPercent !== null && (
          <View style={card.barTrack}>
            <View
              style={[
                card.barFill,
                {
                  width: `${fillPercent}%` as any,
                  backgroundColor: isPast ? '#C4BAB0' : accent,
                },
              ]}
            />
          </View>
        )}

        {!isPast && (
          <View style={card.actions}>
            <TouchableOpacity
              style={card.actionBtn}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={14} color="#5C4F42" />
              <AppText style={card.actionBtnText}>Edit</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[card.actionBtn, card.actionBtnDanger]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="#E63946" />
              <AppText style={[card.actionBtnText, card.cancelBtnText]}>
                Cancel
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  imageWrap: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 40 },
  statusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  statusText: {
    color: Colors.light.tertiaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  body: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  dateBlock: {
    width: 48,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  dateDayPast: {
    color: Colors.light.secondaryText,
  },
  titleBlock: { flex: 1, paddingTop: Spacing.xs },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primaryText,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  titlePast: { color: Colors.light.secondaryText },
  meta: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  registrantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  registrantText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
  },
  barTrack: {
    height: 5,
    backgroundColor: Colors.light.border,
    borderRadius: Radius.md,
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.border,
  },
  actionBtnDanger: {
    backgroundColor: '#E6394610',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.secondaryText,
  },
  cancelBtnText: {
    color: Colors.light.danger,
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppText from './AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';
import { Radius, Shadows, Spacing } from '../constants/layout';
import { Event } from '../constants/types';

const IMAGE_BASE = 'http://10.0.2.2:8080';

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fullDate: d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

function formatDuration(mins?: number) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const ACCENTS = ['#FF6B35', '#E63946', '#2EC4B6', '#FFBE0B', '#8338EC'];
function getAccent(title: string) {
  return ACCENTS[(title?.charCodeAt(0) ?? 0) % ACCENTS.length];
}

function CountdownLabel({ iso }: { iso: string }) {
  const now = new Date();
  const event = new Date(iso);
  const diffMs = event.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  let label = '';
  let urgent = false;

  if (diffDays === 0 && diffHours <= 0) {
    label = 'Happening now';
    urgent = true;
  } else if (diffDays === 0) {
    label = `In ${diffHours}h`;
    urgent = true;
  } else if (diffDays === 1) {
    label = 'Tomorrow';
  } else if (diffDays <= 7 && diffDays > 1) {
    label = `In ${diffDays} days`;
  } else {
    return null;
  }

  return (
    <View style={[cd.pill, urgent && cd.pillUrgent]}>
      <Ionicons
        name="time-outline"
        size={11}
        color={urgent ? '#fff' : '#FF6B35'}
      />
      <AppText style={[cd.text, urgent && cd.textUrgent]}>{label}</AppText>
    </View>
  );
}

const cd = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B3515',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  pillUrgent: {
    backgroundColor: '#FF6B35',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
  },
  textUrgent: {
    color: '#fff',
  },
});

export default function RegisteredEventCard({
  event,
  isPast,
  isBottomRow = true,
  onPress,
  onLeave,
}: {
  event: Event;
  isPast: boolean;
  isBottomRow?: boolean;
  onPress: () => void;
  onLeave?: () => void;
}) {
  const { time, fullDate } = formatDate(event.event_start);
  const accent = getAccent(event.title);
  const duration = formatDuration(event.duration_minutes);

  return (
    <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.92}>
      <View
        style={[card.strip, { backgroundColor: isPast ? '#C4BAB0' : accent }]}
      />

      <View style={card.inner}>
        <View>
          <View style={card.thumbWrap}>
            {event.image_url ? (
              <Image
                source={{ uri: `${IMAGE_BASE}${event.image_url}` }}
                style={card.thumb}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  card.thumbPlaceholder,
                  { backgroundColor: accent + '20' },
                ]}
              >
                <AppText style={card.thumbEmoji}>🎉</AppText>
              </View>
            )}

            {isPast && <View style={card.thumbOverlay} />}
          </View>
          {!isPast && <CountdownLabel iso={event.event_start} />}
        </View>

        <View style={card.content}>
          <View style={card.info}>
            <AppText
              style={[card.title, isPast && card.titlePast]}
              numberOfLines={2}
            >
              {event.title}
            </AppText>

            <View style={card.metaRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={Colors.light.secondaryText}
              />
              <AppText style={card.metaText}>{fullDate}</AppText>
            </View>

            <View style={card.metaRow}>
              <Ionicons
                name="time-outline"
                size={12}
                color={Colors.light.secondaryText}
              />
              <AppText style={card.metaText}>
                {time}
                {duration ? ` · ${duration}` : ''}
              </AppText>
            </View>

            {/* Location */}
            {(event.location || event.city) && (
              <View style={card.metaRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={Colors.light.secondaryText}
                />
                <AppText style={card.metaText} numberOfLines={1}>
                  {event.location || event.city}
                </AppText>
              </View>
            )}
          </View>

          {isBottomRow && (
            <View style={card.bottomRow}>
              <View
                style={[
                  card.pricePill,
                  { backgroundColor: isPast ? '#F0EBE3' : accent + '18' },
                ]}
              >
                <AppText
                  style={[
                    card.priceText,
                    { color: isPast ? '#8A7B6B' : accent },
                  ]}
                >
                  {event.price > 0 ? `₹${event.price}` : 'Free'}
                </AppText>
              </View>

              {!isPast && (
                <TouchableOpacity
                  style={card.leaveBtn}
                  onPress={onLeave}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={13}
                    color={Colors.light.danger}
                  />
                  <AppText style={card.leaveBtnText}>Cancel</AppText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    ...Shadows.card,
  },
  strip: {
    width: 4,
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 28 },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,253,248,0.5)',
  },
  content: {
    flex: 1,
  },
  info: {
    height: 80,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primaryText,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  titlePast: {
    color: Colors.light.secondaryText,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  pricePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#E6394612',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  leaveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.danger,
  },
});

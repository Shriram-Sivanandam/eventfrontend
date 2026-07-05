import React, { useRef } from 'react';
import { StyleSheet, Pressable, Image, View, Animated } from 'react-native';
import AppText from './AppText';
import { Radius, Shadows, Spacing } from '../constants/layout';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const ACCENTS = ['#FF6B35', '#E63946', '#2EC4B6', '#FFBE0B', '#8338EC'];
function accentFor(title: string) {
  return ACCENTS[(title?.charCodeAt(0) ?? 0) % ACCENTS.length];
}

export default function EventCard({ event }: any) {
  const navigation = useNavigation<any>();
  const scale = useRef(new Animated.Value(1)).current;

  const startDate = new Date(event.event_start);
  const day = startDate.getDate();
  const dayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' });
  const month = startDate
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();
  const time = startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const accent = accentFor(event.title);
  const isFree = !event.price || event.price === 0;
  const tags = event.tags ?? [];

  const registrantCount = event.registrant_count ?? 0;
  const capacity = event.capacity;
  const spotsLeft = capacity ? capacity - registrantCount : null;
  const isAlmostFull =
    spotsLeft !== null &&
    spotsLeft <= Math.max(1, Math.ceil((capacity ?? 0) * 0.2));

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => navigation.navigate('EventDetails', { event })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        <View style={styles.imageWrap}>
          {event.image_url ? (
            <Image
              source={{ uri: event.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: accent + '20' },
              ]}
            >
              <AppText style={styles.placeholderEmoji}>🎉</AppText>
            </View>
          )}

          {isAlmostFull && (
            <View style={styles.urgencyBadge}>
              <Ionicons
                name="flame"
                size={10}
                color={Colors.light.tertiaryText}
              />
              <AppText style={styles.urgencyText}>
                {spotsLeft === 1 ? '1 spot left' : `${spotsLeft} spots left`}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.dateBlock, { borderColor: accent }]}>
              <AppText style={[styles.dateMonth, { color: accent }]}>
                {month}
              </AppText>
              <AppText style={styles.dateDay}>{day}</AppText>
            </View>

            <View style={styles.titleBlock}>
              <AppText style={styles.title} numberOfLines={2}>
                {event.title}
              </AppText>
              <View style={styles.metaRow}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={Colors.light.secondaryText}
                />
                <AppText style={styles.metaText}>
                  {dayShort} · {time}
                </AppText>
              </View>
            </View>
            <View
              style={[
                styles.priceBadge,
                isFree && styles.priceBadgeFree,
                !isFree && { backgroundColor: accent },
              ]}
            >
              <AppText style={styles.priceBadgeText}>
                {isFree ? 'Free' : `₹${event.price}`}
              </AppText>
            </View>
          </View>

          {event.location ? (
            <View style={styles.metaRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={Colors.light.secondaryText}
              />
              <AppText style={styles.metaText} numberOfLines={1}>
                {event.location}
              </AppText>
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: accent + '25' }]} />

          <View style={styles.footer}>
            <View style={styles.tagsRow}>
              {tags.slice(0, 3).map((tag: any) => (
                <View key={tag.id} style={styles.tagPill}>
                  <AppText style={styles.tagText}>{tag.name}</AppText>
                </View>
              ))}
              {tags.length > 3 && (
                <AppText style={styles.tagOverflow}>+{tags.length - 2}</AppText>
              )}
            </View>

            <View style={styles.registrantRow}>
              <Ionicons name="people-outline" size={12} color="#8A7B6B" />
              <AppText style={styles.registrantText}>{registrantCount}</AppText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.light.secondarySurface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  imageWrap: {
    height: 175,
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
  placeholderEmoji: { fontSize: 44 },
  priceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  priceBadgeFree: {
    backgroundColor: '#2EC4B6',
  },
  priceBadgeText: {
    color: Colors.light.tertiaryText,
    fontSize: 12,
    fontWeight: '800',
  },
  urgencyBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.light.danger,
    borderWidth: 1,
    borderColor: Colors.light.primaryText,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  urgencyText: {
    color: Colors.light.tertiaryText,
    fontSize: 10,
    fontWeight: '800',
  },
  body: {
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dateBlock: {
    width: 46,
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
  titleBlock: { flex: 1, paddingTop: 1 },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primaryText,
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  tagPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: Colors.light.primaryText },
  tagOverflow: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.secondaryText,
  },
  registrantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  registrantText: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    fontWeight: '600',
  },
});

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Screen from '../../components/Screen';
import AppText from '../../components/AppText';
import InfoRow from '../../components/InfoRow';
import Chip from '../../components/Chip';
import api from '../../api/client';
import Colors from '../../constants/colors';
import { useRoute } from '@react-navigation/native';
import { Radius, Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import HostedByCard from '../../components/HostedbyCard';
import { useToast } from '../../context/ToastContext';

function formatDuration(minutes: number) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function EventDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [event, setEvent] = useState(route.params.event);

  const { showToast } = useToast();
  const startDate = new Date(event.event_start);
  const day = startDate.getDate();
  const dayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' });
  const month = startDate.toLocaleString('en-US', { month: 'long' });
  const monthShort = startDate
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();
  const year = startDate.getFullYear();
  const time = startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const addressParts = [event.street, event.city, event.pincode].filter(
    Boolean,
  );
  const fullAddress = addressParts.join(', ');

  const duration = formatDuration(event.duration_minutes);

  const thingsToBring: string[] = event.things_to_bring
    ? event.things_to_bring.split(',').filter(Boolean)
    : [];
  const thingsProvided: string[] = event.things_provided
    ? event.things_provided.split(',').filter(Boolean)
    : [];
  const tags = route.params.event.tags ?? [];

  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(event.joined);

  const IMAGE_BASE = 'http://10.0.2.2:8080';

  useEffect(() => {
    api
      .get(`/events/${route.params.event.id}`)
      .then(res => setEvent(res.data))
      .catch(err => console.log('EVENT DETAIL ERROR', err));
  }, [route.params.event.id]);

  const openMaps = () => {
    if (event.maps_link) {
      Linking.openURL(event.maps_link);
    }
  };

  const joinEvent = async () => {
    try {
      setLoading(true);
      await api.post(`/events/${event.id}/join`);
      showToast({ type: 'success', message: 'Done!' });
      setJoined(true);
    } catch (err) {
      console.log('JOIN ERROR', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainCont}>
      <View style={styles.heroWrap}>
        {event.image_url ? (
          <Image
            source={{ uri: `${IMAGE_BASE}${event.image_url}` }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <AppText style={styles.heroEmoji}>🎉</AppText>
          </View>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={Colors.light.tertiaryText}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.titleCard}>
        <AppText variant="title" style={styles.eventTitle}>
          {event.title}
        </AppText>
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
        <View style={styles.dateRow}>
          <View style={styles.datePill}>
            <AppText
              variant="subtitle"
              fontWeight="bold"
              style={styles.datePillDay}
            >
              {day}
            </AppText>
            <AppText variant="caption" color={Colors.light.tertiaryText}>
              {monthShort}
            </AppText>
          </View>
          <View>
            <AppText fontWeight="600">
              {dayShort}, {month} {day}, {year}
            </AppText>
            <AppText
              variant="body"
              color={Colors.light.secondaryText}
              style={styles.dateSubText}
            >
              {time}
              {event.duration ? `  ·  ${event.duration}` : ''}
            </AppText>
          </View>
        </View>
      </View>

      <Screen>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>LOCATION</AppText>
            <InfoRow
              icon="location"
              onPress={event.maps_link ? openMaps : undefined}
              accent="#FF6B35"
              shadow
            >
              <AppText
                variant="body"
                fontWeight="bold"
                style={styles.infoMainText}
              >
                {event.location || 'TBA'}
              </AppText>
              {fullAddress ? (
                <AppText variant="caption" style={styles.infoSubText}>
                  {fullAddress}
                </AppText>
              ) : null}
              {event.maps_link ? (
                <AppText variant="caption" style={styles.mapLink}>
                  Open in Maps →
                </AppText>
              ) : null}
            </InfoRow>
          </View>

          {event.description ? (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>ABOUT THIS EVENT</AppText>
              <AppText variant="body" color={Colors.light.primaryText}>
                {event.description}
              </AppText>
            </View>
          ) : null}

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>EVENT INFO</AppText>
            <View style={styles.infoGrid}>
              {event.capacity && (
                <InfoRow
                  icon="people-outline"
                  accent={Colors.light.success}
                  shadow
                >
                  <AppText
                    variant="body"
                    fontWeight="bold"
                    style={styles.infoMainText}
                  >
                    {event.capacity} spots
                  </AppText>
                  <AppText variant="caption" style={styles.infoSubText}>
                    Capacity
                  </AppText>
                </InfoRow>
              )}
              {duration && (
                <InfoRow
                  icon="time-outline"
                  accent={Colors.light.secondary}
                  shadow
                >
                  <AppText
                    variant="body"
                    fontWeight="bold"
                    style={styles.infoMainText}
                  >
                    {duration}
                  </AppText>
                  <AppText variant="caption" style={styles.infoSubText}>
                    Duration
                  </AppText>
                </InfoRow>
              )}
            </View>
          </View>

          {thingsToBring.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>WHAT TO BRING</AppText>
              <View style={styles.chipRow}>
                {thingsToBring.map((item, i) => (
                  <Chip key={i} label={item} />
                ))}
              </View>
            </View>
          )}

          {thingsProvided.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>WHAT'S PROVIDED</AppText>
              <View style={styles.chipRow}>
                {thingsProvided.map((item, i) => (
                  <Chip key={i} label={item} />
                ))}
              </View>
            </View>
          )}

          <HostedByCard
            hostUserId={event.host_user_id}
            hostName={event.host_name}
            hostAvatarUrl={event.host_avatar}
            hostingRating={event.host_rating}
            totalHosted={event.host_total_hosted}
          />

          <View style={styles.bottomSpace} />
        </ScrollView>

        <View style={styles.stickyFooter}>
          <View style={styles.footerPriceBlock}>
            <AppText style={styles.footerPrice}>
              {event.price > 0 ? `₹${event.price}` : 'Free'}
            </AppText>
            {event.price > 0 && (
              <AppText style={styles.footerPriceSub}>per person</AppText>
            )}
          </View>

          {joined ? (
            <View style={styles.registeredBadge}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.light.primary}
              />
              <AppText style={styles.registeredText}>You're in!</AppText>
            </View>
          ) : loading ? (
            <View style={styles.regBtn}>
              <ActivityIndicator color={Colors.light.tertiaryText} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.regBtn}
              onPress={joinEvent}
              activeOpacity={0.85}
            >
              <AppText style={styles.regBtnText}>Register Now</AppText>
            </TouchableOpacity>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
  },
  heroWrap: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  backBtn: {
    position: 'absolute',
    top: 35,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(26,10,0,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCard: {
    backgroundColor: Colors.light.tertiarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8DF',
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: Radius.md,
    elevation: 3,
    zIndex: 10,
  },
  eventTitle: {
    letterSpacing: -0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  datePill: {
    width: 46,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillDay: {
    color: Colors.light.tertiaryText,
  },
  dateSubText: {
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.light.secondaryText,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  infoMainText: {
    color: Colors.light.primaryText,
  },
  infoSubText: {
    color: Colors.light.secondaryText,
    marginTop: Spacing.xs,
  },
  mapLink: {
    color: Colors.light.primary,
    marginTop: Spacing.sm,
  },
  infoGrid: {
    gap: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  bottomSpace: {
    height: 50,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1.5,
    borderTopColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  footerPriceBlock: {
    flex: 1,
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  footerPriceSub: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
  regBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regBtnText: {
    color: Colors.light.tertiaryText,
    fontWeight: '800',
    fontSize: 15,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  registeredText: {
    color: Colors.light.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primaryText,
  },
  tagOverflow: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.secondaryText,
  },
});

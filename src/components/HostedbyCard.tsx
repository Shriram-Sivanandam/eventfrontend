import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppText from './AppText';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Spacing } from '../constants/layout';

type Props = {
  hostUserId: string;
  hostName?: string;
  hostAvatarUrl?: string;
  hostingRating?: number;
  totalHosted?: number;
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

const AVATAR_COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
function avatarColor(id: string) {
  return AVATAR_COLORS[id?.charCodeAt(0) % AVATAR_COLORS.length];
}

function StarRating({ score }: { score: number }) {
  return (
    <View style={star.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(score) ? 'star' : 'star-outline'}
          size={11}
          color={i <= Math.round(score) ? '#FFBE0B' : '#C4BAB0'}
        />
      ))}
      <AppText style={star.label}>{score.toFixed(1)}</AppText>
    </View>
  );
}
const star = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  label: { fontSize: 11, fontWeight: '700', color: '#5C4F42', marginLeft: 4 },
});

export default function HostedByCard({
  hostUserId,
  hostName,
  hostAvatarUrl,
  hostingRating,
  totalHosted,
}: Props) {
  const navigation = useNavigation<any>();
  const avatarUri = hostAvatarUrl ? hostAvatarUrl : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('HostProfile', {
          hostId: hostUserId,
          profileType: 'host',
        })
      }
      activeOpacity={0.85}
    >
      {/* Label */}
      <AppText style={styles.cardLabel}>Hosted by</AppText>

      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: avatarColor(hostUserId) },
              ]}
            >
              <AppText style={styles.avatarInitials}>
                {getInitials(hostName)}
              </AppText>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <AppText style={styles.name}>{hostName || 'Anonymous Host'}</AppText>
          <View style={styles.metaRow}>
            {hostingRating != null && <StarRating score={hostingRating} />}
            {totalHosted != null && (
              <View style={styles.hostedPill}>
                <Ionicons name="calendar-outline" size={10} color="#8A7B6B" />
                <AppText style={styles.hostedText}>
                  {totalHosted} events
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrowWrap}>
          <Ionicons name="chevron-forward" size={16} color="#C4BAB0" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C4BAB0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A0A00',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hostedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hostedText: {
    fontSize: 11,
    color: '#8A7B6B',
    fontWeight: '600',
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

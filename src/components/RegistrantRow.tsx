import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import AppText from './AppText';
import { Radius, Spacing } from '../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';
import { Registrant, RegistrantStatus } from '../constants/types';

function getInitials(name?: string, email?: string) {
  const src = name || email || '?';
  return src
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('');
}

const STATUS_META = {
  pending: { color: '#FFBE0B', bg: '#FFBE0B18', label: 'Pending' },
  accepted: { color: '#2EC4B6', bg: '#2EC4B618', label: 'Accepted' },
  rejected: { color: '#E63946', bg: '#E6394618', label: 'Rejected' },
};

function StatusBadge({ status }: { status: RegistrantStatus }) {
  const m = STATUS_META[status];
  return (
    <View style={[bs.wrap, { backgroundColor: m.bg }]}>
      <View style={[bs.dot, { backgroundColor: m.color }]} />
      <AppText style={[bs.text, { color: m.color }]}>{m.label}</AppText>
    </View>
  );
}

const bs = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700' },
});

export default function RegistrantRow({
  reg,
  onAccept,
  onReject,
  onPending,
  onViewProfile,
  updating,
}: {
  reg: Registrant;
  onAccept: () => void;
  onReject: () => void;
  onPending: () => void;
  onViewProfile: () => void;
  updating: boolean;
}) {
  return (
    <View style={rr.wrap}>
      <TouchableOpacity
        style={rr.left}
        onPress={onViewProfile}
        activeOpacity={0.8}
      >
        <View style={rr.av}>
          {reg.avatar_url ? (
            <Image source={{ uri: reg.avatar_url }} style={rr.avImg} />
          ) : (
            <View style={rr.avFb}>
              <AppText style={rr.ini}>
                {getInitials(reg.name, reg.email)}
              </AppText>
            </View>
          )}
        </View>
        <View style={rr.info}>
          <AppText style={rr.name} numberOfLines={1}>
            {reg.name || reg.email}
          </AppText>
          {reg.name && (
            <AppText style={rr.email} numberOfLines={1}>
              {reg.email}
            </AppText>
          )}
          <AppText style={rr.time}>
            {new Date(reg.registered_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
            })}
          </AppText>
        </View>
      </TouchableOpacity>
      <View style={rr.right}>
        <StatusBadge status={reg.status} />
        {updating ? (
          <ActivityIndicator size="small" color="#FF6B35" />
        ) : (
          <View style={rr.acts}>
            {reg.status !== 'accepted' && (
              <TouchableOpacity
                style={rr.btnA}
                onPress={onAccept}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={14} color="#2EC4B6" />
              </TouchableOpacity>
            )}
            {reg.status !== 'rejected' && (
              <TouchableOpacity
                style={rr.btnR}
                onPress={onReject}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={14} color="#E63946" />
              </TouchableOpacity>
            )}
            {reg.status !== 'pending' && (
              <TouchableOpacity
                style={rr.btnP}
                onPress={onPending}
                activeOpacity={0.8}
              >
                <Ionicons name="reload-outline" size={13} color="#FFBE0B" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
const rr = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  av: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  avImg: { width: '100%', height: '100%' },
  avFb: {
    flex: 1,
    backgroundColor: Colors.light.primary + 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ini: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  info: { flex: 1 },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primaryText,
  },
  email: {
    fontSize: 11,
    color: Colors.light.secondaryText,
    marginTop: 1,
  },
  time: {
    fontSize: 10,
    color: Colors.light.secondaryText,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  acts: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btnA: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.success + 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnR: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.danger + 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnP: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFBE0B18',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

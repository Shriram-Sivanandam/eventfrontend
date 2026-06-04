import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AppText from '../../components/AppText';
import api from '../../api/client';
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  limitToLast,
  onValue,
} from '@react-native-firebase/database';
import { getAuth, signInWithCustomToken } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ChatEvent = {
  id: string;
  title: string;
  image_url?: string;
  event_start: string;
  is_host: boolean;
};

type LastMessage = {
  sender_name: string;
  content: string;
  created_at: number;
};

const ACCENT_COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
function accentFor(id: string) {
  return ACCENT_COLORS[id.charCodeAt(0) % ACCENT_COLORS.length];
}

function formatLastMessageTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function ChatRow({
  event,
  lastMessage,
  onPress,
}: {
  event: ChatEvent;
  lastMessage: LastMessage | null;
  onPress: () => void;
}) {
  const accent = accentFor(event.id);
  return (
    <TouchableOpacity style={cr.row} onPress={onPress} activeOpacity={0.8}>
      <View style={cr.imageWrap}>
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={cr.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[cr.imagePlaceholder, { backgroundColor: accent + '20' }]}
          >
            <AppText style={cr.placeholderEmoji}>🎉</AppText>
          </View>
        )}
        {event.is_host && (
          <View style={cr.hostBadge}>
            <Ionicons name="star" size={8} color="#fff" />
          </View>
        )}
      </View>

      <View style={cr.content}>
        <View style={cr.topRow}>
          <AppText style={cr.title} numberOfLines={1}>
            {event.title}
          </AppText>
          {lastMessage && (
            <AppText style={cr.time}>
              {formatLastMessageTime(lastMessage.created_at)}
            </AppText>
          )}
        </View>
        <AppText style={cr.preview} numberOfLines={1}>
          {lastMessage
            ? `${lastMessage.sender_name}: ${lastMessage.content}`
            : 'No messages yet — say hello!'}
        </AppText>
      </View>

      <Ionicons name="chevron-forward" size={15} color="#C4BAB0" />
    </TouchableOpacity>
  );
}

const cr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: '#FFFDF8',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },
  imageWrap: { position: 'relative', flexShrink: 0 },
  image: { width: 52, height: 52, borderRadius: 14 },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 24 },
  hostBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFDF8',
  },
  content: { flex: 1, minWidth: 0 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A0A00',
    flex: 1,
    marginRight: 8,
  },
  time: { fontSize: 11, color: '#C4BAB0', fontWeight: '500', flexShrink: 0 },
  preview: { fontSize: 13, color: '#8A7B6B', fontWeight: '400' },
});

export default function ChatListScreen() {
  const navigation = useNavigation<any>();

  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessage>>(
    {},
  );

  const unsubRefs = React.useRef<Record<string, () => void>>({});

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/chats');
      setEvents(res.data.chats ?? []);
    } catch (err) {
      console.log('CHAT LIST ERROR', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length === 0) return;

    const setupListeners = async () => {
      try {
        const res = await api.post(`/events/${events[0].id}/chat/token`);
        const firebaseAuth = getAuth();
        await signInWithCustomToken(firebaseAuth, res.data.token);
      } catch (err) {
        console.log('CHAT LIST FIREBASE AUTH ERROR', err);
        return;
      }

      Object.values(unsubRefs.current).forEach(unsub => unsub());
      unsubRefs.current = {};

      const db = getDatabase();

      events.forEach(event => {
        const q = query(
          ref(db, `/chats/${event.id}`),
          orderByChild('created_at'),
          limitToLast(1),
        );
        unsubRefs.current[event.id] = onValue(q, snapshot => {
          const data = snapshot.val();
          if (!data) return;
          const msg = Object.values(data)[0] as LastMessage;
          setLastMessages(prev => ({ ...prev, [event.id]: msg }));
        });
      });
    };

    setupListeners();

    return () => {
      Object.values(unsubRefs.current).forEach(unsub => unsub());
    };
  }, [events]);

  const sortedEvents = [...events].sort((a, b) => {
    const aTs =
      lastMessages[a.id]?.created_at ?? new Date(a.event_start).getTime();
    const bTs =
      lastMessages[b.id]?.created_at ?? new Date(b.event_start).getTime();
    return bTs - aTs;
  });

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1A0A00" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Chats</AppText>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={sortedEvents}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvents(true)}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppText style={styles.emptyEmoji}>💬</AppText>
            <AppText style={styles.emptyTitle}>No chats yet</AppText>
            <AppText style={styles.emptySub}>
              Join an event and get accepted to start chatting with other
              attendees.
            </AppText>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}
            >
              <Ionicons name="search-outline" size={15} color="#fff" />
              <AppText style={styles.exploreBtnText}>Explore Events</AppText>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ChatRow
            event={item}
            lastMessage={lastMessages[item.id] ?? null}
            onPress={() => navigation.navigate('EventChat', { event: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A0A00',
    letterSpacing: -0.5,
  },
  emptyWrap: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A0A00',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#8A7B6B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

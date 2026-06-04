import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
  Animated,
  Alert,
} from 'react-native';
import AppText from '../../components/AppText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Spacing } from '../../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useEventChat, ChatMessage } from '../../hooks/useEventChat';
import { useAuth } from '../../context/AuthContext';

const AVATAR_COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
function avatarColor(id: string) {
  return AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return (
    name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('') || '?'
  );
}
function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatDateLabel(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
}

function Avatar({
  name,
  avatarUrl,
  userId,
  size = 30,
}: {
  name: string;
  avatarUrl?: string;
  userId: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColor(userId),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText
        style={{ fontSize: size * 0.38, fontWeight: '800', color: '#fff' }}
      >
        {initials(name)}
      </AppText>
    </View>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <View style={ds.row}>
      <View style={ds.line} />
      <AppText style={ds.label}>{label}</AppText>
      <View style={ds.line} />
    </View>
  );
}
const ds = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: '#EDE8DF' },
  label: {
    fontSize: 11,
    color: '#C4BAB0',
    fontWeight: '600',
    marginHorizontal: 10,
  },
});

const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  showAvatar,
  showName,
}: {
  message: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
  showName: boolean;
}) {
  return (
    <View style={[mb.row, isMe && mb.rowMe]}>
      {!isMe && (
        <View style={mb.avatarSlot}>
          {showAvatar ? (
            <Avatar
              name={message.sender_name}
              avatarUrl={message.avatar_url}
              userId={message.sender_id}
            />
          ) : (
            <View style={{ width: 30 }} />
          )}
        </View>
      )}
      <View style={[mb.col, isMe && mb.colMe]}>
        {showName && !isMe && (
          <AppText style={mb.name}>{message.sender_name}</AppText>
        )}
        <View style={[mb.bubble, isMe ? mb.bubbleMe : mb.bubbleThem]}>
          <AppText style={[mb.text, isMe && mb.textMe]}>
            {message.content}
          </AppText>
        </View>
        <AppText style={[mb.time, isMe && mb.timeMe]}>
          {formatTime(message.created_at)}
        </AppText>
      </View>
    </View>
  );
});

const mb = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
    paddingHorizontal: Spacing.md,
  },
  rowMe: { flexDirection: 'row-reverse' },
  avatarSlot: { marginRight: 6, marginBottom: 18 },
  col: { maxWidth: '72%' },
  colMe: { alignItems: 'flex-end' },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A7B6B',
    marginBottom: 3,
    marginLeft: 2,
  },
  bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  bubbleThem: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    borderBottomLeftRadius: 4,
  },
  bubbleMe: { backgroundColor: '#FF6B35', borderBottomRightRadius: 4 },
  text: { fontSize: 14, color: '#1A0A00', lineHeight: 20 },
  textMe: { color: '#fff' },
  time: { fontSize: 10, color: '#C4BAB0', marginTop: 3, marginLeft: 2 },
  timeMe: { marginLeft: 0, marginRight: 2 },
});

export default function EventChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { event } = route.params;
  const { user } = useAuth() as any;

  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);
  const sendScale = useRef(new Animated.Value(1)).current;

  const { messages, status, sendMessage } = useEventChat(event.id);

  useEffect(() => {
    if (status === 'kicked') {
      Alert.alert(
        'Removed from event',
        'The host has removed you from this event.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
  }, [navigation, status]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || status !== 'ready') return;
    setInputText('');
    Animated.sequence([
      Animated.spring(sendScale, {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.spring(sendScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
    ]).start();
    await sendMessage(text, user.id, user.name, user.avatar_url);
  };

  type ListItem =
    | { kind: 'date'; id: string; label: string }
    | { kind: 'msg'; id: string; msg: ChatMessage };

  const listData: ListItem[] = [];
  let lastLabel = '';
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at);
    if (label !== lastLabel) {
      listData.push({ kind: 'date', id: 'sep-' + label, label });
      lastLabel = label;
    }
    listData.push({ kind: 'msg', id: msg.id, msg });
  }

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    if (item.kind === 'date') return <DateSeparator label={item.label} />;
    const { msg } = item;
    const isMe = msg.sender_id === user?.id;
    const next = listData[index + 1];
    const prev = listData[index - 1];
    const showAvatar =
      !next ||
      next.kind === 'date' ||
      (next as any).msg?.sender_id !== msg.sender_id;
    const showName =
      !prev ||
      prev.kind === 'date' ||
      (prev as any).msg?.sender_id !== msg.sender_id;
    return (
      <MessageBubble
        message={msg}
        isMe={isMe}
        showAvatar={showAvatar}
        showName={showName}
      />
    );
  };

  const isConnecting = status === 'connecting';
  const canSend = status === 'ready' && inputText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A0A00" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <AppText style={styles.headerTitle} numberOfLines={1}>
              {event.title}
            </AppText>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: status === 'ready' ? '#2EC4B6' : '#C4BAB0',
                  },
                ]}
              />
              <AppText style={styles.statusText}>
                {isConnecting
                  ? 'Connecting...'
                  : status === 'ready'
                  ? 'Live'
                  : 'Disconnected'}
              </AppText>
            </View>
          </View>
          <View style={{ width: 38 }} />
        </View>

        {/* Messages */}
        {isConnecting ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#FF6B35" size="large" />
            <AppText style={styles.loadingText}>Joining chat room...</AppText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyEmoji}>💬</AppText>
                <AppText style={styles.emptyTitle}>No messages yet</AppText>
                <AppText style={styles.emptySub}>
                  Be the first to say something!
                </AppText>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isConnecting ? 'Connecting...' : 'Message...'}
            placeholderTextColor="#C4BAB0"
            multiline
            maxLength={1000}
            editable={status === 'ready'}
          />
          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnOff]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up" size={18} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#F5F0E8',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8DF',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A0A00',
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, color: '#8A7B6B', fontWeight: '500' },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 13, color: '#8A7B6B', fontWeight: '500' },
  listContent: { paddingVertical: Spacing.md, flexGrow: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingTop: 100,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A0A00',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#8A7B6B',
    textAlign: 'center',
    lineHeight: 19,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    backgroundColor: '#FFFDF8',
    borderTopWidth: 1,
    borderTopColor: '#EDE8DF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A0A00',
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnOff: { backgroundColor: '#EDE8DF', shadowOpacity: 0, elevation: 0 },
});

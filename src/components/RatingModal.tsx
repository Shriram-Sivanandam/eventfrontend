import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppText from './AppText';
import api from '../api/client';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Spacing } from '../constants/layout';
import { useToast } from '../context/ToastContext';

const RATING_TAGS = [
  'Great vibe',
  'Well organized',
  'Would attend again',
  'Good location',
  'Friendly host',
  'Punctual',
  'Fun crowd',
];

const SCORE_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: 'Poor', color: '#E63946' },
  2: { text: 'Fair', color: '#FF6B35' },
  3: { text: 'Good', color: '#FFBE0B' },
  4: { text: 'Great', color: '#2EC4B6' },
  5: { text: 'Amazing!', color: '#2EC4B6' },
};

type RatingEvent = {
  id: string;
  title: string;
  image_url?: string;
  host_user_id: string;
  host_name?: string;
  host_avatar?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  event: RatingEvent;
  rateeId?: string;
  rateeName?: string;
  rateeAvatar?: string;
  ratingType?: 'host' | 'attendee';
};

function StarRow({
  score,
  onPress,
}: {
  score: number;
  onPress: (n: number) => void;
}) {
  const anims = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(1)),
  ).current;

  const tap = (n: number) => {
    onPress(n);
    Animated.sequence([
      Animated.spring(anims[n - 1], {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 30,
        bounciness: 12,
      }),
      Animated.spring(anims[n - 1], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
    ]).start();
  };

  return (
    <View style={sr.row}>
      {[1, 2, 3, 4, 5].map(n => (
        <Animated.View key={n} style={{ transform: [{ scale: anims[n - 1] }] }}>
          <TouchableOpacity
            onPress={() => tap(n)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            <Ionicons
              name={n <= score ? 'star' : 'star-outline'}
              size={40}
              color={n <= score ? '#FFBE0B' : '#E5E0D8'}
            />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
});

function HostAvatar({
  name,
  avatarUrl,
  hostId,
}: {
  name?: string;
  avatarUrl?: string;
  hostId: string;
}) {
  const COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
  const color = COLORS[hostId.charCodeAt(0) % COLORS.length];
  const uri = avatarUrl ? avatarUrl : null;
  const init = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  if (uri) return <Image source={{ uri }} style={ha.img} resizeMode="cover" />;
  return (
    <View style={[ha.placeholder, { backgroundColor: color }]}>
      <AppText style={ha.initials}>{init}</AppText>
    </View>
  );
}

const ha = StyleSheet.create({
  img: { width: 44, height: 44, borderRadius: 22 },
  placeholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 16, fontWeight: '900', color: '#fff' },
});

export default function RatingModal({
  visible,
  onClose,
  onSubmitted,
  event,
  rateeId,
  rateeName,
  rateeAvatar,
  ratingType,
}: Props) {
  const resolvedRateeId = rateeId ?? event.host_user_id;
  const resolvedRateeName = rateeName ?? event.host_name;
  const resolvedRateeAvatar = rateeAvatar ?? event.host_avatar;
  const resolvedType = ratingType ?? 'host';
  const { showToast } = useToast();

  const [score, setScore] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setScore(0);
      setSelectedTags(new Set());
      setComment('');
      setSubmitted(false);
      successAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 3,
      }).start();
    }
  }, [slideAnim, successAnim, visible]);

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const submit = async () => {
    if (score === 0 || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/events/${event.id}/rate`, {
        ratee_id: resolvedRateeId,
        rating_type: resolvedType,
        score,
        comment: comment.trim() || null,
        tags: Array.from(selectedTags),
      });
      setSubmitted(true);
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 8,
      }).start();
      setTimeout(() => {
        onSubmitted?.();
        close();
      }, 1600);
    } catch {
      showToast({
        type: 'error',
        message: 'Something went wrong in submitting your rating',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const label = score > 0 ? SCORE_LABELS[score] : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={close}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {!submitted ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* Header */}
              <View style={styles.header}>
                <AppText style={styles.sheetTitle}>
                  {resolvedType === 'host'
                    ? 'Rate this event'
                    : `Rate ${resolvedRateeName || 'attendee'}`}
                </AppText>
                <TouchableOpacity
                  onPress={close}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color="#C4BAB0" />
                </TouchableOpacity>
              </View>

              {/* Event title */}
              <AppText style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </AppText>

              {/* Ratee card — shows the host when rating a host, or the attendee when rating an attendee */}
              <View style={styles.hostCard}>
                <HostAvatar
                  name={resolvedRateeName}
                  avatarUrl={resolvedRateeAvatar}
                  hostId={resolvedRateeId}
                />
                <View>
                  <AppText style={styles.hostLabel}>
                    {resolvedType === 'host' ? 'Hosted by' : 'Rating'}
                  </AppText>
                  <AppText style={styles.hostName}>
                    {resolvedRateeName || 'Anonymous'}
                  </AppText>
                </View>
              </View>

              {/* Stars */}
              <StarRow score={score} onPress={setScore} />

              {/* Score label */}
              <View style={styles.scoreLabelWrap}>
                {label ? (
                  <AppText style={[styles.scoreLabel, { color: label.color }]}>
                    {label.text}
                  </AppText>
                ) : (
                  <AppText style={styles.scorePlaceholder}>
                    Tap a star to rate
                  </AppText>
                )}
              </View>

              {/* Tags — only shown after a score is set */}
              {score > 0 && (
                <View style={styles.tagsSection}>
                  <AppText style={styles.tagsLabel}>
                    What stood out?{' '}
                    <AppText style={styles.tagsOptional}>(optional)</AppText>
                  </AppText>
                  <View style={styles.tagsWrap}>
                    {RATING_TAGS.map(tag => {
                      const sel = selectedTags.has(tag);
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[styles.tag, sel && styles.tagSelected]}
                          onPress={() => toggleTag(tag)}
                          activeOpacity={0.75}
                        >
                          <AppText
                            style={[
                              styles.tagText,
                              sel && styles.tagTextSelected,
                            ]}
                          >
                            {sel ? '✓ ' : ''}
                            {tag}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Comment */}
              {score > 0 && (
                <View style={styles.commentWrap}>
                  <TextInput
                    style={styles.commentInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Add a comment (optional)..."
                    placeholderTextColor="#C4BAB0"
                    multiline
                    maxLength={280}
                  />
                  <AppText style={styles.charCount}>
                    {comment.length}/280
                  </AppText>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, score === 0 && styles.submitBtnOff]}
                onPress={submit}
                disabled={score === 0 || submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <AppText style={styles.submitBtnText}>Submit Rating</AppText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={close}
                style={styles.skipBtn}
                activeOpacity={0.7}
              >
                <AppText style={styles.skipText}>Skip for now</AppText>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Success */
            <Animated.View
              style={[
                styles.successWrap,
                {
                  opacity: successAnim,
                  transform: [
                    {
                      scale: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.85, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <AppText style={styles.successEmoji}>🎉</AppText>
              <AppText style={styles.successTitle}>Thanks for rating!</AppText>
              <AppText style={styles.successSub}>
                Your feedback helps others find great events.
              </AppText>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,10,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EDE8DF',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A0A00',
    letterSpacing: -0.3,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C4F42',
    marginBottom: 14,
    lineHeight: 20,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  hostLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C4BAB0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hostName: { fontSize: 15, fontWeight: '800', color: '#1A0A00' },
  scoreLabelWrap: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  scoreLabel: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  scorePlaceholder: { fontSize: 13, color: '#C4BAB0', fontWeight: '500' },
  tagsSection: { marginBottom: 16 },
  tagsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A7B6B',
    marginBottom: 10,
  },
  tagsOptional: { fontWeight: '400', color: '#C4BAB0' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    backgroundColor: '#FFFDF8',
  },
  tagSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  tagText: { fontSize: 12, fontWeight: '600', color: '#5C4F42' },
  tagTextSelected: { color: '#fff', fontWeight: '700' },
  commentWrap: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    padding: 12,
    marginBottom: 20,
  },
  commentInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A0A00',
    minHeight: 72,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontSize: 10,
    color: '#C4BAB0',
    textAlign: 'right',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnOff: { backgroundColor: '#EDE8DF', shadowOpacity: 0, elevation: 0 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 13, color: '#C4BAB0', fontWeight: '500' },
  successWrap: { alignItems: 'center', paddingVertical: 52 },
  successEmoji: { fontSize: 56, marginBottom: 16 },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A0A00',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: '#8A7B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

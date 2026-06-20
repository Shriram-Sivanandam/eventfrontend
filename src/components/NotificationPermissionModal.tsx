import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import AppText from './AppText';

type Props = {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
};

export default function NotificationPermissionModal({
  visible,
  onAllow,
  onSkip,
}: Props) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 16,
          bounciness: 6,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [opacity, scale, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <AppText style={styles.icon}>🔔</AppText>
          </View>

          <AppText style={styles.title}>Stay in the loop</AppText>
          <AppText style={styles.body}>
            Get notified when your registration is accepted, when events are
            starting, and when someone messages you in an event chat.
          </AppText>

          {/* What you'll get */}
          <View style={styles.bullets}>
            {[
              { emoji: '🎟️', text: 'Registration accepted or rejected' },
              { emoji: '⏰', text: 'Event reminders 1 hour before' },
              { emoji: '💬', text: 'New messages in event chats' },
            ].map(item => (
              <View key={item.text} style={styles.bullet}>
                <AppText style={styles.bulletEmoji}>{item.emoji}</AppText>
                <AppText style={styles.bulletText}>{item.text}</AppText>
              </View>
            ))}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.allowBtn}
            onPress={onAllow}
            activeOpacity={0.88}
          >
            <AppText style={styles.allowBtnText}>Allow notifications</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <AppText style={styles.skipBtnText}>Not now</AppText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,10,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1A0A00',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FF6B3515',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A0A00',
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#5C4F42',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  bullets: {
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bulletEmoji: { fontSize: 18 },
  bulletText: { fontSize: 13, fontWeight: '500', color: '#1A0A00', flex: 1 },
  allowBtn: {
    width: '100%',
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
  allowBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  skipBtn: { paddingVertical: 8 },
  skipBtnText: { fontSize: 14, color: '#C4BAB0', fontWeight: '500' },
});

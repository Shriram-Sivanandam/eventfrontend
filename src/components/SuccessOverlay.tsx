import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Modal } from 'react-native';
import AppText from './AppText';

type Props = {
  visible: boolean;
  emoji: string;
  title: string;
  subtitle?: string;
  duration?: number;
  onDone?: () => void;
};

function ConfettiDot({
  color,
  delay,
  startX,
}: {
  color: string;
  delay: number;
  startX: number;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: -160 + Math.random() * 80,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 4,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, rotate, y]);

  const spin = rotate.interpolate({
    inputRange: [0, 4],
    outputRange: ['0deg', '720deg'],
  });

  const size = 6 + Math.random() * 6;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: '35%',
        left: startX,
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: color,
        opacity,
        transform: [{ translateY: y }, { rotate: spin }],
      }}
    />
  );
}

const CONFETTI_COLORS = [
  '#FF6B35',
  '#2EC4B6',
  '#FFBE0B',
  '#E63946',
  '#8338EC',
  '#1A0A00',
];

const DOTS = Array.from({ length: 18 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: Math.random() * 200,
  startX: 30 + Math.random() * 280,
}));

export default function SuccessOverlay({
  visible,
  emoji,
  title,
  subtitle,
  duration = 4000,
  onDone,
}: Props) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(-0.2)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (!visible) return;

    bgOpacity.setValue(0);
    emojiScale.setValue(0);
    emojiRotate.setValue(-0.2);
    textOpacity.setValue(0);
    textSlide.setValue(16);

    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(emojiScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 14,
      }),
      Animated.spring(emojiRotate, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 8,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const timer = setTimeout(() => {
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(onDone);
    }, duration);

    return () => clearTimeout(timer);
  }, [
    bgOpacity,
    duration,
    emojiRotate,
    emojiScale,
    onDone,
    textOpacity,
    textSlide,
    visible,
  ]);

  const spin = emojiRotate.interpolate({
    inputRange: [-0.2, 0],
    outputRange: ['-12deg', '0deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.bg, { opacity: bgOpacity }]}>
        {/* Confetti */}
        {DOTS.map((d, i) => (
          <ConfettiDot key={i} {...d} />
        ))}

        {/* Emoji */}
        <Animated.Text
          style={[
            styles.emoji,
            { transform: [{ scale: emojiScale }, { rotate: spin }] },
          ]}
        >
          {emoji}
        </Animated.Text>

        {/* Text */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textSlide }],
            alignItems: 'center',
          }}
        >
          <AppText style={styles.title}>{title}</AppText>
          {subtitle ? (
            <AppText style={styles.subtitle}>{subtitle}</AppText>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A0A00',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A7B6B',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});

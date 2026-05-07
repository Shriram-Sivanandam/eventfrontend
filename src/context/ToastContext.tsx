import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import AppText from '../components/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Radius, Shadows } from '../constants/layout';
import Colors from '../constants/colors';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastContextValue = {
  showToast: (opts: Omit<Toast, 'id'>) => void;
};

const CONFIG: Record<
  ToastType,
  { icon: string; bg: string; iconColor: string; border: string }
> = {
  success: {
    icon: 'checkmark-circle',
    bg: '#EDFAF8',
    iconColor: '#2EC4B6',
    border: '#2EC4B640',
  },
  error: {
    icon: 'close-circle',
    bg: '#FEF2F2',
    iconColor: '#E63946',
    border: '#E6394640',
  },
  info: {
    icon: 'information-circle',
    bg: '#FFF7ED',
    iconColor: '#FF6B35',
    border: '#FF6B3540',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const cfg = CONFIG[toast.type];
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(toast.id));
  }, [onDismiss, opacity, toast.id, translateY]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 5,
      }),
    ]).start();

    const timer = setTimeout(dismiss, toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [dismiss, opacity, scale, toast.duration, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
        { transform: [{ translateY }, { scale }], opacity },
      ]}
    >
      <Ionicons name={cfg.icon} size={20} color={cfg.iconColor} />
      <AppText style={styles.message} numberOfLines={2}>
        {toast.message}
      </AppText>
      <TouchableOpacity
        onPress={dismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color="#C4BAB0" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { ...opts, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primaryText,
    lineHeight: 18,
  },
});

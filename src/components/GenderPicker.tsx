import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import AppText from '../components/AppText';
import { Radius, Spacing } from '../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const FOCUSED_BORDER = '#FF6B35';
const UNFOCUSED_BORDER = '#EDE8DF';
const FOCUSED_ICON_BG = '#FF6B3518';
const UNFOCUSED_ICON_BG = '#F5F0E8';

type GenderOption = { value: string; label: string; icon: string };

const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Male', icon: '♂️' },
  { value: 'female', label: 'Female', icon: '♀️' },
  { value: 'non_binary', label: 'Non-binary', icon: '⚧️' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
];

function genderLabel(value: string): string {
  return GENDER_OPTIONS.find(o => o.value === value)?.label ?? 'Select gender';
}

export default function GenderPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const openModal = () => {
    setOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  const select = (v: string) => {
    onChange(v);
    closeModal();
  };
  const hasValue = !!value;

  return (
    <>
      <TouchableOpacity
        style={[gp.trigger, open && gp.triggerFocused]}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <View style={[gp.iconWrap, open && gp.iconWrapFocused]}>
          <Ionicons
            name="person-outline"
            size={17}
            color={open ? '#FF6B35' : '#8A7B6B'}
          />
        </View>
        <View style={gp.content}>
          <AppText style={gp.label}>
            Gender <AppText style={gp.optional}> · optional</AppText>
          </AppText>
          <AppText style={[gp.value, !hasValue && gp.placeholder]}>
            {hasValue ? genderLabel(value) : 'Select gender'}
          </AppText>
        </View>
        <Ionicons
          name="chevron-down"
          size={16}
          color={open ? '#FF6B35' : '#C4BAB0'}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={gp.backdrop}
          activeOpacity={1}
          onPress={closeModal}
        />
        <Animated.View
          style={[gp.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={gp.handle} />
          {GENDER_OPTIONS.map(opt => {
            const selected = value === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[gp.option, selected && gp.optionSelected]}
                onPress={() => select(opt.value)}
                activeOpacity={0.75}
              >
                <AppText style={gp.optionEmoji}>{opt.icon}</AppText>
                <AppText
                  style={[gp.optionLabel, selected && gp.optionLabelSelected]}
                >
                  {opt.label}
                </AppText>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                )}
              </TouchableOpacity>
            );
          })}
          {hasValue && (
            <TouchableOpacity
              style={gp.clearBtn}
              onPress={() => select('')}
              activeOpacity={0.7}
            >
              <AppText style={gp.clearText}>Clear selection</AppText>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Modal>
    </>
  );
}

const gp = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: UNFOCUSED_BORDER,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  triggerFocused: {
    borderColor: FOCUSED_BORDER,
    shadowColor: FOCUSED_BORDER,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: UNFOCUSED_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFocused: { backgroundColor: FOCUSED_ICON_BG },
  content: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  optional: {
    fontSize: 10,
    color: '#C4BAB0',
    fontWeight: '500',
    textTransform: 'none',
  },
  value: { fontSize: 15, fontWeight: '600', color: Colors.light.primaryText },
  placeholder: { color: Colors.light.secondaryText },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,10,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.tertiarySurface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl + 5,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  optionSelected: {
    backgroundColor: Colors.light.primary + 10,
    borderRadius: Radius.md,
  },
  optionEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primaryText,
  },
  optionLabelSelected: { color: Colors.light.primary, fontWeight: '700' },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  clearText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontWeight: '600',
  },
});

import React, { useRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import AppText from './AppText';
import { Radius, Spacing } from '../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const FOCUSED_BORDER = '#FF6B35';
const UNFOCUSED_BORDER = '#EDE8DF';
const FOCUSED_ICON_BG = '#FF6B3518';
const UNFOCUSED_ICON_BG = '#F5F0E8';

export default function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  icon,
  optional,
  editable = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  icon: string;
  optional?: boolean;
  editable?: boolean;
}) {
  const containerRef = useRef<View>(null);
  const iconWrapRef = useRef<View>(null);

  const handleFocus = () => {
    containerRef.current?.setNativeProps({
      style: { borderColor: FOCUSED_BORDER },
    });
    iconWrapRef.current?.setNativeProps({
      style: { backgroundColor: FOCUSED_ICON_BG },
    });
  };

  const handleBlur = () => {
    containerRef.current?.setNativeProps({
      style: { borderColor: UNFOCUSED_BORDER },
    });
    iconWrapRef.current?.setNativeProps({
      style: { backgroundColor: UNFOCUSED_ICON_BG },
    });
  };

  return (
    <View
      ref={containerRef}
      style={[field.wrap, !editable && field.wrapDisabled]}
    >
      <View ref={iconWrapRef} style={field.iconWrap}>
        <Ionicons name={icon} size={17} color="#8A7B6B" />
      </View>
      <View>
        <AppText style={field.label}>
          {label}
          {optional && <AppText style={field.optional}> · optional</AppText>}
        </AppText>
        <TextInput
          style={[
            field.input,
            multiline && field.inputMulti,
            !editable && field.inputDisabled,
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#C4BAB0"
          multiline={multiline}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={handleFocus} // no setState — safe on Android
          onBlur={handleBlur}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const field = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: UNFOCUSED_BORDER,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  wrapDisabled: {
    backgroundColor: '#FAF7F2',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: UNFOCUSED_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  optional: {
    fontSize: 10,
    color: Colors.light.border,
    fontWeight: '500',
    textTransform: 'none',
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A0A00',
    padding: 0,
  },
  inputMulti: {
    minHeight: 70,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  inputDisabled: {
    color: '#C4BAB0',
  },
});

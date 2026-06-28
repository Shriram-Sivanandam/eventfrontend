import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
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
  const inputRef = useRef<TextInput>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChange(text);
  };

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

  const focusInput = () => {
    if (editable) inputRef.current?.focus();
  };

  return (
    <Pressable
      onPress={focusInput}
      style={[field.wrap, !editable && field.wrapDisabled]}
    >
      <View ref={containerRef} style={field.borderWrap}>
        <View ref={iconWrapRef} style={field.iconWrap}>
          <Ionicons name={icon} size={17} color="#8A7B6B" />
        </View>

        <View style={field.textCol}>
          <AppText style={field.label}>
            {label}
            {optional && <AppText style={field.optional}> · optional</AppText>}
          </AppText>
          <TextInput
            ref={inputRef}
            style={[
              field.input,
              multiline && field.inputMulti,
              !editable && field.inputDisabled,
            ]}
            value={localValue}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor="#C4BAB0"
            multiline={multiline}
            keyboardType={keyboardType}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            scrollEnabled={false}
          />
        </View>
      </View>
    </Pressable>
  );
}

const field = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  wrapDisabled: {
    opacity: 1,
  },
  borderWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: UNFOCUSED_BORDER,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: UNFOCUSED_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
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
    width: '100%',
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

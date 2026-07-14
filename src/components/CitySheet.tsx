import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppText from './AppText';
import { Radius, Spacing } from '../constants/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { INDIAN_CITIES } from '../data/IndianCities';
import Colors from '../constants/colors';

export default function CitySheet({
  visible,
  selectedCity,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCity: string | null;
  onSelect: (city: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      setQuery('');
    }
  }, [slideAnim, visible]);

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
      onClose();
    });
  };

  const handleSelect = (city: string) => {
    onSelect(city === selectedCity ? null : city);
    closeSheet();
  };

  const filtered = query.trim()
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : INDIAN_CITIES;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <KeyboardAvoidingView
        style={cs.kavWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={cs.backdrop}
          activeOpacity={1}
          onPress={closeSheet}
        />
        <View style={cs.sheet}>
          <View style={cs.handle} />
          <View style={cs.sheetHeader}>
            <AppText style={cs.sheetTitle}>Select City</AppText>
            {selectedCity && (
              <TouchableOpacity
                onPress={() => {
                  onSelect(null);
                  closeSheet();
                }}
                activeOpacity={0.7}
              >
                <AppText style={cs.clearText}>Clear</AppText>
              </TouchableOpacity>
            )}
          </View>
          <View style={cs.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#8A7B6B" />
            <TextInput
              ref={inputRef}
              style={cs.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search cities..."
              placeholderTextColor="#C4BAB0"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={15} color="#C4BAB0" />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            style={cs.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item === selectedCity;
              return (
                <TouchableOpacity
                  style={[cs.cityRow, isSelected && cs.cityRowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSelected ? 'location' : 'location-outline'}
                    size={15}
                    color={isSelected ? '#FF6B35' : '#8A7B6B'}
                  />
                  <AppText
                    style={[cs.cityName, isSelected && cs.cityNameSelected]}
                  >
                    {item}
                  </AppText>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#FF6B35"
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <View style={cs.bottomSpace} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cs = StyleSheet.create({
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.light.tertiarySurface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    flexShrink: 1,
    maxHeight: '65%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primaryText,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.secondarySurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.primaryText,
    padding: 0,
  },
  list: { flexShrink: 1 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  cityRowSelected: {
    backgroundColor: Colors.light.primary + 10,
    borderRadius: Radius.md,
    borderBottomColor: 'transparent',
    paddingHorizontal: Spacing.md,
  },
  cityName: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.primaryText,
  },
  cityNameSelected: {
    fontWeight: '700',
    color: Colors.light.primary,
  },
  bottomSpace: {
    height: 24,
  },
});

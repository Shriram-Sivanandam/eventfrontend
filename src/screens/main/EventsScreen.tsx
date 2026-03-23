import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import AppText from '../../components/AppText';
import EventCard from '../../components/EventCard';
import api from '../../api/client';
import { Radius, Spacing } from '../../constants/layout';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../../components/Screen';
import Colors from '../../constants/colors';
import { Tag } from '../../constants/types';
import CitySheet from '../../components/CitySheet';
import PageHeader from '../../components/PageHeader';

const TAG_COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
function tagColor(id: string) {
  return TAG_COLORS[id.charCodeAt(0) % TAG_COLORS.length];
}

const TagPill = memo(function TagPill({
  tag,
  selected,
  onPress,
}: {
  tag: Tag;
  selected: boolean;
  onPress: () => void;
}) {
  const color = tagColor(tag.id);
  return (
    <TouchableOpacity
      style={[
        tp.wrap,
        selected && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <AppText style={[tp.label, selected && tp.labelSelected]}>
        {tag.name}
      </AppText>
    </TouchableOpacity>
  );
});

const tp = StyleSheet.create({
  wrap: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    backgroundColor: '#FFFDF8',
    marginRight: 8,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#5C4F42' },
  labelSelected: { color: '#fff' },
});

function CityTrigger({
  selectedCity,
  onPress,
}: {
  selectedCity: string | null;
  onPress: () => void;
}) {
  const hasCity = !!selectedCity;
  return (
    <TouchableOpacity
      style={[ct.wrap, hasCity && ct.wrapSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={hasCity ? 'location' : 'location-outline'}
        size={13}
        color={hasCity ? '#fff' : '#5C4F42'}
      />
      <AppText style={[ct.label, hasCity && ct.labelSelected]}>
        {hasCity ? selectedCity! : 'City'}
      </AppText>
      <Ionicons
        name="chevron-down"
        size={12}
        color={hasCity ? 'rgba(255,255,255,0.7)' : '#C4BAB0'}
      />
    </TouchableOpacity>
  );
}

const ct = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    backgroundColor: '#FFFDF8',
    marginRight: 8,
    flexShrink: 0,
  },
  wrapSelected: { backgroundColor: '#1A0A00', borderColor: '#1A0A00' },
  label: { fontSize: 12, fontWeight: '700', color: '#5C4F42' },
  labelSelected: { color: '#fff' },
});

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <View style={es.wrap}>
      <AppText style={es.emoji}>{hasFilters ? '🔍' : '🎉'}</AppText>
      <AppText style={es.title}>
        {hasFilters ? 'No matching events' : 'No events yet'}
      </AppText>
      <AppText style={es.sub}>
        {hasFilters
          ? 'Try adjusting your search or filters.'
          : 'Be the first to host something in your area.'}
      </AppText>
      <View style={es.btnRow}>
        {hasFilters && (
          <TouchableOpacity
            style={es.clearBtn}
            onPress={onClear}
            activeOpacity={0.8}
          >
            <AppText style={es.clearBtnText}>Clear filters</AppText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={es.createBtn}
          onPress={onCreate}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <AppText style={es.createBtnText}>Create Event</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const es = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 60 },
  emoji: { fontSize: 48, marginBottom: Spacing.md },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primaryText,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  btnRow: { flexDirection: 'row', gap: Spacing.md },
  clearBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.tertiarySurface,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.secondaryText,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.tertiaryText,
  },
});

export default function EventsScreen() {
  const navigation = useNavigation<any>();

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const searchBorderAnim = useRef(new Animated.Value(0)).current;
  const borderColor = searchBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#EDE8DF', '#FF6B35'],
  });

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get(
        '/events?from=' + new Date().toISOString() + '&limit=50',
      );
      setAllEvents(res.data.events ?? []);
    } catch (err) {
      console.log('EVENT FETCH ERROR', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await api.get('/tags');
      setTags(res.data.tags ?? []);
    } catch (err) {
      console.log('TAGS FETCH ERROR', err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchTags();
  }, [fetchEvents, fetchTags]);

  const filteredEvents = allEvents.filter(event => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        event.title?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q) ||
        event.city?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCity) {
      if (!event.city?.toLowerCase().includes(selectedCity.toLowerCase()))
        return false;
    }
    if (selectedTagIds.size > 0) {
      const eventTagIds: string[] = (event.tags ?? []).map((t: Tag) => t.id);
      for (const tagId of selectedTagIds) {
        if (!eventTagIds.includes(tagId)) return false;
      }
    }
    return true;
  });

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeFilterCount =
    (search.trim() ? 1 : 0) + (selectedCity ? 1 : 0) + selectedTagIds.size;

  const clearAll = () => {
    setSearch('');
    setSelectedCity(null);
    setSelectedTagIds(new Set());
  };

  const ListHeader = (
    <View>
      <Animated.View style={[sb.wrap, { borderColor }]}>
        <Ionicons name="search-outline" size={18} color="#8A7B6B" />
        <TextInput
          style={sb.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search events, places..."
          placeholderTextColor="#C4BAB0"
          onFocus={() =>
            Animated.timing(searchBorderAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: false,
            }).start()
          }
          onBlur={() =>
            Animated.timing(searchBorderAnim, {
              toValue: 0,
              duration: 180,
              useNativeDriver: false,
            }).start()
          }
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={17} color="#C4BAB0" />
          </TouchableOpacity>
        )}
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        keyboardShouldPersistTaps="handled"
      >
        <CityTrigger
          selectedCity={selectedCity}
          onPress={() => setCitySheetOpen(true)}
        />
        {tags.map(tag => (
          <TagPill
            key={tag.id}
            tag={tag}
            selected={selectedTagIds.has(tag.id)}
            onPress={() => toggleTag(tag.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.resultRow}>
        <AppText style={styles.resultCount}>
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 ? ' found' : ' upcoming'}
        </AppText>
        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearBadge}
            onPress={clearAll}
            activeOpacity={0.8}
          >
            <AppText style={styles.clearBadgeText}>
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </AppText>
            <Ionicons name="close-circle" size={14} color="#FF6B35" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      <PageHeader
        title="Spotlight"
        subtitle="Find events happening near you"
        backArrow={false}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreen')}
            activeOpacity={0.85}
          >
            <Ionicons name="person-circle-outline" size={38} color="#FF6B35" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvents(true)}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <EmptyState
            hasFilters={activeFilterCount > 0}
            onClear={clearAll}
            onCreate={() => navigation.navigate('CreateEvent')}
          />
        }
        renderItem={({ item }) => <EventCard event={item} />}
      />

      <CitySheet
        visible={citySheetOpen}
        selectedCity={selectedCity}
        onSelect={setSelectedCity}
        onClose={() => setCitySheetOpen(false)}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </Screen>
  );
}

const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.light.tertiarySurface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.primaryText,
    padding: 0,
  },
});

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    alignItems: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primaryText,
    flex: 1,
  },
  clearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary + 15,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  clearBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  listContent: { paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xxl,
    backgroundColor: Colors.light.primary,
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

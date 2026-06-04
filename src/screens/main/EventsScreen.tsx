import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useMemo,
} from 'react';
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
import { tagColor } from '../../constants/values';

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

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View style={[sk.card, { opacity }]}>
      <View style={sk.image} />
      <View style={sk.body}>
        <View style={sk.topRow}>
          <View style={sk.dateBlock} />
          <View style={sk.titleBlock}>
            <View style={sk.titleLine} />
            <View style={sk.subtitleLine} />
          </View>
        </View>
        <View style={sk.metaLine} />
        <View style={sk.divider} />
        <View style={sk.footer}>
          <View style={sk.tag} />
          <View style={sk.tag} />
        </View>
      </View>
    </Animated.View>
  );
}

const G = '#EDE8DF';
const sk = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    marginBottom: Spacing.lg,
  },
  image: { height: 175, backgroundColor: G },
  body: { padding: 14 },
  topRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  dateBlock: { width: 46, height: 52, borderRadius: 10, backgroundColor: G },
  titleBlock: { flex: 1, justifyContent: 'center', gap: 8 },
  titleLine: { height: 14, borderRadius: 6, backgroundColor: G, width: '80%' },
  subtitleLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: G,
    width: '50%',
  },
  metaLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: G,
    width: '60%',
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: G, marginVertical: 10 },
  footer: { flexDirection: 'row', gap: 8 },
  tag: { height: 24, width: 64, borderRadius: 20, backgroundColor: G },
});

const SKELETON_DATA = [{ id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }];

const PAGE_SIZE = 10;

export default function EventsScreen() {
  const navigation = useNavigation<any>();

  const isFirstLoad = useRef(true);

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listData = initialLoad ? SKELETON_DATA : allEvents;
  const renderItem = useCallback(
    (item: any) => {
      if (initialLoad) return <SkeletonCard />;
      return <EventCard event={item} />;
    },
    [initialLoad],
  );

  const searchBorderAnim = useRef(new Animated.Value(0)).current;
  const borderColor = searchBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#EDE8DF', '#FF6B35'],
  });

  const fetchEvents = useCallback(
    async (opts: {
      mode: 'initial' | 'paginate' | 'refresh';
      searchVal: string;
      city: string | null;
      tagIds: string[] | null;
      currentOffset: number;
    }) => {
      if (opts.mode === 'paginate') setPageLoading(true);
      if (opts.mode === 'refresh') setRefreshing(true);
      if (opts.mode === 'initial' && isFirstLoad.current) setInitialLoad(true);
      if (opts.mode === 'initial' && !isFirstLoad.current) setFiltering(true);
      try {
        const qs = new URLSearchParams();
        qs.set('from', new Date().toISOString());
        qs.set('limit', String(PAGE_SIZE));
        qs.set('offset', String(opts.currentOffset));
        if (opts.searchVal.trim()) qs.set('search', opts.searchVal.trim());
        if (opts.city) qs.set('city', opts.city);
        if (opts.tagIds) opts.tagIds.forEach(id => qs.append('tag_id', id));

        const res = await api.get('/events?' + qs.toString());
        const fetched: any[] = res.data.events ?? [];
        const more: boolean = res.data.has_more ?? fetched.length === PAGE_SIZE;

        if (opts.mode === 'paginate') {
          setAllEvents(prev => [...prev, ...fetched]);
        } else {
          setAllEvents(fetched);
        }

        setHasMore(more);
        setOffset(opts.currentOffset + fetched.length);
      } catch (err) {
        console.log('EVENT FETCH ERROR', err);
      } finally {
        setInitialLoad(false);
        setFiltering(false);
        setPageLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const fetchTags = useCallback(async () => {
    try {
      const res = await api.get('/tags');
      setTags(res.data.tags ?? []);
    } catch (err) {
      console.log('TAGS FETCH ERROR', err);
    }
  }, []);

  const refetch = useCallback(
    (newSearch: string, newCity: string | null, newTagIds: string[] | null) => {
      setOffset(0);
      setHasMore(true);
      fetchEvents({
        mode: 'initial',
        searchVal: newSearch,
        city: newCity,
        tagIds: newTagIds,
        currentOffset: 0,
      });
    },
    [fetchEvents],
  );

  useEffect(() => {
    fetchEvents({
      mode: 'initial',
      searchVal: '',
      city: null,
      tagIds: null,
      currentOffset: 0,
    });
    fetchTags();
  }, [fetchEvents, fetchTags]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearch(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        refetch(
          text,
          selectedCity,
          selectedTagIds.size > 0 ? Array.from(selectedTagIds) : null,
        );
      }, 400);
    },
    [refetch, selectedCity, selectedTagIds],
  );

  const handleCitySelect = (city: string | null) => {
    setSelectedCity(city);
    refetch(
      search,
      city,
      selectedTagIds.size > 0 ? Array.from(selectedTagIds) : null,
    );
  };

  const handleTagToggle = useCallback(
    (id: string) => {
      setSelectedTagIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        const newTagIds = Array.from(next);
        refetch(search, selectedCity, newTagIds);
        return next;
      });
    },
    [refetch, search, selectedCity],
  );

  const activeFilterCount =
    (search.trim() ? 1 : 0) + (selectedCity ? 1 : 0) + selectedTagIds.size;

  const clearAll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch('');
    setSelectedCity(null);
    setSelectedTagIds(new Set());
    refetch('', null, null);
  }, [debounceRef, refetch]);

  const loadMore = () => {
    if (pageLoading || !hasMore || filtering) return;
    fetchEvents({
      mode: 'paginate',
      searchVal: search,
      city: selectedCity,
      tagIds: selectedTagIds.size > 0 ? Array.from(selectedTagIds) : null,
      currentOffset: offset,
    });
  };

  const handleRefresh = () => {
    setOffset(0);
    setHasMore(true);
    fetchEvents({
      mode: 'refresh',
      searchVal: search,
      city: selectedCity,
      tagIds: selectedTagIds.size > 0 ? Array.from(selectedTagIds) : null,
      currentOffset: 0,
    });
  };

  const ListHeader = useMemo(
    () => (
      <View>
        <Animated.View style={[sb.wrap, { borderColor }]}>
          <Ionicons name="search-outline" size={18} color="#8A7B6B" />
          <TextInput
            style={sb.input}
            value={search}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              refetch(
                search,
                selectedCity,
                selectedTagIds.size > 0 ? Array.from(selectedTagIds) : null,
              );
            }}
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
              onPress={() => handleSearchChange('')}
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
              onPress={() => handleTagToggle(tag.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.resultRow}>
          <AppText style={styles.resultCount}>
            {filtering
              ? 'Searching...'
              : `${allEvents.length}${hasMore ? '+' : ''} event${
                  allEvents.length !== 1 ? 's' : ''
                } ${activeFilterCount > 0 ? 'found' : 'upcoming'}`}
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
    ),
    [
      borderColor,
      search,
      handleSearchChange,
      selectedCity,
      tags,
      filtering,
      allEvents.length,
      hasMore,
      activeFilterCount,
      clearAll,
      refetch,
      selectedTagIds,
      searchBorderAnim,
      handleTagToggle,
    ],
  );

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      <PageHeader
        title="Spotlight"
        subtitle="Find events happening near you"
        backArrow={false}
        rightComponent={
          <View style={sb.rightComponent}>
            <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
              <Ionicons
                name="chatbubbles-outline"
                size={26}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileScreen')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="person-circle-outline"
                size={38}
                color="#FF6B35"
              />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
        renderItem={({ item }) => renderItem(item)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          pageLoading ? (
            <ActivityIndicator
              color={Colors.light.primary}
              size="small"
              style={styles.listFooter}
            />
          ) : null
        }
      />

      <CitySheet
        visible={citySheetOpen}
        selectedCity={selectedCity}
        onSelect={handleCitySelect}
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
  rightComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  listFooter: {
    paddingVertical: Spacing.lg,
  },
});

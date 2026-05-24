import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import AppText from '../components/AppText';
import api from '../api/client';
import { Tag } from '../constants/types';
import { tagColor } from '../constants/values';

const MAX_TAGS = 3;

export default function TagPicker({
  selectedTagIds,
  onChange,
}: {
  selectedTagIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/tags')
      .then(res => setTags(res.data.tags ?? []))
      .catch(err => console.log('TAGS FETCH ERROR', err))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    const isSelected = selectedTagIds.includes(id);
    if (!isSelected && selectedTagIds.length >= MAX_TAGS) return;
    onChange(
      isSelected
        ? selectedTagIds.filter(t => t !== id)
        : [...selectedTagIds, id],
    );
  };

  if (loading) {
    return <AppText style={tpStyles.loading}>Loading tags...</AppText>;
  }

  return (
    <View>
      <View style={tpStyles.wrap}>
        {tags.map(tag => {
          const sel = selectedTagIds.includes(tag.id);
          const color = tagColor(tag.id);
          const atCap = !sel && selectedTagIds.length >= MAX_TAGS;
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                tpStyles.pill,
                sel && { backgroundColor: color, borderColor: color },
                atCap && tpStyles.pillDisabled,
              ]}
              onPress={() => toggle(tag.id)}
              activeOpacity={atCap ? 1 : 0.75}
            >
              <AppText
                style={[tpStyles.pillText, sel && tpStyles.pillTextSelected]}
              >
                {tag.name}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
      <AppText style={tpStyles.hint}>
        {selectedTagIds.length}/{MAX_TAGS} selected
        {selectedTagIds.length >= MAX_TAGS ? ' · limit reached' : ''}
      </AppText>
    </View>
  );
}

const tpStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE8DF',
    backgroundColor: '#FFFDF8',
  },
  pillDisabled: {
    opacity: 0.4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4F42',
  },
  pillTextSelected: {
    color: '#fff',
  },
  hint: {
    fontSize: 11,
    color: '#C4BAB0',
    fontWeight: '500',
    marginTop: 8,
  },
  loading: {
    fontSize: 13,
    color: '#C4BAB0',
  },
});

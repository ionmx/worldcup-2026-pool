import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, SectionList, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { MatchCard } from '../../components/MatchCard';
import { FilterBar, MatchFilter } from '../../components/FilterBar';
import { Match } from '@prode/shared';

type MatchSection = { title: string; data: Match[] };
type MatchLocation = { sectionIndex: number; itemIndex: number };

const GROUP_KEY = '@prode/selectedGroup';

const GroupChips: React.FC<{
  letters: string[];
  selected: string | null;
  onSelect: (l: string) => void;
}> = ({ letters, selected, onSelect }) => (
  <View style={chipStyles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.scroll}
    >
      {letters.map(l => (
        <TouchableOpacity
          key={l}
          style={[chipStyles.chip, selected === l && chipStyles.chipActive]}
          onPress={() => onSelect(l)}
          activeOpacity={0.7}
        >
          <Text style={[chipStyles.label, selected === l && chipStyles.labelActive]}>
            {l}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const normalize = (value: string) => value.trim().toLowerCase();

const matchContains = (match: Match, query: string) => {
  if (!query) return true;

  return [
    match.home,
    match.homeName,
    match.away,
    match.awayName,
  ]
    .filter(Boolean)
    .some((value) => normalize(String(value)).includes(query));
};

const filterSections = (sections: MatchSection[], query: string): MatchSection[] => {
  if (!query) return sections;
  return sections
    .map((section) => ({
      ...section,
      data: section.data.filter((match) => matchContains(match, query)),
    }))
    .filter((section) => section.data.length > 0);
};

const findNextMatchLocation = (sections: MatchSection[]): MatchLocation | null => {
  const now = Date.now();

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const itemIndex = sections[sectionIndex].data.findIndex((match) => match.timestamp * 1000 >= now);
    if (itemIndex >= 0) return { sectionIndex, itemIndex };
  }

  const lastSectionIndex = sections.length - 1;
  if (lastSectionIndex < 0) return null;

  const lastItemIndex = sections[lastSectionIndex].data.length - 1;
  if (lastItemIndex < 0) return null;

  return { sectionIndex: lastSectionIndex, itemIndex: lastItemIndex };
};

export const MatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<MatchFilter>('date');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { sections, predictions, loading, refreshing, refresh } = useMatches(filter);
  const listRef = useRef<SectionList<Match>>(null);
  const autoScrollKeyRef = useRef('');
  const pendingLocationRef = useRef<MatchLocation | null>(null);

  useEffect(() => {
    if (filter === 'group') {
      AsyncStorage.getItem(GROUP_KEY)
        .then(val => {
          const fallback = sections.find((section) => section.data.length > 0)?.title.replace('Grupo ', '') ?? 'A';
          const exists = val && sections.some((section) => section.title === `Grupo ${val}` && section.data.length > 0);
          setSelectedGroup(exists ? val : fallback);
        })
        .catch(() => setSelectedGroup('A'));
      return;
    }

    setSelectedGroup(null);
  }, [filter, sections]);

  const groupLetters = useMemo(() => (
    filter === 'group'
      ? sections.filter((section) => section.data.length > 0).map(s => s.title.replace('Grupo ', ''))
      : []
  ), [filter, sections]);

  const visibleSections = useMemo(() => (
    filter === 'group' && selectedGroup
      ? sections.filter(s => s.title === `Grupo ${selectedGroup}` && s.data.length > 0)
      : sections
  ), [filter, sections, selectedGroup]);

  const query = useMemo(() => (
    filter === 'group' ? '' : normalize(searchQuery)
  ), [filter, searchQuery]);

  const filteredSections = useMemo(() => (
    filterSections(visibleSections, query)
  ), [query, visibleSections]);

  const autoScrollKey = useMemo(() => (
    `${filter}:${sections.length}:${sections.map((s) => `${s.title}-${s.data.length}`).join('|')}`
  ), [filter, sections]);

  const selectGroup = useCallback((letter: string) => {
    setSelectedGroup(letter);
    AsyncStorage.setItem(GROUP_KEY, letter).catch(() => {});

    const section = sections.find(s => s.title === `Grupo ${letter}`);
    if (!section || section.data.length === 0) return;

    setTimeout(() => {
      listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: false });
    }, 50);
  }, [sections]);

  useEffect(() => {
    if (loading || filter !== 'date' || query || filteredSections.length === 0) return;
    if (autoScrollKeyRef.current === autoScrollKey) return;

    const location = findNextMatchLocation(filteredSections);
    if (!location) return;

    autoScrollKeyRef.current = autoScrollKey;
    pendingLocationRef.current = location;

    const timeout = setTimeout(() => {
      listRef.current?.scrollToLocation({
        ...location,
        animated: false,
        viewPosition: 0.08,
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [autoScrollKey, filter, filteredSections, loading, query]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterBar active={filter} onChange={setFilter} />

      {filter === 'group' && groupLetters.length > 0 ? (
        <GroupChips
          letters={groupLetters}
          selected={selectedGroup}
          onSelect={selectGroup}
        />
      ) : (
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar equipo"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.clearSearch} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Limpiar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <SectionList
        ref={listRef}
        sections={filteredSections}
        keyExtractor={(item: Match) => String(item.game)}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            userId={user?.uid}
            prediction={predictions[String(item.game)]}
            showDate={filter !== 'date'}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        onScrollToIndexFailed={() => {
          const location = pendingLocationRef.current;
          if (!location) return;
          setTimeout(() => {
            listRef.current?.scrollToLocation({
              ...location,
              animated: false,
              viewPosition: 0.08,
            });
          }, 250);
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {query
                ? 'No encontramos partidos para esa búsqueda'
                : filter === 'knockout'
                ? 'Los partidos de eliminatoria aparecerán cuando avance el torneo'
                : 'No hay partidos disponibles'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const chipStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  scroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  chip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: '#22c55e' },
  label: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  labelActive: { color: '#fff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 32 },
  list: { paddingBottom: 32, paddingTop: 8 },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderBottomColor: '#1e293b',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 10,
    borderWidth: 1,
    color: '#fff',
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearSearch: { paddingHorizontal: 2, paddingVertical: 8 },
  clearSearchText: { color: '#22c55e', fontSize: 13, fontWeight: '700' },
  sectionHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

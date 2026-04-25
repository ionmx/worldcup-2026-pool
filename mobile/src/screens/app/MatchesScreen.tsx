import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, SectionList, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView, TextInput, SectionListData, SectionListRenderItemInfo,
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

const getMatchAtLocation = (sections: MatchSection[], location: MatchLocation | null): Match | null => {
  if (!location) return null;
  return sections[location.sectionIndex]?.data[location.itemIndex] ?? null;
};

const formatMatchDateTime = (match: Match) => {
  const date = new Date(match.date);
  const day = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

export const MatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<MatchFilter>('date');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { sections, predictions, loading, refreshing, refresh } = useMatches(filter);
  const listRef = useRef<SectionList<Match, MatchSection>>(null);
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

  const nextMatchLocation = useMemo(() => (
    filter === 'date' && !query ? findNextMatchLocation(filteredSections) : null
  ), [filter, filteredSections, query]);

  const nextMatch = useMemo(() => (
    getMatchAtLocation(filteredSections, nextMatchLocation)
  ), [filteredSections, nextMatchLocation]);

  const handleFilterChange = useCallback((nextFilter: MatchFilter) => {
    if (nextFilter === filter) return;
    setFilter(nextFilter);
  }, [filter]);

  const selectGroup = useCallback((letter: string) => {
    setSelectedGroup(letter);
    AsyncStorage.setItem(GROUP_KEY, letter).catch(() => {});

    const section = sections.find(s => s.title === `Grupo ${letter}`);
    if (!section || section.data.length === 0) return;

    setTimeout(() => {
      listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: false });
    }, 50);
  }, [sections]);

  const scrollToNextMatch = useCallback(() => {
    if (!nextMatchLocation) return;
    pendingLocationRef.current = nextMatchLocation;
    listRef.current?.scrollToLocation({
      ...nextMatchLocation,
      animated: true,
      viewPosition: 0.08,
    });
  }, [nextMatchLocation]);

  const renderMatch = useCallback(({ item }: SectionListRenderItemInfo<Match, MatchSection>) => (
    <MatchCard
      match={item}
      userId={user?.uid}
      prediction={predictions[String(item.game)]}
      showDate={filter !== 'date'}
    />
  ), [filter, predictions, user?.uid]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionListData<Match, MatchSection> }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

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
      <FilterBar active={filter} onChange={handleFilterChange} />

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

      {nextMatch ? (
        <TouchableOpacity style={styles.nextMatch} onPress={scrollToNextMatch} activeOpacity={0.8}>
          <View style={styles.nextMatchCopy}>
            <Text style={styles.nextMatchLabel}>Próximo partido</Text>
            <Text style={styles.nextMatchTeams} numberOfLines={1}>
              {nextMatch.homeName || nextMatch.home} vs {nextMatch.awayName || nextMatch.away}
            </Text>
            <Text style={styles.nextMatchMeta}>{formatMatchDateTime(nextMatch)}</Text>
          </View>
          <Text style={styles.nextMatchAction}>Ver</Text>
        </TouchableOpacity>
      ) : null}

      <SectionList
        ref={listRef}
        sections={filteredSections}
        keyExtractor={(item: Match) => String(item.game)}
        renderItem={renderMatch}
        renderSectionHeader={renderSectionHeader}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={40}
        windowSize={5}
        removeClippedSubviews
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
  nextMatch: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nextMatchCopy: { flex: 1, marginRight: 12 },
  nextMatchLabel: { color: '#22c55e', fontSize: 12, fontWeight: '800', marginBottom: 3, textTransform: 'uppercase' },
  nextMatchTeams: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nextMatchMeta: { color: '#94a3b8', fontSize: 13, marginTop: 3 },
  nextMatchAction: { color: '#22c55e', fontSize: 14, fontWeight: '800' },
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

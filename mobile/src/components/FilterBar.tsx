import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export type MatchFilter = 'date' | 'group' | 'knockout';

interface Props {
  active: MatchFilter;
  onChange: (f: MatchFilter) => void;
}

const TABS: { key: MatchFilter; label: string }[] = [
  { key: 'date', label: 'Por fecha' },
  { key: 'group', label: 'Grupos' },
  { key: 'knockout', label: 'Eliminatoria' },
];

export const FilterBar: React.FC<Props> = ({ active, onChange }) => (
  <View style={styles.container}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && styles.tabActive]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[styles.label, active === tab.key && styles.labelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  scroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#1e293b',
  },
  tabActive: { backgroundColor: '#22c55e' },
  label: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  labelActive: { color: '#fff', fontWeight: '700' },
});

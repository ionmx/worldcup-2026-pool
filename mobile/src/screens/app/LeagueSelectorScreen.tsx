import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLeague } from '../../context/LeagueContext';
import { useNavigation } from '@react-navigation/native';
import { LeagueWithId } from '@prode/shared';

export const LeagueSelectorScreen: React.FC = () => {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const navigation = useNavigation();

  const select = (league: LeagueWithId) => {
    setSelectedLeague(league);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elegí una liga</Text>
      <FlatList
        data={leagues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const active = item.id === selectedLeague?.id;
          return (
            <TouchableOpacity
              style={[styles.card, active && styles.cardActive]}
              onPress={() => select(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.leagueName}>{item.name}</Text>
                {active && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Actual</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.leagueMeta, active && styles.leagueMetaActive]}>
                  {item.memberCount ?? 0} miembros
                </Text>
                {active && <Text style={styles.check}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No tenés ligas. Creá o unite a una desde la pestaña Ligas.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
  },
  cardActive: { backgroundColor: '#15303b', borderColor: '#22c55e' },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  leagueName: { color: '#fff', fontSize: 17, fontWeight: '600' },
  leagueMeta: { color: '#64748b', fontSize: 13 },
  leagueMetaActive: { color: '#94a3b8' },
  currentBadge: { backgroundColor: '#22c55e', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  currentBadgeText: { color: '#052e16', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  check: { color: '#22c55e', fontSize: 20, fontWeight: '900' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 32, fontSize: 15 },
});

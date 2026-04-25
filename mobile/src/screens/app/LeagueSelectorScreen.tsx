import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLeague } from '../../context/LeagueContext';
import { useNavigation } from '@react-navigation/native';
import { LeagueWithId } from '@prode/shared';

export const LeagueSelectorScreen: React.FC = () => {
  const { leagues, setSelectedLeague } = useLeague();
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => select(item)}>
            <Text style={styles.leagueName}>{item.name}</Text>
            <Text style={styles.leagueMeta}>{item.memberCount ?? 0} miembros</Text>
          </TouchableOpacity>
        )}
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
  leagueName: { color: '#fff', fontSize: 17, fontWeight: '600' },
  leagueMeta: { color: '#64748b', fontSize: 13, marginTop: 4 },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 32, fontSize: 15 },
});

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLeague } from '../../context/LeagueContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LeagueWithId } from '@prode/shared';

export const LeaguesScreen: React.FC = () => {
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderLeague = ({ item }: { item: LeagueWithId }) => (
    <TouchableOpacity
      style={[styles.card, selectedLeague?.id === item.id && styles.cardActive]}
      onPress={() => setSelectedLeague(item)}
    >
      <View style={styles.cardBody}>
        <Text style={styles.leagueName}>{item.name}</Text>
        {item.description ? <Text style={styles.leagueDesc}>{item.description}</Text> : null}
        <Text style={styles.leagueMeta}>{item.memberCount ?? 0} miembros</Text>
      </View>
      <View style={styles.cardActions}>
        {selectedLeague?.id === item.id && <Text style={styles.check}>✓</Text>}
        <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate('LeagueDetail', { league: item })}>
          <Text style={styles.detailButtonText}>Detalle</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leagues}
        keyExtractor={(item) => item.id}
        renderItem={renderLeague}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>Todavía no tenés ligas</Text>
            <Text style={styles.emptyText}>Creá una o unite con un código de invitación</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NewLeague')}>
              <Text style={styles.buttonText}>+ Crear liga</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.navigate('JoinLeague')}>
              <Text style={styles.buttonText}>Unirse con código</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155',
  },
  cardActive: { borderColor: '#22c55e', backgroundColor: '#15303b' },
  cardBody: { flex: 1 },
  cardActions: { alignItems: 'flex-end', gap: 8, marginLeft: 12 },
  leagueName: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 2 },
  leagueDesc: { color: '#94a3b8', fontSize: 14, marginBottom: 4 },
  leagueMeta: { color: '#64748b', fontSize: 13 },
  check: { color: '#22c55e', fontSize: 20, fontWeight: 'bold' },
  detailButton: { backgroundColor: '#334155', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  detailButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#94a3b8', textAlign: 'center' },
  actions: { gap: 12, marginTop: 8 },
  button: { backgroundColor: '#22c55e', borderRadius: 10, padding: 14, alignItems: 'center' },
  buttonSecondary: { backgroundColor: '#334155' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserWithId } from '@prode/shared';
import { useLeague } from '../../context/LeagueContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { subscribeToLeagueMembers } from '../../services/leagueService';
import { subscribeToLeaderboard } from '../../services/userService';

export const StandingsScreen: React.FC = () => {
  const { selectedLeague, leagues } = useLeague();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [members, setMembers] = useState<UserWithId[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLeague) {
      setMembers([]);
      setMemberIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribeMembers = subscribeToLeagueMembers(selectedLeague.id, (ids) => {
      setMemberIds(ids);
      if (ids.length === 0) {
        setMembers([]);
        setLoading(false);
      }
    });

    return unsubscribeMembers;
  }, [selectedLeague?.id]);

  useEffect(() => {
    if (!selectedLeague || memberIds.length === 0) return;

    const unsubscribeLeaderboard = subscribeToLeaderboard(memberIds, (users) => {
      setMembers(users);
      setLoading(false);
    });

    return unsubscribeLeaderboard;
  }, [selectedLeague?.id, memberIds]);

  if (!selectedLeague) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>Seleccioná una liga</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LeagueSelector')}>
          <Text style={styles.buttonText}>Elegir liga</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {leagues.length > 0 && (
        <TouchableOpacity
          style={styles.leagueBanner}
          onPress={() => navigation.navigate('LeagueSelector')}
        >
          <Text style={styles.bannerLabel}>🏆 {selectedLeague.name}</Text>
          <Text style={styles.bannerChange}>Cambiar ›</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={[styles.position, index === 0 && styles.positionFirst]}>
              <Text style={styles.positionText}>{index + 1}</Text>
            </View>
            <Text style={styles.userName}>{item.displayName || 'Usuario'}</Text>
            <Text style={styles.score}>{item.score ?? 0} pts</Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#22c55e" style={styles.loader} />
          ) : (
            <Text style={styles.emptyText}>Todavía no hay miembros en esta liga.</Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  leagueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bannerLabel: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  bannerChange: { color: '#22c55e', fontSize: 13 },
  list: { padding: 16 },
  row: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  position: {
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  positionFirst: { backgroundColor: '#22c55e' },
  positionText: { color: '#fff', fontWeight: '800' },
  userName: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  score: { color: '#22c55e', fontSize: 16, fontWeight: '700' },
  loader: { marginTop: 24 },
  emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 24, textAlign: 'center' },
  empty: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  button: { backgroundColor: '#22c55e', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

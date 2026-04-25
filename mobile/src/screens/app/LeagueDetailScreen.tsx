import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LeagueWithId, UserWithId } from '@prode/shared';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useLeague } from '../../context/LeagueContext';
import {
  deleteLeague,
  leaveLeague,
  subscribeToLeagueMembers,
} from '../../services/leagueService';
import { subscribeToLeaderboard } from '../../services/userService';

type Props = NativeStackScreenProps<RootStackParamList, 'LeagueDetail'>;

export const LeagueDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const [league] = useState<LeagueWithId>(route.params.league);
  const [members, setMembers] = useState<UserWithId[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedLeague, setSelectedLeague } = useLeague();
  const isOwner = user?.uid === league.ownerId;

  useEffect(() => {
    setLoading(true);
    const unsubscribeMembers = subscribeToLeagueMembers(league.id, (ids) => {
      setMemberIds(ids);
      if (ids.length === 0) {
        setMembers([]);
        setLoading(false);
      }
    });

    return unsubscribeMembers;
  }, [league.id]);

  useEffect(() => {
    if (memberIds.length === 0) return;

    const unsubscribeLeaderboard = subscribeToLeaderboard(memberIds, (users) => {
      setMembers(users);
      setLoading(false);
    });

    return unsubscribeLeaderboard;
  }, [memberIds]);

  const showInviteCode = () => {
    Alert.alert('Código de invitación', league.inviteCode);
  };

  const goBackToLeagues = () => {
    navigation.navigate('App');
  };

  const handleLeave = () => {
    if (!user || isOwner) return;

    Alert.alert(
      'Salir de liga',
      `¿Seguro que querés salir de ${league.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              await leaveLeague(league.id, user.uid);
              if (selectedLeague?.id === league.id) setSelectedLeague(null);
              goBackToLeagues();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'No se pudo salir de la liga');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!isOwner) return;

    Alert.alert(
      'Eliminar liga',
      `¿Seguro que querés eliminar ${league.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              await deleteLeague(league.id, league.slug);
              if (selectedLeague?.id === league.id) setSelectedLeague(null);
              goBackToLeagues();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'No se pudo eliminar la liga');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item, index }: { item: UserWithId; index: number }) => (
    <View style={styles.memberCard}>
      <View style={styles.rank}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.displayName || item.userName || 'Usuario'}</Text>
        <Text style={styles.memberUser}>@{item.userName}</Text>
      </View>
      <Text style={styles.points}>{item.score ?? 0} pts</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.headerCard}>
              <Text style={styles.title}>{league.name}</Text>
              {league.description ? <Text style={styles.description}>{league.description}</Text> : null}
              <Text style={styles.meta}>{memberIds.length} miembros</Text>

              <TouchableOpacity style={styles.inviteButton} onPress={showInviteCode}>
                <Text style={styles.inviteLabel}>Invitar</Text>
                <Text style={styles.inviteCode}>{league.inviteCode}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Miembros</Text>
            {loading ? <ActivityIndicator color="#22c55e" style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? null : <Text style={styles.empty}>Todavía no hay miembros para mostrar.</Text>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.dangerButton, submitting && styles.buttonDisabled]}
            onPress={isOwner ? handleDelete : handleLeave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.dangerButtonText}>{isOwner ? 'Eliminar liga' : 'Salir de liga'}</Text>
            )}
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  list: { padding: 16 },
  headerCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  description: { color: '#94a3b8', fontSize: 15, marginBottom: 10 },
  meta: { color: '#64748b', fontSize: 13, marginBottom: 16 },
  inviteButton: {
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inviteLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  inviteCode: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  loader: { marginVertical: 18 },
  memberCard: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  rank: {
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  rankText: { color: '#fff', fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  memberUser: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  points: { color: '#22c55e', fontSize: 16, fontWeight: '700' },
  empty: { color: '#94a3b8', fontSize: 15, paddingVertical: 20, textAlign: 'center' },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    marginTop: 16,
    padding: 14,
  },
  buttonDisabled: { opacity: 0.6 },
  dangerButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLeague } from '../../context/LeagueContext';
import { logout } from '../../services/authService';
import { deleteUserAccount, updateUserProfile } from '../../services/userService';

export const ProfileScreen: React.FC = () => {
  const { user, userData, setUserData } = useAuth();
  const { leagues } = useLeague();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDisplayName(userData?.displayName ?? '');
  }, [userData?.displayName]);

  const handleSave = async () => {
    if (!user || !userData) return;
    const name = displayName.trim();
    if (!name) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.uid, name);
      setUserData({ ...userData, displayName: name });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user || !userData) return;

    const ownedLeagues = leagues.filter((l) => l.ownerId === user.uid);
    if (ownedLeagues.length > 0) {
      const names = ownedLeagues.map((l) => l.name).join(', ');
      Alert.alert(
        'No podés eliminar tu cuenta',
        `Sos dueño de ${ownedLeagues.length === 1 ? 'la liga' : 'las ligas'}: ${names}.\n\nPrimero transferí la dueñía a otro miembro o eliminá cada liga desde su detalle.`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    Alert.alert(
      'Eliminar cuenta',
      'Se van a borrar tus datos, predicciones y membresías de ligas. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteUserAccount(user.uid);
              await logout();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'No se pudo eliminar la cuenta');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const initials = (userData?.displayName || user?.displayName || 'U').slice(0, 1).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        {userData?.photoURL ? (
          <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
      </View>

      {!editing ? (
        <View style={styles.card}>
          <Text style={styles.name}>{userData?.displayName || user?.displayName || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Puntos totales</Text>
            <Text style={styles.score}>{userData?.score ?? 0}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.formTitle}>Editar perfil</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor="#64748b"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={40}
          />
          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditing(false)} disabled={saving}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, deleting && styles.buttonDisabled]}
        onPress={handleDeleteAccount}
        disabled={deleting}
      >
        {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24 },
  avatarWrap: { alignItems: 'center', marginVertical: 20 },
  avatar: { borderRadius: 48, height: 96, width: 96 },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 48,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarText: { color: '#22c55e', fontSize: 36, fontWeight: '800' },
  card: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  email: { color: '#94a3b8', fontSize: 15, marginTop: 6, textAlign: 'center' },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    marginVertical: 20,
    padding: 16,
  },
  scoreLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  score: { color: '#22c55e', fontSize: 32, fontWeight: '800' },
  formTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: 10,
    borderWidth: 1,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    padding: 14,
  },
  button: { alignItems: 'center', backgroundColor: '#22c55e', borderRadius: 10, padding: 14 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: { alignItems: 'center', borderRadius: 10, marginTop: 10, padding: 12 },
  secondaryButtonText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
  logoutButton: { alignItems: 'center', backgroundColor: '#334155', borderRadius: 10, marginTop: 18, padding: 14 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: { alignItems: 'center', backgroundColor: '#ef4444', borderRadius: 10, marginTop: 12, padding: 14 },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

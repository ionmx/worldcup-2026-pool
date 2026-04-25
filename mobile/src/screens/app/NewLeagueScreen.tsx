import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useLeague } from '../../context/LeagueContext';
import { createLeague } from '../../services/leagueService';

type Props = NativeStackScreenProps<RootStackParamList, 'NewLeague'>;

export const NewLeagueScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { setSelectedLeague } = useLeague();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const finalName = name.trim();
    const finalDescription = description.trim();

    if (!user) {
      Alert.alert('Error', 'Necesitas iniciar sesion para crear una liga');
      return;
    }

    if (!finalName) {
      Alert.alert('Error', 'Ingresa un nombre para la liga');
      return;
    }

    setLoading(true);
    try {
      const league = await createLeague(finalName, user.uid, {
        description: finalDescription || undefined,
      });
      setSelectedLeague(league);
      navigation.replace('LeagueDetail', { league });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo crear la liga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Crear liga</Text>
      <Text style={styles.subtitle}>Armá una liga para competir con tu grupo.</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la liga"
        placeholderTextColor="#64748b"
        value={name}
        onChangeText={setName}
        maxLength={60}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción opcional"
        placeholderTextColor="#64748b"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={160}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear liga</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 15, marginBottom: 24 },
  input: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 10,
    borderWidth: 1,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    padding: 14,
  },
  textArea: { minHeight: 108, textAlignVertical: 'top' },
  button: { alignItems: 'center', backgroundColor: '#22c55e', borderRadius: 10, marginTop: 8, padding: 14 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

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
import { getLeagueByInviteCode, joinLeague } from '../../services/leagueService';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinLeague'>;

export const JoinLeagueScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { setSelectedLeague } = useLeague();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const finalCode = code.trim().toUpperCase();

    if (!user) {
      Alert.alert('Error', 'Necesitas iniciar sesion para unirte a una liga');
      return;
    }

    if (finalCode.length !== 6) {
      Alert.alert('Error', 'El codigo tiene que tener 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const league = await getLeagueByInviteCode(finalCode);
      if (!league) {
        Alert.alert('No encontramos esa liga', 'Revisa el codigo e intenta otra vez');
        return;
      }

      await joinLeague(league.id, user.uid, finalCode);
      setSelectedLeague(league);
      navigation.replace('LeagueDetail', { league });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo unir a la liga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Unirse a liga</Text>
      <Text style={styles.subtitle}>Ingresá el código de invitación de 6 caracteres.</Text>

      <TextInput
        style={styles.codeInput}
        placeholder="ABC123"
        placeholderTextColor="#64748b"
        value={code}
        onChangeText={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Unirme</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 15, marginBottom: 24 },
  codeInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 10,
    borderWidth: 1,
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    marginBottom: 16,
    padding: 16,
    textAlign: 'center',
  },
  button: { alignItems: 'center', backgroundColor: '#22c55e', borderRadius: 10, padding: 14 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

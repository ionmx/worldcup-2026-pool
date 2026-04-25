import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { loginWithEmail, signInWithGoogleToken, useGoogleAuthRequest } from '../../services/authService';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

const GOOGLE_CONFIGURED = !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Componente separado para que el hook solo se monte cuando Google está configurado
const GoogleSignInButton: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const [request, response, promptAsync] = useGoogleAuthRequest();

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      signInWithGoogleToken(access_token).catch((e) => Alert.alert('Error', e.message));
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={[styles.button, styles.googleButton]}
      onPress={() => promptAsync()}
      disabled={!request || disabled}
    >
      <Text style={styles.buttonText}>Continuar con Google</Text>
    </TouchableOpacity>
  );
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>⚽ Prode 2026</Text>
      <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleEmailLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
      </TouchableOpacity>

      {GOOGLE_CONFIGURED && <GoogleSignInButton disabled={loading} />}

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#1e293b', color: '#fff', borderRadius: 10, padding: 14,
    marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#334155',
  },
  button: {
    backgroundColor: '#22c55e', borderRadius: 10, padding: 14,
    alignItems: 'center', marginBottom: 12,
  },
  googleButton: { backgroundColor: '#4285f4' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: '#94a3b8', textAlign: 'center', marginTop: 8 },
});

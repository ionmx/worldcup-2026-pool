import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import {
  loginWithIdentifier,
  resetPassword,
  signInWithGoogleToken,
  useGoogleAuthRequest,
} from '../../services/authService';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

const GOOGLE_CONFIGURED = !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!identifier || !password) return;
    setLoading(true);
    try {
      await loginWithIdentifier(identifier.trim(), password);
    } catch {
      Alert.alert('Error', 'No pudimos iniciar sesión con esos datos');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!identifier) {
      Alert.alert('Recuperar contraseña', 'Ingresá tu email primero');
      return;
    }
    setLoading(true);
    await resetPassword(identifier.trim());
    setLoading(false);
    Alert.alert('Listo', 'Si existe una cuenta con ese email, te mandamos un enlace para restablecer tu contraseña.');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>⚽ Prode 2026</Text>
      <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={identifier}
        onChangeText={setIdentifier}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)}>
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
        <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 14,
    fontSize: 16,
  },
  eyeButton: { paddingHorizontal: 14 },
  eyeIcon: { fontSize: 18 },
  button: {
    backgroundColor: '#22c55e', borderRadius: 10, padding: 14,
    alignItems: 'center', marginBottom: 12,
  },
  googleButton: { backgroundColor: '#4285f4' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  forgotLink: { color: '#22c55e', textAlign: 'right', marginBottom: 16, fontWeight: '600' },
  link: { color: '#94a3b8', textAlign: 'center', marginTop: 8 },
});

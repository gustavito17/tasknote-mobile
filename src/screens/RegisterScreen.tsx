import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '../components';

interface RegisterScreenProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onNavigateToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export function RegisterScreen({ onRegister, onNavigateToLogin, isLoading, error }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (username && email && password && password === confirmPassword) {
      onRegister(username, email, password);
    }
  };

  const passwordsMatch = password === confirmPassword || !confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>📝</Text>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a TaskNote</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, !passwordsMatch && styles.inputError]}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!passwordsMatch ? (
              <Text style={styles.error}>Las contraseñas no coinciden</Text>
            ) : null}

            <Button
              title="Registrarse"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!username || !email || !password || !passwordsMatch}
            />

            <Button
              title="Ya tengo cuenta"
              onPress={onNavigateToLogin}
              variant="secondary"
              style={styles.loginButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});

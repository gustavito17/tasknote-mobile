import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigateToRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginScreen({ onLogin, onNavigateToRegister, isLoading, error }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>📝</Text>
          <Text style={styles.title}>TaskNote</Text>
          <Text style={styles.subtitle}>Gestiona tus tareas y notas</Text>
        </View>

        <View style={styles.form}>
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Iniciar Sesión"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!email || !password}
          />

          <Button
            title="Crear Cuenta"
            onPress={onNavigateToRegister}
            variant="secondary"
            style={styles.registerButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
    fontSize: 32,
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
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 8,
  },
});

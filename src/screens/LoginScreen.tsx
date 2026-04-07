import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '../components';
import { Input } from '../components';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';

interface LoginScreenProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onNavigateToRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginScreen({ onLogin, onNavigateToRegister, isLoading, error }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (email && password) {
      onLogin({ email, password });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>G</Text>
            </View>
            <Text style={styles.title}>GusPad</Text>
            <Text style={styles.subtitle}>Gestiona tus tareas y notas</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Correo electrónico"
              placeholder="Ingrese su correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Contraseña"
              placeholder="Ingrese su contraseña"
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
              style={styles.submitButton}
            />

            <Button
              title="Crear Cuenta"
              onPress={onNavigateToRegister}
              variant="secondary"
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 38,
    fontFamily: FontFamily.headingBold,
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
  },
  form: {
    gap: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  error: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});

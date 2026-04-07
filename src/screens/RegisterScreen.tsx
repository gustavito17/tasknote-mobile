import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '../components';
import { Input } from '../components';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';

interface RegisterScreenProps {
  onRegister: (credentials: { username: string; email: string; password: string }) => Promise<void>;
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
      onRegister({ username, email, password });
    }
  };

  const passwordsMatch = password === confirmPassword || !confirmPassword;

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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a GusPad</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre de usuario"
              placeholder="Ingrese su nombre"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
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
            <Input
              label="Confirmar contraseña"
              placeholder="Repita su contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={!passwordsMatch ? 'Las contraseñas no coinciden' : undefined}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Registrarse"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!username || !email || !password || !passwordsMatch}
              style={styles.submitButton}
            />

            <Button
              title="Ya tengo cuenta"
              onPress={onNavigateToLogin}
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
    marginBottom: Spacing.xl,
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
    fontSize: FontSize.xl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
  },
  form: {
    gap: Spacing.xs,
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

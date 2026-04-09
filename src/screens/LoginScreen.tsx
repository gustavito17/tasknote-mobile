import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../components';
import { Input } from '../components';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';

interface LoginScreenProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onLoginWithGoogle: () => Promise<void>;
  onNavigateToRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginScreen({ onLogin, onLoginWithGoogle, onNavigateToRegister, isLoading, error }: LoginScreenProps) {
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

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={onLoginWithGoogle} disabled={isLoading}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continuar con Google</Text>
            </TouchableOpacity>

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
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { fontSize: FontSize.xs, fontFamily: FontFamily.body, color: Colors.textMuted },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 13,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.divider,
    backgroundColor: Colors.surface, marginBottom: Spacing.xs,
  },
  googleIcon: {
    fontSize: FontSize.md, fontFamily: FontFamily.headingBold,
    color: '#4285F4', width: 20, textAlign: 'center',
  },
  googleText: {
    fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold, color: Colors.textPrimary,
  },
});

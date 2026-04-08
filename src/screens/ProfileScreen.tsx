import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const initials = user?.username?.charAt(0).toUpperCase() || '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const handleLogout = useCallback(() => { logout(); }, [logout]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Brand header */}
      <Text style={styles.brand}>GusPad</Text>

      {/* Avatar */}
      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {/* Info card */}
      <View style={styles.card}>
        <InfoRow label="Usuario" value={user?.username ?? '—'} />
        <View style={styles.divider} />
        <InfoRow label="Correo" value={user?.email ?? '—'} />
        <View style={styles.divider} />
        <InfoRow label="Miembro desde" value={memberSince} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  brand: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  avatarRing: {
    padding: 3,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.secondary,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 88, height: 88, borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontSize: 38, fontFamily: FontFamily.headingBold, color: Colors.secondary,
  },
  username: {
    fontSize: FontSize.xl, fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary, letterSpacing: 0.5, marginBottom: 4,
  },
  email: {
    fontSize: FontSize.sm, fontFamily: FontFamily.body,
    color: Colors.textMuted, marginBottom: Spacing.xl,
  },
  card: {
    width: '100%', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.divider,
    marginBottom: Spacing.xl, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
  },
  infoLabel: {
    fontSize: FontSize.sm, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textMuted, letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: FontSize.sm, fontFamily: FontFamily.body,
    color: Colors.textPrimary, maxWidth: '55%', textAlign: 'right',
  },
  divider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.md },
  logoutButton: {
    width: '100%', borderWidth: 1,
    borderColor: Colors.error + '66',
    borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center',
  },
  logoutText: {
    color: Colors.error, fontSize: FontSize.md,
    fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.3,
  },
});

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString() 
                : '-'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
  },
  infoSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#3C3C43',
  },
  infoValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

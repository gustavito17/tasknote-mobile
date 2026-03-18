import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../context';

export function OfflineBanner() {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sin conexión - Modo offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

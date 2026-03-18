import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingProps {
  message?: string;
}

export function Loading({ message }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
});

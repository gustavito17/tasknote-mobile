import React from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <RNTextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#8E8E93"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});

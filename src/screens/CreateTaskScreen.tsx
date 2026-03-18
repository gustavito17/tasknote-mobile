import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useTasks } from '../context';

type CreateTaskScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export function CreateTaskScreen({ navigation }: CreateTaskScreenProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await createTask({ title: title.trim(), description: description.trim() });
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  }, [title, description, createTask, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChangeText={setTitle}
            maxLength={255}
            autoFocus
          />

          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agrega más detalles..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Crear"
              onPress={handleCreate}
              loading={isLoading}
              disabled={!title.trim()}
              style={styles.button}
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
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});

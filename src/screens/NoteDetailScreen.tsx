import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Loading } from '../components';
import { useNotes } from '../context';

type NoteDetailScreenProps = NativeStackScreenProps<any, 'NoteDetail'>;

export function NoteDetailScreen({ navigation, route }: NoteDetailScreenProps) {
  const { noteId } = route.params;
  const { currentNote, fetchNoteById, updateNote, deleteNote, clearCurrentNote } = useNotes();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNoteById(noteId);
    return () => clearCurrentNote();
  }, [noteId]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content || '');
    }
  }, [currentNote]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      await updateNote(noteId, { title: title.trim(), content: content.trim() });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la nota');
    } finally {
      setIsLoading(false);
    }
  }, [title, content, noteId, updateNote]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(noteId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [noteId, deleteNote, navigation]);

  if (!currentNote) {
    return <Loading message="Cargando nota..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>
            Última edición: {new Date(currentNote.updatedAt).toLocaleString()}
          </Text>
          {!isEditing && (
            <View style={styles.actions}>
              <Button
                title="Editar"
                onPress={() => setIsEditing(true)}
                variant="secondary"
                style={styles.actionButton}
              />
              <Button
                title="Eliminar"
                onPress={handleDelete}
                variant="danger"
                style={styles.actionButton}
              />
            </View>
          )}
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Título de la nota"
              maxLength={255}
            />
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Contenido de la nota..."
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
            <View style={styles.editButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setTitle(currentNote.title);
                  setContent(currentNote.content || '');
                  setIsEditing(false);
                }}
                variant="secondary"
                style={styles.editButton}
              />
              <Button
                title="Guardar"
                onPress={handleSave}
                loading={isLoading}
                disabled={!title.trim()}
                style={styles.editButton}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{currentNote.title}</Text>
            <Text style={styles.content}>{currentNote.content || 'Sin contenido'}</Text>
          </>
        )}
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
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 12,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 26,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 300,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
  },
});

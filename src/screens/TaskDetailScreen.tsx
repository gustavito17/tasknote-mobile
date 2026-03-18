import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, NoteCard, Loading, EmptyState } from '../components';
import { useTasks, useNotes } from '../context';

type TaskDetailScreenProps = NativeStackScreenProps<any, 'TaskDetail'>;

export function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { taskId } = route.params;
  const { currentTask, fetchTaskById, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { notes, fetchNotesByTaskId, deleteNote } = useNotes();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTaskById(taskId);
    fetchNotesByTaskId(taskId);
  }, [taskId]);

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
    }
  }, [currentTask]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      await updateTask(taskId, { title: title.trim(), description: description.trim() });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    } finally {
      setIsLoading(false);
    }
  }, [title, description, taskId, updateTask]);

  const handleToggleStatus = useCallback(() => {
    const newStatus = currentTask?.status === 'pending' ? 'completed' : 'pending';
    updateTaskStatus(taskId, newStatus);
  }, [currentTask?.status, taskId, updateTaskStatus]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea? Se eliminarán también todas las notas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [taskId, deleteTask, navigation]);

  const handleDeleteNote = useCallback((noteId: number) => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteNote(noteId),
        },
      ]
    );
  }, [deleteNote]);

  const handleNotePress = useCallback((noteId: number) => {
    navigation.navigate('NoteDetail', { noteId, taskId });
  }, [navigation, taskId]);

  const handleCreateNote = useCallback(() => {
    navigation.navigate('CreateNote', { taskId });
  }, [navigation, taskId]);

  if (!currentTask) {
    return <Loading message="Cargando tarea..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.taskSection}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Título de la tarea"
                maxLength={255}
              />
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción (opcional)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.editButtons}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setTitle(currentTask.title);
                    setDescription(currentTask.description || '');
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  style={styles.editButton}
                />
                <Button
                  title="Guardar"
                  onPress={handleSave}
                  loading={isLoading}
                  style={styles.editButton}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.taskHeader}>
                <TouchableOpacity
                  style={[styles.statusBadge, currentTask.status === 'completed' && styles.statusCompleted]}
                  onPress={handleToggleStatus}
                >
                  <Text style={styles.statusText}>
                    {currentTask.status === 'pending' ? 'Pendiente' : 'Completada'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                    <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.title}>{currentTask.title}</Text>
              {currentTask.description ? (
                <Text style={styles.description}>{currentTask.description}</Text>
              ) : null}
              <Text style={styles.date}>
                Creada: {new Date(currentTask.createdAt).toLocaleDateString()}
              </Text>
            </>
          )}
        </View>

        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>Notas ({notes.length})</Text>
            <TouchableOpacity style={styles.addNoteButton} onPress={handleCreateNote}>
              <Text style={styles.addNoteText}>+ Nueva Nota</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <View style={styles.emptyNotes}>
              <Text style={styles.emptyText}>No hay notas todavía</Text>
              <Button
                title="Crear Nota"
                onPress={handleCreateNote}
                variant="secondary"
              />
            </View>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => handleNotePress(note.id)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))
          )}
        </View>
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
  taskSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FF9500',
  },
  statusCompleted: {
    backgroundColor: '#34C759',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  actionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#3C3C43',
    marginBottom: 12,
    lineHeight: 24,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 12,
    marginBottom: 16,
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addNoteButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addNoteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyNotes: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
});

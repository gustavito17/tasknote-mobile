import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

function NoteCardComponent({ note, onPress, onDelete }: NoteCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        {note.content ? (
          <Text style={styles.preview} numberOfLines={2}>
            {note.content}
          </Text>
        ) : null}
        <Text style={styles.date}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export const NoteCard = memo(NoteCardComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

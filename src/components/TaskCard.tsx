import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleStatus: () => void;
}

function TaskCardComponent({ task, onPress, onToggleStatus }: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={onToggleStatus}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <Text style={styles.date}>
          {new Date(task.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export const TaskCard = memo(TaskCardComponent);

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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#C7C7CC',
  },
});

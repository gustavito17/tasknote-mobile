import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';

export interface FolderTag {
  label: string;
  color: string;
}

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  folderTag?: FolderTag;
}

export function parseDateBadge(description: string | null): { date: string | null; text: string } {
  if (!description) return { date: null, text: '' };
  const match = description.match(/^📅 (.+?)\n([\s\S]*)$/);
  if (match) return { date: match[1], text: match[2].trim() };
  return { date: null, text: description };
}

export function TaskRow({ task, onToggle, onDelete, folderTag }: TaskRowProps) {
  const isCompleted = task.status === 'completed';
  const { date, text } = parseDateBadge(task.description ?? null);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar tarea',
      '¿Eliminar esta tarea permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <View style={[styles.row, isCompleted && styles.rowCompleted]}>
      {/* Checkbox — solo toggle */}
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxDone]}
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Contenido */}
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, isCompleted && styles.rowTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        {text ? <Text style={styles.rowDesc} numberOfLines={1}>{text}</Text> : null}
        <View style={styles.badgeRow}>
          {date ? <Text style={styles.dateBadge}>📅 {date}</Text> : null}
          {folderTag ? (
            <View style={[styles.folderTag, { backgroundColor: folderTag.color + '28', borderColor: folderTag.color + '70' }]}>
              <View style={[styles.folderDot, { backgroundColor: folderTag.color }]} />
              <Text style={[styles.folderTagText, { color: folderTag.color }]}>{folderTag.label}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Eliminar */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={confirmDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginVertical: 2,
  },
  rowCompleted: { opacity: 0.45 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  checkboxDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  checkmark: { color: Colors.primary, fontSize: 13, fontFamily: FontFamily.headingBold },
  rowContent: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  rowTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  rowDesc: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  dateBadge: { fontSize: FontSize.xs, fontFamily: FontFamily.body, color: Colors.warning },
  folderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  folderDot: { width: 6, height: 6, borderRadius: 3 },
  folderTagText: { fontSize: 10, fontFamily: FontFamily.headingSemiBold },
  deleteBtn: { paddingLeft: Spacing.sm, flexShrink: 0 },
  deleteIcon: { fontSize: 13, color: Colors.textMuted },
});

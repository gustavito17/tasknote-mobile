import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import type { UserCategory } from '../storage';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleStatus: () => void;
  category?: UserCategory;
}

function parseDateBadge(description: string | null): { date: string | null; text: string } {
  if (!description) return { date: null, text: '' };
  const match = description.match(/^📅 (.+?)\n([\s\S]*)$/);
  if (match) return { date: match[1], text: match[2].trim() };
  return { date: null, text: description };
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function TaskCardComponent({ task, onPress, onToggleStatus, category }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const { date, text } = parseDateBadge(task.description);

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.containerCompleted]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Checkbox circle — tap to toggle */}
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={onToggleStatus}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
            {task.title}
          </Text>
          {isToday(task.createdAt) && !isCompleted && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>hoy</Text>
            </View>
          )}
        </View>

        {text ? (
          <Text style={[styles.description, isCompleted && styles.descriptionCompleted]} numberOfLines={2}>
            {text}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {date ? (
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>📅 {date}</Text>
            </View>
          ) : null}
          {category ? (
            <View style={[styles.categoryBadge, { backgroundColor: category.color + '28' }]}>
              <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
            </View>
          ) : null}
          <Text style={styles.dateCreated}>
            {new Date(task.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const TaskCard = memo(TaskCardComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'flex-start',
  },
  containerCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  checkboxCompleted: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: FontFamily.headingBold,
  },
  content: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  todayBadge: {
    backgroundColor: Colors.secondary + '20',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  todayBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
    marginBottom: 6,
    lineHeight: 18,
  },
  descriptionCompleted: { opacity: 0.7 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  dateBadge: {
    backgroundColor: Colors.warning + '20',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dateBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    color: Colors.warning,
  },
  categoryBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.headingSemiBold,
    letterSpacing: 0.3,
  },
  dateCreated: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
});

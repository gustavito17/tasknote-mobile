import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task, TaskStatus } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleStatus: () => void;
  category?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  trabajo: '#4FC3F7',
  personal: '#CE93D8',
  urgente: '#EF9A9A',
};

function parseDateBadge(description: string | null): { date: string | null; text: string } {
  if (!description) return { date: null, text: '' };
  const match = description.match(/^📅 (.+?)\n?([\s\S]*)$/);
  if (match) return { date: match[1], text: match[2].trim() };
  return { date: null, text: description };
}

function TaskCardComponent({ task, onPress, onToggleStatus, category }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const { date, text } = parseDateBadge(task.description);

  const isToday = (() => {
    const today = new Date().toDateString();
    return new Date(task.createdAt).toDateString() === today;
  })();

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.containerCompleted]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={onToggleStatus}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {isToday && !isCompleted && (
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
            <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[category] + '22' }]}>
              <Text style={[styles.categoryText, { color: CATEGORY_COLORS[category] }]}>
                {category}
              </Text>
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
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: FontFamily.headingBold,
  },
  content: {
    flex: 1,
  },
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
    backgroundColor: Colors.secondary + '22',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
  descriptionCompleted: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  dateBadge: {
    backgroundColor: Colors.warning + '22',
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

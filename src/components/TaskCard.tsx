import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import { UserCategory } from '../storage';

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

function SwipeAction({
  progress,
  isCompleted,
  onToggle,
}: {
  progress: SharedValue<number>;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.7, 1]) }],
  }));

  return (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: isCompleted ? Colors.warning + 'CC' : Colors.secondary + 'CC' }]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Animated.Text style={[styles.swipeActionText, animStyle]}>
        {isCompleted ? '↩ Reabrir' : '✓ Listo'}
      </Animated.Text>
    </TouchableOpacity>
  );
}

function TaskCardComponent({ task, onPress, onToggleStatus, category }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const { date, text } = parseDateBadge(task.description);
  const swipeRef = useRef<Swipeable>(null);

  const handleToggle = () => {
    swipeRef.current?.close();
    onToggleStatus();
  };

  const renderRightActions = (progress: SharedValue<number>) => (
    <SwipeAction progress={progress} isCompleted={isCompleted} onToggle={handleToggle} />
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.container, isCompleted && styles.containerCompleted]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Status dot */}
        <View style={[styles.statusDot, isCompleted && styles.statusDotCompleted]} />

        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, isCompleted && styles.titleCompleted]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {isToday(task.createdAt) && !isCompleted && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>hoy</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {text ? (
            <Text
              style={[styles.description, isCompleted && styles.descriptionCompleted]}
              numberOfLines={2}
            >
              {text}
            </Text>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            {date ? (
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>📅 {date}</Text>
              </View>
            ) : null}
            {category ? (
              <View style={[styles.categoryBadge, { backgroundColor: category.color + '28' }]}>
                <Text style={[styles.categoryText, { color: category.color }]}>
                  {category.label}
                </Text>
              </View>
            ) : null}
            <Text style={styles.dateCreated}>
              {new Date(task.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>

        {/* Swipe hint arrow */}
        <Text style={styles.swipeHint}>‹</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

export const TaskCard = memo(TaskCardComponent);

const styles = StyleSheet.create({
  swipeAction: {
    width: 100,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  swipeActionText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: FontSize.sm,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
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
    opacity: 0.55,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginRight: Spacing.sm,
    marginTop: 6,
  },
  statusDotCompleted: {
    backgroundColor: Colors.textMuted,
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
  descriptionCompleted: {
    opacity: 0.7,
  },
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
  swipeHint: {
    color: Colors.textMuted,
    fontSize: 18,
    marginLeft: Spacing.xs,
    marginTop: 2,
    opacity: 0.5,
  },
});

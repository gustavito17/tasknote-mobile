import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loading } from '../components';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';

type FolderDetailProps = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { categoryId: string; categoryLabel: string; categoryColor: string } };
};

function parseDateBadge(description: string | null): { date: string | null; text: string } {
  if (!description) return { date: null, text: '' };
  const match = description.match(/^📅 (.+?)\n([\s\S]*)$/);
  if (match) return { date: match[1], text: match[2].trim() };
  return { date: null, text: description };
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const isCompleted = task.status === 'completed';
  const { date, text } = parseDateBadge(task.description);

  return (
    // Tap anywhere on row = toggle
    <TouchableOpacity style={[styles.row, isCompleted && styles.rowCompleted]} onPress={onToggle} activeOpacity={0.75}>
      {/* Checkbox */}
      <View style={[styles.checkbox, isCompleted && styles.checkboxDone]}>
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, isCompleted && styles.rowTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        {text ? <Text style={styles.rowDesc} numberOfLines={1}>{text}</Text> : null}
        {date ? <Text style={styles.rowDate}>📅 {date}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export function FolderDetailScreen({ navigation, route }: FolderDetailProps) {
  const { categoryId, categoryLabel, categoryColor } = route.params;
  const { tasks, isLoading, fetchTasks, updateTaskStatus } = useTasks();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    fetchTasks({ limit: 100 } as any);
    const map = await storage.getTaskCategoryMap();
    setCategoryMap(map);
  }, [fetchTasks]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleToggle = useCallback((task: Task) => {
    updateTaskStatus(task.id, task.status === 'pending' ? 'completed' : 'pending');
  }, [updateTaskStatus]);

  const folderTasks = tasks.filter((t) =>
    categoryId === '__none__' ? !categoryMap[t.id] : categoryMap[t.id] === categoryId
  );

  const pending = folderTasks.filter((t) => t.status === 'pending');
  const completed = folderTasks.filter((t) => t.status === 'completed');

  const sections: Task[] = [...pending, ...completed];

  if (isLoading === 'loading' && tasks.length === 0) {
    return <Loading message="Cargando..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerDot, { backgroundColor: categoryColor }]} />
          <Text style={styles.headerTitle}>{categoryLabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateTask', { categoryId })}
        >
          <Text style={styles.createBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{pending.length} pendiente{pending.length !== 1 ? 's' : ''}</Text>
        <Text style={styles.statDivider}>·</Text>
        <Text style={styles.statText}>{completed.length} completada{completed.length !== 1 ? 's' : ''}</Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin tareas</Text>
          <Text style={styles.emptyText}>Toca + para agregar una tarea a esta carpeta</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TaskRow task={item} onToggle={() => handleToggle(item)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.sm, marginRight: Spacing.xs },
  backText: { fontSize: 28, color: Colors.secondary, fontFamily: FontFamily.headingBold, lineHeight: 30 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
  createBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
  },
  createBtnText: { fontSize: 22, fontFamily: FontFamily.headingBold, color: Colors.primary, lineHeight: 25 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
  },
  statText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted },
  statDivider: { color: Colors.divider },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.xs },
  // Task row
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.surface, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md, marginVertical: 2,
  },
  rowCompleted: { opacity: 0.5 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm, marginTop: 1,
  },
  checkboxDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  checkmark: { color: Colors.primary, fontSize: 13, fontFamily: FontFamily.headingBold },
  rowContent: { flex: 1 },
  rowTitle: {
    fontSize: FontSize.md, fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary, marginBottom: 2,
  },
  rowTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  rowDesc: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted },
  rowDate: { fontSize: FontSize.xs, fontFamily: FontFamily.body, color: Colors.warning, marginTop: 2 },
  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted, textAlign: 'center' },
});

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loading } from '../components';
import { TaskRow } from '../components/TaskRow';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage from '../storage';

type FolderDetailProps = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { categoryId: string; categoryLabel: string; categoryColor: string } };
};

export function FolderDetailScreen({ navigation, route }: FolderDetailProps) {
  const { categoryId, categoryLabel, categoryColor } = route.params;
  const { tasks, isLoading, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // Tasks already in context from HomeScreen fetch — only reload local storage
    const map = await storage.getTaskCategoryMap();
    setCategoryMap(map);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchTasks({ limit: 100 } as any);
    await loadData();
    setRefreshing(false);
  }, [fetchTasks, loadData]);

  const handleToggle = useCallback((task: Task) => {
    updateTaskStatus(task.id, task.status === 'pending' ? 'completed' : 'pending');
  }, [updateTaskStatus]);

  const handleDelete = useCallback(async (task: Task) => {
    await deleteTask(task.id);
    await storage.setTaskCategory(task.id, null);
  }, [deleteTask]);

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

      {/* Stats */}
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
            <TaskRow
              task={item}
              onToggle={() => handleToggle(item)}
              onDelete={() => handleDelete(item)}
            />
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
    paddingHorizontal: Spacing.md, paddingTop: Spacing.xxl, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  backText: {
    fontSize: 22, color: Colors.secondary,
    fontFamily: FontFamily.headingBold,
    includeFontPadding: false, textAlignVertical: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
  createBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
  },
  createBtnText: {
    fontSize: 22, fontFamily: FontFamily.headingBold, color: Colors.primary,
    includeFontPadding: false, textAlignVertical: 'center',
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
  },
  statText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted },
  statDivider: { color: Colors.divider },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted, textAlign: 'center' },
});

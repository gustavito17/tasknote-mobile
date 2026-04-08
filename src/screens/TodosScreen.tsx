import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Loading } from '../components';
import { TaskRow, FolderTag } from '../components/TaskRow';
import { useTasks } from '../context';
import { Task } from '../types';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../theme';
import storage, { UserCategory } from '../storage';

export function TodosScreen() {
  const { tasks, isLoading, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    fetchTasks({ limit: 200 } as any);
    const [map, cats] = await Promise.all([
      storage.getTaskCategoryMap(),
      storage.getUserCategories(),
    ]);
    setCategoryMap(map);
    setUserCategories(cats);
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

  const handleDelete = useCallback(async (task: Task) => {
    await deleteTask(task.id);
    await storage.setTaskCategory(task.id, null);
  }, [deleteTask]);

  const getFolderTag = (task: Task): FolderTag | undefined => {
    const catId = categoryMap[task.id];
    if (!catId) return undefined;
    const cat = userCategories.find((c) => c.id === catId);
    return cat ? { label: cat.label, color: cat.color } : undefined;
  };

  // pending first, completed last
  const pending = tasks.filter((t) => t.status === 'pending');
  const completed = tasks.filter((t) => t.status === 'completed');
  const sorted = [...pending, ...completed];

  if (isLoading === 'loading' && tasks.length === 0) {
    return <Loading message="Cargando..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Todas las tareas</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pending.length} pendientes</Text>
        </View>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin tareas</Text>
          <Text style={styles.emptyText}>Crea tareas desde una carpeta</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
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
              folderTag={getFolderTag(item)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary + '20',
    borderWidth: 1,
    borderColor: Colors.secondary + '50',
  },
  countText: { fontSize: FontSize.xs, fontFamily: FontFamily.headingSemiBold, color: Colors.secondary },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  separator: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.headingBold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.body, color: Colors.textMuted, textAlign: 'center' },
});
